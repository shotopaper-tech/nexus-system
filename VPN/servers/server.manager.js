class NexusServerManager {
    constructor() {
        this.servers = [];
        this.activeServer = null;
    }

    addServer(server) {
        if (!server || !server.id) {
            throw new Error("Invalid server configuration");
        }

        this.servers.push({
            id: server.id,
            name: server.name || server.id,
            location: server.location || "Unknown",
            endpoint: server.endpoint || null,
            protocol: server.protocol || "WireGuard",
            latency: null,
            load: null,
            packetLoss: null,
            reliability: 0,
            status: "unknown"
        });
    }

    removeServer(serverId) {
        this.servers = this.servers.filter(
            server => server.id !== serverId
        );

        if (this.activeServer?.id === serverId) {
            this.activeServer = null;
        }
    }

    updateHealth(serverId, health) {
        const server = this.getServer(serverId);

        if (!server) {
            return false;
        }

        server.latency = health.latency ?? server.latency;
        server.load = health.load ?? server.load;
        server.packetLoss = health.packetLoss ?? server.packetLoss;
        server.reliability = health.reliability ?? server.reliability;
        server.status = health.status || server.status;

        return true;
    }

    getServer(serverId) {
        return this.servers.find(
            server => server.id === serverId
        ) || null;
    }

    getServers() {
        return [...this.servers];
    }

    selectBestServer() {
        const available = this.servers.filter(
            server => server.status !== "offline"
        );

        if (!available.length) {
            return null;
        }

        const scored = available.map(server => ({
            server,
            score: this.calculateScore(server)
        }));

        scored.sort((a, b) => b.score - a.score);

        this.activeServer = scored[0].server;

        return this.activeServer;
    }

    calculateScore(server) {
        const latency = server.latency ?? 999;
        const load = server.load ?? 100;
        const packetLoss = server.packetLoss ?? 100;
        const reliability = server.reliability ?? 0;

        return (
            Math.max(0, 100 - latency) * 0.35 +
            Math.max(0, 100 - load) * 0.25 +
            Math.max(0, 100 - packetLoss) * 0.25 +
            reliability * 0.15
        );
    }

    getActiveServer() {
        return this.activeServer;
    }
}

window.NexusServerManager = NexusServerManager;
