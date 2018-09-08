class AccessPoint {
    constructor(options) {
        this.ssid = options.ssid;
        this.centre = options.centre;
        this.radius = options.radius;
        this.speed = options.speed; // in MiB per second
        this.jitter = options.jitter;
        this.encryption = options.encryption;
        this.password = options.password; // stored as a hash
        this.cost = options.cost; // if purchased, this is set to zero
    }

    isInRange(point) {
        return point.distanceTo(this.centre) <= this.radius;
    }

    speedAt(point, type) {
        if (!['download', 'upload'].includes(type)) {
            throw new Error(`Invalid speed type '${type}'`);
        }

        const distance = point.distanceTo(this.centre);

        // the `+ 0.01` is to prevent division by zero when `distance` is zero
        const calculated = this.speed[type] / ((distance + 0.01) ** 2);

        if (calculated < 0) return 0;

        return calculated;
    }
}
