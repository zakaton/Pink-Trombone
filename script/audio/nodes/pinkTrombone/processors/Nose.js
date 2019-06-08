/*
    TODO
        *
*/

class Nose {
    constructor(tract) {
        this.length = Math.floor(28 * tract.length / 44);

        this.start = tract.length - this.length + 1;

        this.fade = 1;
        this.offset = 0.8;

        this.left = new Float64Array(this.length);
            this.left.junction = new Float64Array(this.length+1);
        this.right = new Float64Array(this.length);
            this.right.junction = new Float64Array(this.length+1);
        this.reflection = new Float64Array(this.length+1);
            this.reflection.value = 0;
            this.reflection.new = 0;
        this.diameter = new Float64Array(this.length);
        this.amplitude = new Float64Array(this.length);
            this.amplitude.max = new Float64Array(this.length);
        
        // setup
        for(let index = 0; index < this.length; index++) {
            const interpolation = index/this.length;

            const value = (interpolation < 0.5)?
                0.4 + 1.6 * (2 * interpolation) :
                0.5 + 1.5 * (2 - (2 * interpolation));
            
            this.diameter[index] = Math.min(value, 1.9);
        }
    }

    update() {
        for(let index = 0; index < this.length; index++) {
            this.amplitude[index] = Math.pow(this.diameter[index], 2);

            if(index > 0)
                this.reflection[index] = (this.amplitude[index-1] - this.amplitude[index]) / (this.amplitude[index-1] + this.amplitude[index]);
        }
    }
}

export default Nose;