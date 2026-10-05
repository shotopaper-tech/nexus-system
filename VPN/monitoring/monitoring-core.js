class NexusMonitoringCore {
    constructor() {
        this.running = false;
        this.startedAt = null;
        this.samples = [];
        this.traffic = {
            upload: 0,
            download: 0
        };
    }

    start() {
        if (this.running) {
            return false;
        }

        this.running = true;
        this.startedAt = Date.now();

        return true;
    }

    stop() {
        this.running = false;

        return true;
    }

    recordSample(data) {
        if (!data) {
            return false;
        }

        this.samples.push({
            timestamp: Date.now(),
            latency: data.latency ?? null,
            packetLoss: data.packetLoss ?? null,
            serverLoad: data.serverLoad ?? null
        });

        if (this.samples.length > 100) {
            this.samples.shift();
        }

        return true;
    }

    recordTraffic(upload, download) {
        this.traffic.upload = upload ?? this.traffic.upload;
        this.traffic.download = download ?? this.traffic.download;
    }

    getLatestSample() {
        return this.samples.length
            ? this.samples[this.samples.length - 1]
            : null;
    }

    getUptime() {
        if (!this.running || !this.startedAt) {
            return 0;
        }

        return Date.now() - this.startedAt;
    }

    getStatus() {
        return {
            running: this.running,
            uptime: this.getUptime(),
            latest: this.getLatestSample(),
            traffic: { ...this.traffic }
        };
    }

    reset() {
        this.samples = [];
        this.traffic = {
            upload: 0,
            download: 0
        };
        this.startedAt = null;
        this.running = false;
    }
}

window.NexusMonitoringCore = NexusMonitoringCore;
