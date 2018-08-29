class AccessPoint {
    constructor(options) {
        this.ssid = options.ssid;
        this.centre = options.centre;
        this.radius = options.radius;
        this.speed = options.speed; // in MiB per second
        this.jitter = options.jitter;
        this.encryption = options.encryption;
        this.password = options.password;
    }

    isInRange(point) {
        return point.distanceTo(this.centre) <= this.radius;
    }
}
