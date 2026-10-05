class NexusRuntime {
    constructor() {
        this.connection = new NexusConnectionCore();
        this.wireguard = new NexusWireGuardAdapter();

        this.serverManager = new NexusServerManager();
        this.healthChecker = new NexusHealthChecker();
        this.failover = new NexusFailoverManager(this.serverManager);

        this.security = new NexusSecurityLayer();
        this.monitoring = new NexusMonitoringCore();

        this.gatewayConfig = new NexusGatewayConfig();
        this.gatewayRegistry = new NexusGatewayRegistry(this.gatewayConfig);

        this.deviceKeys = new NexusDeviceKeyManager();

        this.state = "idle";
        this.activeServer = null;
        this.activeGateway = null;
    }

    async initialize() {
        await this.deviceKeys.initialize();

        return {
            state: this.state,
            device: this.deviceKeys.getIdentity()
        };
    }

    registerGateway(gateway) {
        const registered = this.gatewayRegistry.register(gateway);

        this.serverManager.addServer({
            id: registered.id,
            name: registered.name,
            location: registered.location,
            endpoint: registered.endpoint,
            protocol: registered.protocol,
            healthEndpoint: registered.healthEndpoint
        });

        return registered;
    }

    async checkServers() {
        const servers = this.serverManager.getServers();

        return this.healthChecker.checkAll(servers);
    }

    updateHealth(results) {
        results.forEach(result => {
            this.serverManager.updateHealth(result.serverId, result);
        });

        return this.serverManager.getServers();
    }

    selectBestServer() {
        const server = this.serverManager.selectBestServer();

        if (!server) {
            throw new Error("No available VPN server");
        }

        this.activeServer = server;
        this.failover.setActiveServer(server);

        return server;
    }

    async connect(configuration = null) {
        if (this.state === "connecting" || this.state === "connected") {
            return false;
        }

        this.state = "connecting";

        try {
            const server = this.selectBestServer();

            this.activeGateway = this.gatewayRegistry.get(server.id);

            if (!this.activeGateway) {
                throw new Error("Gateway configuration not found");
            }

            if (configuration) {
                this.wireguard.configure({
                    ...configuration,
                    endpoint: configuration.endpoint || server.endpoint
                });
            }

            this.security.setDeviceIdentity(
                this.deviceKeys.getIdentity()
            );

            this.security.enable();

            await this.wireguard.connect();
            await this.connection.connect(server);

            this.monitoring.start();

            this.state = "connected";

            return true;
        } catch (error) {
            this.state = "error";
            throw error;
        }
    }

    async disconnect() {
        if (this.state === "idle") {
            return true;
        }

        this.state = "disconnecting";

        try {
            await this.connection.disconnect();
            await this.wireguard.disconnect();

            this.monitoring.stop();
            this.security.disable();

            this.activeServer = null;
            this.activeGateway = null;

            this.state = "idle";

            return true;
        } catch (error) {
            this.state = "error";
            throw error;
        }
    }

    async failoverToNextServer() {
        const nextServer = this.failover.getNextServer();

        if (!nextServer) {
            this.state = "error";
            throw new Error("No fallback server available");
        }

        await this.disconnect();

        this.activeServer = nextServer;
        this.failover.setActiveServer(nextServer);

        return this.connect();
    }

    rotateDeviceKey() {
        return this.deviceKeys.rotateKey();
    }

    getState() {
        return this.state;
    }

    getActiveServer() {
        return this.activeServer;
    }

    getActiveGateway() {
        return this.activeGateway;
    }

    getSecurityStatus() {
        return this.security.getStatus();
    }

    getMonitoringStatus() {
        return this.monitoring.getStatus();
    }

    getDeviceIdentity() {
        return this.deviceKeys.getIdentity();
    }
}

window.NexusRuntime = NexusRuntime;
