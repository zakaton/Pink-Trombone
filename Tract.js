import Transient from "/Transient.js";
import Math from "/MathExtension.js";

class Tract {
    constructor() {
        this.length = 44;
        this.start = {
            blade : Math.floor(10 * this.length / 44),
            tip : Math.floor(32 * this.length / 44),
            lip : Math.floor(39 * this.length / 44),
        };

        this.left = new Float64Array(this.length);
        this.right = new Float64Array(this.length);
        
        this.junctionOutput = {
            right : new Float64Array(this.length+1),
            left : new Float64Array(this.length+1),
        };

        this.reflection = new Float64Array(this.length+1);
        Object.assign(this.reflection, {
            glottal : 0.75,
            lip : -0.85,
            new : new Float64Array(this.length+1),
        });
        Object.assign(this.reflection.new, {
            left : 0,
            right : 0,
            nose : 0,
        });

        this.amplitude = {
            max : new Float64Array(this.length),
        };
        
        this.diameter = new Float64Array(this.length);
        Object.assign(this.diameter, {
            rest : new Float64Array(this.length),
            target : new Float64Array(this.length),
            new : new Float64Array(this.length),
        })

        for(let index = 0; index < this.length; index++) {
            var diameter = 0;

            if(index < (7 * this.length/44-0.5))
                diameter = 0.6;
            else if (index < 12*this.length/44)
                diameter = 1.1;
            else
                diameter = 1.5;
            
            this.diameter[index] = this.diameter.rest[index] = this.diameter.target[index] = this.diameter.new[index] = diameter;
        }

        this.A = new Float64Array(this.length),
        
        this.lastObstruction = -1;
        this.fade = 1.0;
        this.movementSpeed = 15;
        this.transients = [],
        
        this.output = {
            lip : 0,
            nose : 0,
        };

        this.velum = {
            target : 0.01,
        };

        this.nose = {
            length : Math.floor(28 * this.length/44)
        };
        Object.assign(this.nose, {
            start : this.length - this.nose.length + 1,
            
            right : new Float64Array(this.nose.length),
            left : new Float64Array(this.nose.length),

            junctionOutput : {
                left : new Float64Array(this.nose.length+1),
                right : new Float64Array(this.nose.length+1),
            },

            reflection : new Float64Array(this.nose.length+1),
            diameter : new Float64Array(this.nose.length),
            A : new Float64Array(this.nose.length),
            amplitude : {
                max : new Float64Array(this.nose.length),
            }
        })

        for(let index = 0; index < this.nose.length; index++) {
            var diameter;
            var d = 2 * (index / this.nose.length);
            if(d < 1)
                diameter = 0.4 + 1.6 * d;
            else
                diameter = 0.5 + 1.5*(2-d);
            diameter = Math.min(diameter, 1.9);
            this.nose.diameter[index] = diameter;
        }

        this.calculateReflections();
        this.calculateNoseReflections();

        this.nose.diameter[0] = this.velum.target;
    }

    static get parameterDescriptors() {
        return [

        ]
    }
    setParameters(parameters, sampleIndex) {

    }

    calculateReflections() {
        for(let index = 0; index < this.length; index++) {
            this.A[index] = this.diameter[index] * this.diameter[index];
        }
        for(let index = 1; index < this.length; index++) {
            this.reflection[index] = this.reflection.new[index];
            if(this.A[index] == 0)
                this.reflection.new[index] = 0.999;
            else
                this.reflection.new[index] = (this.A[index-1] - this.A[index]) / (this.A[index-1] + this.A[index])
        }

        this.reflection.left = this.reflection.new.left;
        this.reflection.right = this.reflection.new.right;
        this.reflection.nose = this.reflection.new.nose;

        const sum = this.A[this.nose.start] + this.A[this.nose.start+1] + this.nose.A[0];
            this.reflection.new.left = (2 * this.A[this.nose.start] - sum) / sum;
            this.reflection.new.right = (2 * this.A[this.nose.start+1] - sum) / sum;
            this.reflection.new.nose = (2 * this.nose.A[0] - sum) / sum;
        
    }

    calculateNoseReflections() {
        for(let index = 0; index < this.nose.length; index++) {
            this.nose.A[index] = this.nose.diameter[index] * this.nose.diameter[index];
        }
        for(let index = 1; index < this.nose.length; index++) {
            this.nose.reflection[index] = (this.nose.A[index-1] - this.nose.A[index]) / (this.nose.A[index-1] + this.nose.A[index]);
        }
    }

