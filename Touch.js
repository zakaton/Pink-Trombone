class Touch {
    constructor() {
        this.startTime = null; // some global "time" object
        this.fricative_intensity = 0;
        this.endTime = 0;
        this.alive = true;
        this.id = "mouse"+Math.random();
        
        this.x = null;
        this.y = null;

        this.index = null;
        this.diameter = null;
    }
}

export default Touch;