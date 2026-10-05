class NexusGatewayRegistry {
    constructor(config) {
        this.config = config;
        this.activeGateway = null;
    }

    register(gateway) {
        return this.config.register(gateway);
    }

    remove(gatewayId) {
        if (this.activeGateway?.id === gatewayId) {
            this.activeGateway = null;
        }

        return this.config.remove(gatewayId);
    }

    select(gatewayId) {
        const gateway = this.config.get(gatewayId);

        if (!gateway) {
            throw new Error("Gateway not found");
        }

        this.activeGateway = gateway;

        return gateway;
    }

    get(gatewayId) {
        return this.config.get(gatewayId);
    }

    getAll() {
        return this.config.getAll();
    }

    getActive() {
        return this.activeGateway;
    }

    clear() {
        this.activeGateway = null;
        this.config.clear();
    }
}

window.NexusGatewayRegistry = NexusGatewayRegistry;
