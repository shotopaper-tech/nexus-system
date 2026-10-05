const connectionCore = new NexusConnectionCore();

const connectButton = document.getElementById("connectButton");
const connectionStatus = document.getElementById("connectionStatus");

const publicIp = document.getElementById("publicIp");
const locationElement = document.getElementById("location");
const protocol = document.getElementById("protocol");
const latency = document.getElementById("latency");
const serverName = document.getElementById("serverName");
const serverLoad = document.getElementById("serverLoad");
const packetLoss = document.getElementById("packetLoss");
const protectionStatus = document.getElementById("protectionStatus");

const server = {
    id: "nexus-gateway-01",
    name: "Nexus Gateway 01",
    location: "Singapore",
    protocol: "WireGuard",
    latency: 24,
    load: 18,
    packetLoss: 0
};

const defaultData = {
    publicIp: "Not protected",
    location: "Unknown",
    protocol: "WireGuard",
    latency: "--",
    serverName: "No connection",
    serverLoad: "--",
    packetLoss: "--",
    protection: "INACTIVE"
};

function updateElement(element, value) {
    if (element) {
        element.textContent = value;
    }
}

function updateDashboard(data) {
    updateElement(publicIp, data.publicIp);
    updateElement(locationElement, data.location);
    updateElement(protocol, data.protocol);
    updateElement(latency, data.latency);
    updateElement(serverName, data.serverName);
    updateElement(serverLoad, data.serverLoad);
    updateElement(packetLoss, data.packetLoss);
    updateElement(protectionStatus, data.protection);
}

function setStatus(state) {
    const labels = {
        disconnected: "DISCONNECTED",
        connecting: "CONNECTING",
        connected: "CONNECTED",
        disconnecting: "DISCONNECTING",
        error: "ERROR"
    };

    updateElement(
        connectionStatus,
        labels[state] || "UNKNOWN"
    );

    if (connectButton) {
        connectButton.disabled =
            state === "connecting" ||
            state === "disconnecting";

        if (state === "connected") {
            connectButton.textContent = "DISCONNECT";
            connectButton.classList.add("connected");
        } else {
            connectButton.textContent = "CONNECT";
            connectButton.classList.remove("connected");
        }
    }
}

connectionCore.on("state", event => {
    setStatus(event.state);

    if (event.state === "connecting") {
        updateDashboard({
            publicIp: "Connecting...",
            location: server.location,
            protocol: server.protocol,
            latency: "--",
            serverName: server.name,
            serverLoad: "--",
            packetLoss: "--",
            protection: "STARTING"
        });
    }

    if (event.state === "error") {
        updateDashboard({
            ...defaultData,
            protection: "ERROR"
        });
    }
});

connectionCore.on("connected", connectedServer => {
    updateDashboard({
        publicIp: "Protected",
        location: connectedServer.location,
        protocol: connectedServer.protocol,
        latency: `${connectedServer.latency} ms`,
        serverName: connectedServer.name,
        serverLoad: `${connectedServer.load}%`,
        packetLoss: `${connectedServer.packetLoss}%`,
        protection: "ACTIVE"
    });
});

connectionCore.on("disconnected", () => {
    updateDashboard(defaultData);
});

if (connectButton) {
    connectButton.addEventListener("click", async () => {
        if (connectionCore.isConnected()) {
            await connectionCore.disconnect();
        } else {
            await connectionCore.connect(server);
        }
    });
}

updateDashboard(defaultData);
setStatus(connectionCore.getState());
