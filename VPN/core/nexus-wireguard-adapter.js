class NexusWireGuardAdapter {
    constructor() {
        this.state = "disconnected";
        this.configuration = null;
    }

    configure(configuration) {
        if (!configuration) {
            throw new Error("WireGuard configuration is required");
        }

        this.configuration = {
            privateKey: configuration.privateKey || null,
            publicKey: configuration.publicKey || null,
            endpoint: configuration.endpoint || null,
            address: configuration.address || null,
            dns: configuration.dns || [],
            allowedIPs: configuration.allowedIPs || ["0.0.0.0/0", "::/0"],
            keepalive: configuration.keepalive || 25
        };

        return true;
    }

    async connect() {
        if (!this.configuration) {
            throw new Error("WireGuard is not configured");
        }

        this.state = "connecting";

        try {
            await this.initialize();

            this.state = "connected";

            return true;
        } catch (error) {
            this.state = "error";
            throw error;
        }
    }

    async disconnect() {
        if (this.state === "disconnected") {
            return true;
        }

        this.state = "disconnecting";

        await this.shutdown();

        this.state = "disconnected";

        return true;
    }

    async initialize() {
        return true;
    }

    async shutdown() {
        return true;
    }

    getState() {
        return this.state;
    }

    isConnected() {
        return this.state === "connected";
    }

    getConfiguration() {
        return this.configuration;
    }
}

window.NexusWireGuardAdapter = NexusWireGuardAdapter;