    runStep(glottalOutput, turbulenceNoise, lambda, noiseModulator) {
        const updateAmplitudes = (Math.random() < 0.1);

        this.processTransients();
        this.addTurbulenceNoise(turbulenceNoise, noiseModulator);

        this.junctionOutput.right[0] = this.left[0] * this.reflection.glottal + glottalOutput;
        this.junctionOutput.left[this.length] = this.right[this.length-1] * this.reflection.lip;

        for(let index = 1; index < this.length; index++) {
            const r = Math.interpolate(lambda, this.reflection[index], this.reflection.new[index]);
            const w = r * (this.right[index-1] + this.left[index]);

            this.junctionOutput.right[index] = this.right[index-1] - w;
            this.junctionOutput.left[index] = this.left[index] + w;
        }

        const index = this.nose.start;

        const leftInterpolation = Math.interpolate(lambda, this.reflection.new.left, this.reflection.left);
        this.junctionOutput.left[index] = leftInterpolation * this.right[index-1] + (leftInterpolation+1) * (this.nose.left[0] + this.left[index]);

        const rightInterpolation = Math.interpolate(lambda, this.reflection.new.right, this.reflection.right);
        this.junctionOutput.right[index] = rightInterpolation * this.left[index] + (rightInterpolation+1) * (this.nose.left[0] + this.right[index-1]);
        
        const noseInterpolation = Math.interpolate(lambda, this.reflection.new.nose, this.reflection.nose);
        this.nose.junctionOutput.right[0] = noseInterpolation * this.nose.left[0] + (noseInterpolation+1) * (this.left[index] + this.right[index-1]);


        for(let index = 0; index < this.length; index++) {
            this.right[index] = this.junctionOutput.right[index] * 0.999;
            this.left[index] = this.junctionOutput.left[index+1] * 0.999;

            if(updateAmplitudes) {
                const amplitude = Math.abs(this.right[index] + this.left[index]);
                this.amplitude.max[index] = (amplitude > this.amplitude.max[index])?
                    amplitude :
                    this.amplitude.max[index] * 0.999;
            }
        }

        this.output.lip = this.right[this.length-1];

        this.nose.junctionOutput.left[this.nose.length] = this.nose.right[this.nose.length-1] * this.reflection.lip;

        for(let index = 1; index < this.nose.length; index++) {
            const w = this.nose.reflection[index] * (this.nose.right[index-1] + this.nose.left[index]);

            this.nose.junctionOutput.right[index] = this.nose.right[index-1] - w;
            this.nose.junctionOutput.left[index] = this.nose.left[index] + w;
        }

        for(let index = 0; index < this.nose.length; index++) {
            this.nose.right[index] = this.nose.junctionOutput.right[index] * this.fade;
            this.nose.left[index] = this.nose.junctionOutput.left[index+1] * this.fade;

            if(updateAmplitudes) {
                const amplitude = Math.abs(this.nose.right[index] + this.nose.left[index]);
                this.nose.amplitude.max[index] = (amplitude > this.nose.amplitude.max[index])?
                    amplitude :
                    this.nose.amplitude.max[index] * 0.999;
            }
        }
    }

    processTransients() {
        for(let index = 0; index < this.transients.length; index++) {
            const transient = this.transients[index];
            const amplitude = transient.amplitude;
            this.right[transient.position] += amplitude/2;
            this.left[transient.position] += amplitude/2;
            transient.timeAlive += 1.0/(sampleRate*2);
        }
        for(let index = this.transients.length-1; index >= 0; index--) {
            const transient = this.transients[index];
            if(!transient.isAlive)
                this.transients.splice(index, 1);
        }
    }

    finishBlock(bufferLength) {
        const blockTime = bufferLength / sampleRate;

        this.reshapeTract(blockTime);
        this.calculateReflections();
    }

    reshapeTract(deltaTime) {
        var amount = deltaTime * this.movementSpeed;

        var newLastObstruction = -1;
        for(let index = 0; index < this.length; index++) {
            const diameter = this.diameter[index];
            const targetDiameter = this.diameter.target[index];
            if(diameter <= 0)
                newLastObstruction = index;
            
            var slowReturn;
            if(index < this.nose.start)
                slowReturn = 0.6;
            else if(index >= this.start.tip)
                slowReturn = 1.0;
            else
                slowReturn = 0.6 + 0.4 * (index - this.nose.start) / (this.start.tip - this.nose.start);
            
            this.diameter[index] = Math.moveTowards(diameter, targetDiameter, slowReturn*amount, 2*amount);
        }

        if((this.lastObstruction > -1) && (newLastObstruction == -1) && (this.nose.A[0] < 0.05)) {
            const transient = new Transient(this.lastObstruction);
            this.transients.push(transient);
        }
        
        this.lastObstruction = newLastObstruction;

        amount = deltaTime * this.movementSpeed; // has this changed?

        this.nose.diameter[0] = Math.moveTowards(this.nose.diameter[0], this.velum.target, amount*0.25, amount*0.1);

        this.nose.A[0] = Math.pow(this.nose.diameter[0], 2);
    }

    addTurbulenceNoise(turbulenceNoise, noiseModulator) {
        // fill
    }

    addTurbulenceNoiseAtIndex(turbulenceNoise, index, diameter, noiseModulator) {
        const indexComplements = [
            index % 1,
            1 - (index % 1),
        ];
        index = Math.floor(index);
        
        turbulenceNoise *= noiseModulator;
        const thinness = Math.clamp(8 * (0.7 - diameter), 0, 1);
        const openness = Math.clamp(30(diameter-0.3), 0, 1);
        
        const noise = [1, 0].map(_index => turbulenceNoise * indexComplements[_index] * thinness * openness);

        ["left", "right"].forEach(direction => {
            this[direction][index+1] += noise[0]/2;
            this[direction][index+2] += noise[1]/2;
        });
    }
}

export default Tract