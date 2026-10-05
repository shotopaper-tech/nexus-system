class NexusSecurityLayer {
    constructor() {
        this.killSwitch = false;
        this.dnsProtection = false;
        this.ipv6Protection = false;
        this.deviceIdentity = null;
        this.state = "inactive";
    }

    enable() {
        this.killSwitch = true;
        this.dnsProtection = true;
        this.ipv6Protection = true;
        this.state = "active";

        return this.getStatus();
    }

    disable() {
        this.killSwitch = false;
        this.dnsProtection = false;
        this.ipv6Protection = false;
        this.state = "inactive";

        return this.getStatus();
    }

    setDeviceIdentity(identity) {
        if (!identity) {
            throw new Error("Device identity is required");
        }

        this.deviceIdentity = identity;

        return true;
    }

    getStatus() {
        return {
            state: this.state,
            killSwitch: this.killSwitch,
            dnsProtection: this.dnsProtection,
            ipv6Protection: this.ipv6Protection,
            deviceIdentity: Boolean(this.deviceIdentity)
        };
    }

    isActive() {
        return this.state === "active";
    }
}

window.NexusSecurityLayer = NexusSecurityLayer;
