class NexusGatewayConfig {
    constructor() {
        this.gateways = new Map();
    }

    register(gateway) {
        if (!gateway || !gateway.id || !gateway.endpoint) {
            throw new Error("Invalid gateway configuration");
        }

        const config = {
            id: gateway.id,
            name: gateway.name || gateway.id,
            location: gateway.location || "Unknown",
            endpoint: gateway.endpoint,
            publicKey: gateway.publicKey || null,
            protocol: gateway.protocol || "WireGuard",
            port: gateway.port || 51820,
            healthEndpoint: gateway.healthEndpoint || null,
            allowedIPs: gateway.allowedIPs || ["0.0.0.0/0", "::/0"],
            dns: gateway.dns || [],
            keepalive: gateway.keepalive || 25
        };

        this.gateways.set(config.id, config);

        return config;
    }

    remove(gatewayId) {
        return this.gateways.delete(gatewayId);
    }

    get(gatewayId) {
        return this.gateways.get(gatewayId) || null;
    }

    getAll() {
        return Array.from(this.gateways.values());
    }

    has(gatewayId) {
        return this.gateways.has(gatewayId);
    }

    clear() {
        this.gateways.clear();
    }
}

window.NexusGatewayConfig = NexusGatewayConfig;
