class NexusFailoverManager {
    constructor(serverManager) {
        this.serverManager = serverManager;
        this.activeServer = null;
        this.maxAttempts = 3;
        this.attempts = 0;
    }

    setActiveServer(server) {
        this.activeServer = server;
        this.attempts = 0;
    }

    shouldFailover(server) {
        if (!server) {
            return true;
        }

        if (server.status === "offline") {
            return true;
        }

        if (server.packetLoss !== null && server.packetLoss >= 20) {
            return true;
        }

        if (server.latency !== null && server.latency >= 500) {
            return true;
        }

        return false;
    }

    selectFallback() {
        const servers = this.serverManager.getServers();

        const candidates = servers.filter(server => {
            if (!this.activeServer) {
                return server.status !== "offline";
            }

            return (
                server.id !== this.activeServer.id &&
                server.status !== "offline"
            );
        });

        if (!candidates.length) {
            return null;
        }

        candidates.sort((a, b) => {
            const scoreA = this.serverManager.calculateScore(a);
            const scoreB = this.serverManager.calculateScore(b);

            return scoreB - scoreA;
        });

        return candidates[0];
    }

    getNextServer() {
        if (this.attempts >= this.maxAttempts) {
            return null;
        }

        const server = this.selectFallback();

        if (server) {
            this.attempts++;
            this.activeServer = server;
        }

        return server;
    }

    reset() {
        this.activeServer = null;
        this.attempts = 0;
    }
}

window.NexusFailoverManager = NexusFailoverManager;
