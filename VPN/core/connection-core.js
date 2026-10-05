class NexusConnectionCore {
    constructor() {
        this.state = "disconnected";
        this.server = null;
        this.error = null;
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        this.listeners[event].push(callback);
    }

    emit(event, data = null) {
        const callbacks = this.listeners[event] || [];

        callbacks.forEach(callback => {
            callback(data);
        });
    }

    setState(state, data = null) {
        this.state = state;

        if (state === "error") {
            this.error = data;
        } else {
            this.error = null;
        }

        this.emit("state", {
            state: this.state,
            data
        });
    }

    async connect(server) {
        if (this.state === "connecting" || this.state === "connected") {
            return false;
        }

        if (!server) {
            this.setState("error", "No VPN server selected");
            return false;
        }

        this.server = server;
        this.setState("connecting");

        try {
            await this.prepareConnection(server);

            this.setState("connected", {
                server: this.server
            });

            this.emit("connected", this.server);

            return true;
        } catch (error) {
            this.setState("error", error.message);
            this.emit("error", error);

            return false;
        }
    }

    async disconnect() {
        if (this.state === "disconnected") {
            return true;
        }

        this.setState("disconnecting");

        try {
            await this.closeConnection();

            this.server = null;
            this.setState("disconnected");
            this.emit("disconnected");

            return true;
        } catch (error) {
            this.setState("error", error.message);
            this.emit("error", error);

            return false;
        }
    }

    async prepareConnection(server) {
        if (!server) {
            throw new Error("Invalid VPN server");
        }
    }

    async closeConnection() {
        return true;
    }

    getState() {
        return this.state;
    }

    getServer() {
        return this.server;
    }

    isConnected() {
        return this.state === "connected";
    }
}

window.NexusConnectionCore = NexusConnectionCore;
