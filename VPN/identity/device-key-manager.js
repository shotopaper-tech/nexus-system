class NexusDeviceKeyManager {
    constructor() {
        this.deviceId = null;
        this.keyId = null;
        this.createdAt = null;
    }

    async initialize() {
        if (this.deviceId && this.keyId) {
            return this.getIdentity();
        }

        this.deviceId = crypto.randomUUID();
        this.keyId = crypto.randomUUID();
        this.createdAt = Date.now();

        return this.getIdentity();
    }

    getIdentity() {
        return {
            deviceId: this.deviceId,
            keyId: this.keyId,
            createdAt: this.createdAt
        };
    }

    hasIdentity() {
        return Boolean(this.deviceId && this.keyId);
    }

    rotateKey() {
        if (!this.deviceId) {
            throw new Error("Device identity is not initialized");
        }

        this.keyId = crypto.randomUUID();
        this.createdAt = Date.now();

        return this.getIdentity();
    }

    revoke() {
        this.keyId = null;
        this.createdAt = null;
    }

    reset() {
        this.deviceId = null;
        this.keyId = null;
        this.createdAt = null;
    }
}

window.NexusDeviceKeyManager = NexusDeviceKeyManager;
