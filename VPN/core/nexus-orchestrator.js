class NexusOrchestrator {
    constructor() {
        this.connection = new NexusConnectionCore();
        this.wireguard = new NexusWireGuardAdapter();
        this.serverManager = new NexusServerManager();
        this.security = new NexusSecurityLayer();
        this.monitoring = new NexusMonitoringCore();

        this.state = "idle";
        this.activeServer = null;
    }

    addServer(server) {
        this.serverManager.addServer(server);
    }

    updateServerHealth(serverId, health) {
        return this.serverManager.updateHealth(serverId, health);
    }

    selectServer() {
        const server = this.serverManager.selectBestServer();

        if (!server) {
            throw new Error("No available VPN server");
        }

        this.activeServer = server;

        return server;
    }

    configureWireGuard(configuration) {
        return this.wireguard.configure(configuration);
    }

    enableSecurity(deviceIdentity = null) {
        if (deviceIdentity) {
            this.security.setDeviceIdentity(deviceIdentity);
        }

        return this.security.enable();
    }

    async connect(configuration = null) {
        if (this.state === "connecting" || this.state === "connected") {
            return false;
        }

        this.state = "connecting";

        try {
            const server = this.selectServer();

            if (configuration) {
                this.configureWireGuard({
                    ...configuration,
                    endpoint: configuration.endpoint || server.endpoint
                });
            }

            this.enableSecurity();

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
            this.state = "idle";

            return true;
        } catch (error) {
            this.state = "error";
            throw error;
        }
    }

    getState() {
        return this.state;
    }

    getActiveServer() {
        return this.activeServer;
    }

    getSecurityStatus() {
        return this.security.getStatus();
    }

    getMonitoringStatus() {
        return this.monitoring.getStatus();
    }

    isConnected() {
        return this.state === "connected";
    }
}

window.NexusOrchestrator = NexusOrchestrator;
