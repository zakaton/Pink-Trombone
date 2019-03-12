class Transient {
    constructor(position) {
        this.position = position;
        this.timeAlive = 0;
        this.lifeTime = 0.2;
        this.strength = 0.3;
        this.exponent = 200;
    }

    get amplitude() {
        return this.strength * Math.pow(2, -this.exponent * this.timeAlive);
    }

    get isAlive() {
        return this.timeAlive > this.lifeTime;
    }
}

export default Transient;