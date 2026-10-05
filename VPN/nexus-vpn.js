const nexus = new NexusRuntime();

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

const gateways = [
    {
        id: "nexus-gateway-01",
        name: "Nexus Gateway 01",
        location: "Singapore",
        endpoint: "sg1.nexus.gateway",
        protocol: "WireGuard",
        port: 51820,
        healthEndpoint: "https://sg1.nexus.gateway/health"
    }
];

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
        idle: "DISCONNECTED",
        connecting: "CONNECTING",
        connected: "CONNECTED",
        disconnecting: "DISCONNECTING",
        error: "ERROR"
    };

    updateElement(
        connectionStatus,
        labels[state] || "UNKNOWN"
    );

    if (!connectButton) {
        return;
    }

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

function registerGateways() {
    gateways.forEach(gateway => {
        try {
            nexus.registerGateway(gateway);
        } catch (error) {
            console.error("Gateway registration failed:", error);
        }
    });
}

async function initialize() {
    try {
        registerGateways();

        await nexus.initialize();

        setStatus(nexus.getState());
        updateDashboard(defaultData);
    } catch (error) {
        console.error("Nexus initialization failed:", error);

        setStatus("error");

        updateDashboard({
            ...defaultData,
            protection: "ERROR"
        });
    }
}

async function connect() {
    try {
        setStatus("connecting");

        updateDashboard({
            publicIp: "Connecting...",
            location: "Selecting gateway...",
            protocol: "WireGuard",
            latency: "--",
            serverName: "Selecting server...",
            serverLoad: "--",
            packetLoss: "--",
            protection: "STARTING"
        });

        await nexus.connect();

        const server = nexus.getActiveServer();

        updateDashboard({
            publicIp: "Protected",
            location: server?.location || "Unknown",
            protocol: server?.protocol || "WireGuard",
            latency: server?.latency !== null && server?.latency !== undefined
                ? `${server.latency} ms`
                : "--",
            serverName: server?.name || "Nexus Gateway",
            serverLoad: server?.load !== null && server?.load !== undefined
                ? `${server.load}%`
                : "--",
            packetLoss: server?.packetLoss !== null && server?.packetLoss !== undefined
                ? `${server.packetLoss}%`
                : "--",
            protection: nexus.getSecurityStatus().state === "active"
                ? "ACTIVE"
                : "INACTIVE"
        });

        setStatus(nexus.getState());
    } catch (error) {
        console.error("Nexus connection failed:", error);

        setStatus("error");

        updateDashboard({
            ...defaultData,
            protection: "ERROR"
        });
    }
}

async function disconnect() {
    try {
        setStatus("disconnecting");

        await nexus.disconnect();

        updateDashboard(defaultData);
        setStatus(nexus.getState());
    } catch (error) {
        console.error("Nexus disconnect failed:", error);

        setStatus("error");
    }
}

if (connectButton) {
    connectButton.addEventListener("click", async () => {
        if (nexus.isConnected()) {
            await disconnect();
        } else {
            await connect();
        }
    });
}

initialize();
