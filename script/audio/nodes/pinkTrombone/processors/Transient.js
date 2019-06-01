class Transient {
    constructor(position, seconds) {
        this.position = position;

        this.startTime = seconds;
        this.timeAlive = 0;
        this.lifetime = 0.2;

        this.strength = 0.3;
        this.exponent = 200;
    }

    get amplitude() {
        return this.strength * Math.pow(-2, this.timeAlive * this.exponent);
    }

    get isAlive() {
        return this.timeAlive < this.lifetime;
    }

    update(seconds) {
        this.timeAlive = seconds - this.startTime;
    }
}

export default Transient;