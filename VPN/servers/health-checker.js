class NexusHealthChecker {
    constructor() {
        this.results = new Map();
        this.running = false;
        this.interval = null;
    }

    async check(server) {
        if (!server || !server.id) {
            throw new Error("Invalid server");
        }

        const started = performance.now();

        try {
            const response = await fetch(server.healthEndpoint, {
                method: "GET",
                cache: "no-store"
            });

            const latency = Math.round(performance.now() - started);

            const result = {
                serverId: server.id,
                latency,
                packetLoss: response.ok ? 0 : 100,
                status: response.ok ? "online" : "offline",
                timestamp: Date.now()
            };

            this.results.set(server.id, result);

            return result;
        } catch (error) {
            const result = {
                serverId: server.id,
                latency: null,
                packetLoss: 100,
                status: "offline",
                timestamp: Date.now()
            };

            this.results.set(server.id, result);

            return result;
        }
    }

    async checkAll(servers) {
        if (!Array.isArray(servers)) {
            throw new Error("Servers must be an array");
        }

        return Promise.all(
            servers.map(server => this.check(server))
        );
    }

    start(servers, interval = 30000, callback = null) {
        if (this.running) {
            return false;
        }

        this.running = true;

        const run = async () => {
            if (!this.running) {
                return;
            }

            const results = await this.checkAll(servers);

            if (callback) {
                callback(results);
            }
        };

        run();

        this.interval = setInterval(run, interval);

        return true;
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = null;
        this.running = false;

        return true;
    }

    getResult(serverId) {
        return this.results.get(serverId) || null;
    }

    getAllResults() {
        return Array.from(this.results.values());
    }

    clear() {
        this.results.clear();
    }
}

window.NexusHealthChecker = NexusHealthChecker;
