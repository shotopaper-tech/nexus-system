const connectButton = document.getElementById("connectButton");
const connectionStatus = document.getElementById("connectionStatus");
const connectionMessage = document.getElementById("connectionMessage");
const statusIndicator = document.getElementById("statusIndicator");

const ipAddress = document.getElementById("ipAddress");
const location = document.getElementById("location");
const latency = document.getElementById("latency");

const serverName = document.getElementById("serverName");
const serverStatus = document.getElementById("serverStatus");
const serverRegion = document.getElementById("serverRegion");
const serverLoad = document.getElementById("serverLoad");
const packetLoss = document.getElementById("packetLoss");

const protectionStatus = document.getElementById("protectionStatus");
const killSwitchStatus = document.getElementById("killSwitchStatus");
const dnsStatus = document.getElementById("dnsStatus");
const ipv6Status = document.getElementById("ipv6Status");
const deviceKeyStatus = document.getElementById("deviceKeyStatus");

const connectionPanel = document.querySelector(".connection-panel");

let connected = false;
let connecting = false;

const defaultState = {
    ip: "--",
    location: "--",
    latency: "-- ms",
    server: "No server selected",
    serverStatus: "OFFLINE",
    region: "--",
    load: "--",
    packetLoss: "--",
    protection: "READY",
    killSwitch: "READY",
    dns: "READY",
    ipv6: "READY",
    deviceKey: "READY"
};

function resetInterface() {
    ipAddress.textContent = defaultState.ip;
    location.textContent = defaultState.location;
    latency.textContent = defaultState.latency;

    serverName.textContent = defaultState.server;
    serverStatus.textContent = defaultState.serverStatus;
    serverRegion.textContent = defaultState.region;
    serverLoad.textContent = defaultState.load;
    packetLoss.textContent = defaultState.packetLoss;

    protectionStatus.textContent = defaultState.protection;
    killSwitchStatus.textContent = defaultState.killSwitch;
    dnsStatus.textContent = defaultState.dns;
    ipv6Status.textContent = defaultState.ipv6;
    deviceKeyStatus.textContent = defaultState.deviceKey;
}

function setConnectingState() {
    connecting = true;

    connectionStatus.textContent = "CONNECTING";
    connectionMessage.textContent = "Establishing secure tunnel...";
    connectButton.querySelector(".connect-label").textContent = "CONNECTING";

    serverStatus.textContent = "CHECKING";
}

function setConnectedState() {
    connected = true;
    connecting = false;

    connectionStatus.textContent = "CONNECTED";
    connectionMessage.textContent = "Your connection is protected.";
    connectButton.querySelector(".connect-label").textContent = "DISCONNECT";

    connectionPanel.classList.add("connected");

    ipAddress.textContent = "Protected";
    location.textContent = "Nexus Network";
    latency.textContent = "24 ms";

    serverName.textContent = "Nexus Gateway 01";
    serverStatus.textContent = "ONLINE";
    serverRegion.textContent = "Singapore";
    serverLoad.textContent = "18%";
    packetLoss.textContent = "0%";

    protectionStatus.textContent = "ACTIVE";
    killSwitchStatus.textContent = "ACTIVE";
    dnsStatus.textContent = "ACTIVE";
    ipv6Status.textContent = "ACTIVE";
    deviceKeyStatus.textContent = "ACTIVE";
}

function setDisconnectedState() {
    connected = false;
    connecting = false;

    connectionStatus.textContent = "DISCONNECTED";
    connectionMessage.textContent = "Your connection is currently unprotected.";
    connectButton.querySelector(".connect-label").textContent = "CONNECT";

    connectionPanel.classList.remove("connected");

    resetInterface();
}

function connect() {
    if (connecting) {
        return;
    }

    setConnectingState();

    setTimeout(() => {
        setConnectedState();
    }, 1000);
}

function disconnect() {
    setDisconnectedState();
}

connectButton.addEventListener("click", () => {
    if (connected) {
        disconnect();
    } else {
        connect();
    }
});

resetInterface();
