const connectionCore = new NexusConnectionCore();

const connectButton = document.getElementById("connectButton");
const connectionStatus = document.getElementById("connectionStatus");

const server = {
    id: "nexus-gateway-01",
    name: "Nexus Gateway 01",
    location: "Singapore",
    protocol: "WireGuard"
};

function updateStatus(state) {
    const states = {
        disconnected: "DISCONNECTED",
        connecting: "CONNECTING",
        connected: "CONNECTED",
        disconnecting: "DISCONNECTING",
        error: "ERROR"
    };

    connectionStatus.textContent = states[state] || "UNKNOWN";
}

connectionCore.on("state", event => {
    updateStatus(event.state);
});

connectionCore.on("connected", server => {
    connectButton.textContent = "DISCONNECT";
    connectButton.classList.add("connected");
});

connectionCore.on("disconnected", () => {
    connectButton.textContent = "CONNECT";
    connectButton.classList.remove("connected");
});

connectButton.addEventListener("click", async () => {
    if (connectionCore.isConnected()) {
        await connectionCore.disconnect();
        return;
    }

    await connectionCore.connect(server);
});

updateStatus(connectionCore.getState());
