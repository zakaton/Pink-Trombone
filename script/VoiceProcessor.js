import Math from "./MathExtension.js";
import SimplexNoise from "./SimplexNoise.js";

function VoiceProcessor(sampleRate, bufferSize, tractLength = 44) {
    // NOISE
    this.noise = new SimplexNoise();


    // TIME
    this.time = {
        sampleRate : sampleRate,
        step : 1/sampleRate,

        bufferSize : bufferSize,
        blockStep : bufferSize/sampleRate,

        total : 0,
        rate : 15,

        update : () => {
            this.time.total += this.time.step;
        },
    };


    // WAVEFORM
    this.waveform = {
        time : 0,

        length : 1,
        interpolation : 1,

        update : () => {
            this.waveform.time += this.time.step;

            if(this.waveform.time > this.waveform.length) {
                this.waveform.time %= this.waveform.length;
                this.waveform.coefficients.update();
            }

            this.waveform.length = 1/this.glottis.frequency.value;
            this.waveform.interpolation = this.waveform.time/this.waveform.length;
        },

        coefficients : {
            alpha : 0,
            Delta : 0,
            E0 : 0,
            epsilon : 0,
            omega : 0,
            shift : 0,
            Te : 0,

            update : () => {
                this.frequency

                const R = {};
                    R.d = Math.clamp(3*(1-this.glottis.tenseness.old), 0.5, 2.7); // old to value
                    R.a = -0.01 + 0.048*R.d;
                    R.k = 0.224 + 0.118*R.d;
                    R.g = (R.k/4)*(0.5+1.2*R.k)/(0.11*R.d-R.a*(0.5+1.2*R.k));

                const T = {};
                    T.a = R.a;
                    T.p = 1/(2*R.g);
                    T.e = T.p + T.p*R.k;
    
                this.waveform.coefficients.epsilon = 1/T.a;
                this.waveform.coefficients.shift = Math.exp(-this.waveform.coefficients.epsilon * (1-T.e));
                this.waveform.coefficients.Delta = 1 - this.waveform.coefficients.shift;

                const integral = {};
                    integral.RHS = ((1/this.waveform.coefficients.epsilon) * (this.waveform.coefficients.shift-1) + (1-T.e) * this.waveform.coefficients.shift) / this.waveform.coefficients.Delta;
                    integral.total = {};
                        integral.total.lower = -(T.e - T.p)/2 + integral.RHS;
                        integral.total.upper = -integral.total.lower;
                
                this.waveform.coefficients.omega = Math.PI/T.p;
                
                const s = Math.sin(this.waveform.coefficients.omega * T.e);
                const y = -Math.PI * s * integral.total.upper / (T.p*2);
                const z = Math.log(y);
    
                this.waveform.coefficients.alpha = z/(T.p/2 - T.e);
                this.waveform.coefficients.E0 = -1 / (s*Math.exp(this.waveform.coefficients.alpha*T.e));
                this.waveform.coefficients.Te = T.e;
            },
        },
    };


    // GLOTTIS
    this.glottis = {        
        vibrato : {
            value : 0,
            amount : 0.005,
            frequency : 6,
            wobble : 1,
            update : () => {
                var vibrato = 0;
                    
                vibrato += this.glottis.vibrato.amount * Math.sin(2 * Math.PI * this.time.total * this.glottis.vibrato.frequency);
                vibrato += 0.02 * this.noise.simplex1(this.time.total * 4.07);
                vibrato += 0.04 * this.noise.simplex1(this.time.total * 2.15);

                if(this.glottis.vibrato.wobble > 0) {
                    var wobble = 0;
                        wobble += 0.2 * this.noise.simplex1(this.time.total * 0.98);
                        wobble += 0.4 * this.noise.simplex1(this.time.total * 0.50);
                        wobble *= this.glottis.vibrato.wobble;

                    vibrato += wobble;
                }

                this.glottis.vibrato.value = vibrato;
            }
        },

        frequency : {
            value : 140,
            param : 140,
            previous : 140,
            target : 140,
            interpolation : 140,

            update : () => {
                const interpolationRate = 1.1;

                this.glottis.frequency.interpolation = (this.glottis.frequency.param > this.glottis.frequency.interpolation)?
                    Math.min(this.glottis.frequency.interpolation * interpolationRate, this.glottis.frequency.param):
                    Math.max(this.glottis.frequency.interpolation / interpolationRate, this.glottis.frequency.param);

                this.glottis.frequency.previous = this.glottis.frequency.value;
                this.glottis.frequency.value = this.glottis.frequency.interpolation * (1 + this.glottis.vibrato.value);
            },
        },

        tenseness : {
            value : 0.6,
            param : 0.6,
            old : 0.6,
            target : 0.6,
            interpolation : 0.6,
            scale : 1,

            update : () => {
                this.glottis.tenseness.old = this.glottis.tenseness.target;
                
                this.glottis.tenseness.target = this.glottis.tenseness.param;
                this.glottis.tenseness.target += 0.10 * this.noise.simplex1(this.time.total * 0.46);
                this.glottis.tenseness.target += 0.05 * this.noise.simplex1(this.time.total * 0.36);
                this.glottis.tenseness.target += this.glottis.tenseness.scale * (3 - this.glottis.tenseness.param) * (1 - this.glottis.intensity.value);
            }
        },

        intensity : {
            value : 1,
            param : 1,
            update : () => {
                this.glottis.intensity.value = this.glottis.intensity.param;
            }
        },

        loudness : {
            value : 0,
            param : 0,
            update : () => {
                this.glottis.loudness.value = this.glottis.loudness.param;
            },
        },

        update : () => {
            this.glottis.vibrato.update();
            this.glottis.frequency.update();
            this.glottis.tenseness.update();
            this.glottis.intensity.update();
            this.glottis.loudness.update();
        },

        process : (sample) => {
            var aspiration = sample * this.glottis.intensity.value * this.glottis.getNoiseModulator() * (1 - Math.sqrt(Math.max(this.glottis.tenseness.target, 0)));
                aspiration *= 0.2 + 0.02*this.noise.simplex1(this.time.total * 1.99);
            
            const glottisSample = aspiration + this.glottis.getNormalizedWaveform();
            return glottisSample;
        },

        getNoiseModulator : () => {
            const angle = 2*Math.PI*this.waveform.interpolation;
            const amplitude = Math.sin(angle);
            const positiveAmplitude = Math.max(0, amplitude);
            
            const offset = 0.1
            const scalar = 0.2;
            const voice = offset + scalar*positiveAmplitude;

            return this.glottis.tenseness.target * this.glottis.intensity.value * voice + (1 - this.glottis.tenseness.target * this.glottis.intensity.value) * 0.3;
        },

        getNormalizedWaveform : () => {
            const output = (this.waveform.interpolation > this.waveform.coefficients.Te)?
                (-Math.exp(-this.waveform.coefficients.epsilon * (this.waveform.interpolation-this.waveform.coefficients.Te)) + this.waveform.coefficients.shift)/this.waveform.coefficients.Delta :
                this.waveform.coefficients.E0 * Math.exp(this.waveform.coefficients.alpha*this.waveform.interpolation) * Math.sin(this.waveform.coefficients.omega * this.waveform.interpolation);

            return output * this.glottis.intensity.value * this.glottis.loudness.value;
        },
    };


    // TRACT
    this.tract = {
        length : tractLength,
        positions : [],

        angle : {
            scale : 0.64,
            offset : -0.24,
        },

        blade : {
            start : Math.floor(10 * tractLength / 44),
        },

        tip : {
            start : Math.floor(32 * tractLength / 44),
        },

        lip : {
            start : Math.floor(39 * tractLength / 44),
            reflection : -0.85,
            output : 0,
        },

        glottis : {
            reflection : 0.75,
        },

        velum : {
            target : 0.01,
        },

        grid : {
            offset : 1.7
        },

        left : new Float64Array(tractLength),
        right : new Float64Array(tractLength),
        reflection : new Float64Array(tractLength+1),
        amplitude : new Float64Array(tractLength),
        diameter : new Float64Array(tractLength),

        update : () => {
            // reshapeTract
            const amount = this.time.blockStep * this.time.rate;

            for(let index = 0; index < tractLength; index++) {
                if(this.tract.diameter[index] <= 0) 
                    this.transients.obstruction.new = index;

                var slowReturn;
                    if(slowReturn < this.nose.start)
                        slowReturn = 0.6;
                    else if(index >= this.tract.tip.start)
                        slowReturn = 1.0;
                    else
                        slowReturn = 0.6 + 0.4 * (index - this.nose.start) / (this.tract.tip.start - this.nose.start);

                // purpose here is just for interpolation's sake...
                this.tract.diameter[index] = Math.moveTowards(this.tract.diameter[index], this.tract.diameter.target[index], amount * slowReturn, amount*2);
            }

            if((this.nose.amplitude[0] < 0.05))
                this.transients.update();

            this.nose.diameter[0] = Math.moveTowards(this.nose.diameter[0], this.tract.velum.target, amount*0.25, amount*0.1);
            this.nose.amplitude[0] = Math.pow(this.nose.diameter[0], 2);

            this.tract.reflection.update();
        },

        _process : (sample, sampleIndex, glottisSample) => { // sample is never used
            const sampleInterpolation = sampleIndex/this.time.bufferSize;
            this.transients.process();
            this.turbulence.process(sample);

            this.tract.right.junction[0] = this.tract.left[0] * this.tract.glottis.reflection + glottisSample;
            this.tract.left.junction[tractLength] = this.tract.right[tractLength-1] * this.tract.lip.reflection;
            
            for(let index = 1; index < tractLength; index++) {
                const interpolation = Math.interpolate(sampleInterpolation, this.tract.reflection[index], this.tract.reflection.new[index]);
                const offset = interpolation * (this.tract.right[index-1] + this.tract.left[index]);

                this.tract.right.junction.process(index, offset);
                this.tract.left.junction.process(index, offset);
            }

            this.tract.left.junction.interpolate(sampleInterpolation);
            this.tract.right.junction.interpolate(sampleInterpolation);
            this.nose.right.junction.interpolate(sampleInterpolation);

            const updateAmplitudes = (Math.random() < 0.1);
            for(let index = 0; index < tractLength; index++) {
                this.tract.right[index] = this.tract.right.junction[index] * 0.999;
                this.tract.left[index] = this.tract.left.junction[index+1] * 0.999;
                if(updateAmplitudes) {
                    const sum = Math.abs(this.tract.left[index] + this.tract.right[index]);
                    this.tract.amplitude.max[index] = (sum > this.tract.amplitude.max[index])?
                        sum :
                        this.tract.amplitude.max[index] * 0.999;
                }
            }

            this.tract.lip.output = this.tract.right[tractLength-1];

            this.nose.left.junction[noseLength] = this.nose.right[noseLength-1] * this.tract.lip.reflection;

            for(let index = 1; index < noseLength; index++) {
                const offset = this.nose.reflection[index] * (this.nose.left[index] * this.nose.right[index-1]);

                this.nose.left.junction.process(index, offset);
                this.nose.right.junction.process(index, offset);
            }

            for(let index = 0; index < noseLength; index++) {
                this.nose.left[index] = this.nose.left.junction[index+1] * this.nose.fade;
                this.nose.right[index] = this.nose.right.junction[index] * this.nose.fade;

                if(updateAmplitudes) {
                    const sum = Math.abs(this.nose.left[index] + this.nose.right[index]);
                    this.nose.amplitude.max[index] = (sum > this.nose.amplitude.max[index])?
                        sum :
                        this.nose.amplitude.max[index] * 0.999;
                }
            }

            this.nose.output = this.nose.right[noseLength-1];

            return this.tract.lip.output + this.nose.output;
        },

        process : (sample, sampleIndex, glottisSample) => {
            var output = 0;
                output += this.tract._process(sample, sampleIndex, glottisSample);
                output += this.tract._process(sample, sampleIndex+0.5, glottisSample);
            return output;
        }
    };

    this.tract.left.junction = new Float64Array(tractLength+1);
    this.tract.right.junction = new Float64Array(tractLength+1);

    this.tract.left.junction.process = (index, offset) => {
        this.tract.left.junction[index] = this.tract.left[index] + offset;
    };
    this.tract.right.junction.process = (index, offset) => {
        this.tract.right.junction[index] = this.tract.right[index-1] - offset;
    };

    this.tract.left.junction.interpolate = (sampleInterpolation) => {
        const interpolation = Math.interpolate(sampleInterpolation, this.tract.left.reflection.new, this.tract.left.reflection.value);
        this.tract.left.junction[this.nose.start] = interpolation * this.tract.right[this.nose.start-1] + (interpolation+1) * (this.nose.left[0] + this.tract.left[this.nose.start]);
    };
    this.tract.right.junction.interpolate = (sampleInterpolation) => {
        const interpolation = Math.interpolate(sampleInterpolation, this.tract.right.reflection.new, this.tract.right.reflection.value);
        this.tract.right.junction[this.nose.start] = interpolation * this.tract.left[this.nose.start] + (interpolation+1) * (this.nose.left[0] + this.tract.right[this.nose.start-1]);
    };

    this.tract.left.reflection = {
        value : 0,
        new : 0,
        update : (sum) => {
            this.tract.left.reflection.value = this.tract.left.reflection.new;
            this.tract.left.reflection.new = (2 * this.tract.amplitude[this.nose.start] - sum) / sum;
        },
    };
    this.tract.right.reflection = {
        value : 0,
        new : 0,
        update : (sum) => {
            this.tract.right.reflection.value = this.tract.right.reflection.new;
            this.tract.right.reflection.new = (2 * this.tract.amplitude[this.nose.start + 1] - sum) / sum;
        },
    }

    this.tract.reflection.new = new Float64Array(tractLength+1);
    this.tract.reflection.update = () => {
        for(let index = 0; index < tractLength; index++) {
            this.tract.amplitude[index] = Math.pow(this.tract.diameter[index], 2);
            
            if(index > 0) {
                this.tract.reflection[index] = this.tract.reflection.new[index];
                this.tract.reflection.new[index] = (this.tract.amplitude[index] == 0)?
                    0.999 :
                    (this.tract.amplitude[index-1] - this.tract.amplitude[index]) / (this.tract.amplitude[index-1] + this.tract.amplitude[index]);    
            }
        }
        
        const sum = this.tract.amplitude[this.nose.start] + this.tract.amplitude[this.nose.start+1] + this.nose.amplitude[0];
            this.tract.left.reflection.update(sum);
            this.tract.right.reflection.update(sum);
            this.nose.reflection.update(sum);
    }

    this.tract.amplitude.max = new Float64Array(tractLength);

    this.tract.diameter.rest = new Float64Array(tractLength);
    this.tract.diameter.target = new Float64Array(tractLength);
    this.tract.diameter.new = new Float64Array(tractLength);
    this.tract.diameter.update = () => {
        for(let index = 0; index < tractLength; index++) {
            var value = 0

            if(index < (7 * tractLength / 44 - 0.5))
                value = 0.6;
            else if(index < (12 * tractLength / 44))
                value = 1.1;
            else
                value = 1.5;

            this.tract.diameter[index] = this.tract.diameter.rest[index] = this.tract.diameter.target[index] = this.tract.diameter.new[index] = value;
        }

        this.tract.diameter.rest.update();

        for(let index = 0; index < tractLength; index++) {
            this.tract.diameter[index] = this.tract.diameter.target[index] = this.tract.diameter.rest[index];
        }
    };
    this.tract.diameter.rest.update = () => { // the only place "tongue" is used
        for(let index = this.tract.blade.start; index < this.tract.lip.start; index++) {
            const indexInterpolation = (this.tongue.index.value - index) / (this.tract.tip.start - this.tract.blade.start);

            const tongueAngle = 1.1 * Math.PI * indexInterpolation;
            const tongueDiameter = 2 + (this.tongue.diameter.value - 2) / 1.5;

            var curve = (1.5 - tongueDiameter + this.tract.grid.offset) * Math.cos(tongueAngle);
            if(index == this.tract.blade.start -2 || index == this.tract.lip.start-1)
                curve *= 0.8;
            if(index == this.tract.blade.start +0 || index == this.tract.lip.start-2)
                curve *= 0.94;
            
            this.tract.diameter.rest[index] = 1.5 - curve;
        }
    }


    // NOSE
    const noseLength = Math.floor(28 * tractLength / 44);
    this.nose = {
        length : noseLength,
        start : tractLength - noseLength + 1,

        output : 0,
        fade : 1,
        offset : 0.8,

        right : new Float64Array(noseLength),
        left : new Float64Array(noseLength),
        reflection : new Float64Array(noseLength+1),
        diameter : new Float64Array(noseLength),
        amplitude : new Float64Array(noseLength),

        setup : () => {
            for(let index = 0; index < noseLength; index++) {
                const interpolation = index/noseLength;

                const value = (interpolation < 0.5)?
                    0.4 + 1.6 * (2*interpolation) :
                    0.5 + 1.5 * (2 - (2*interpolation));
                
                this.nose.diameter[index] = Math.min(value, 1.9);
            }
        },

        update : () => { // nose.calculateReflections
            for(let index = 0; index < noseLength; index++) {
                this.nose.amplitude[index] = Math.pow(this.nose.diameter[index], 2);
                
                if(index > 0)
                    this.nose.reflection[index] = (this.nose.amplitude[index-1] - this.nose.amplitude[index]) / (this.nose.amplitude[index-1] + this.nose.amplitude[index])
            }
        },
    };
    this.nose.diameter[0] = this.tract.velum.target;

    this.nose.right.junction = new Float64Array(noseLength+1);
    this.nose.left.junction = new Float64Array(noseLength+1);

    this.nose.right.junction.process = (index, offset) => {
        this.nose.right.junction[index] = this.nose.right[index-1] - offset;
    }
    this.nose.left.junction.process = (index, offset) => {
        this.nose.left.junction[index] = this.nose.left[index] + offset;
    }

    this.nose.right.junction.interpolate = (sampleInterpolation) => {
        const interpolation = Math.interpolate(sampleInterpolation, this.nose.reflection.new, this.nose.reflection.value);
        this.nose.right.junction[0] = interpolation * this.nose.left[0] + (interpolation + 1) * (this.tract.left[this.nose.start] + this.tract.right[this.nose.start-1]);
    }

    this.nose.reflection.value = 0;
    this.nose.reflection.new = 0;
    this.nose.reflection.update = (sum) => {
        this.nose.reflection.value = this.nose.reflection.new;
        this.nose.reflection.new = (2 * this.nose.amplitude[0] - sum) / sum;
    }

    this.nose.amplitude.max = new Float64Array(noseLength)


    // TONGUE
    this.tongue = {
        get param() {
            return {
                diameter : this.diameter.paranm,
                index : this.index.param,
            }
        },
        set param(newValue) {
            const {diameter, index} = newValue;

            this.diameter.param = diameter;
            this.index.param = index;
        },

        get value() {
            return {
                diameter : this.diameter.value,
                index : this.index.value,
            };
        },

        diameter : {
            value : 2.43,
            param : 2.43,

            minValue : 2.05,
            maxValue : 3.5,

            getInterpolation : () => { // interpolation is (1 -> 0), not (0 -> 1)
                const interpolation = this.tongue.diameter.maxValue - this.tongue.diameter.value;
                const range = this.tongue.diameter.maxValue - this.tongue.diameter.minValue;
                const normalizedInterpolation = interpolation/range;
                const clampedInterpolation = Math.clamp(normalizedInterpolation, 0, 1)
                
                return clampedInterpolation;
            },

            update : () => {
                this.tongue.diameter.value = Math.clamp(this.tongue.diameter.param, this.tongue.diameter.minValue, this.tongue.diameter.maxValue);
            }
        },

        index : {
            value : 12.9,
            param : 12.9,

            minValue : this.tract.blade.start +2,
            maxValue : this.tract.tip.start -3,

            center : undefined,
            range : undefined,

            update : () => {
                const diameterInterpolation = this.tongue.diameter.getInterpolation();
                
                const straightenedInterpolation = Math.pow(diameterInterpolation, 0.58) - 0.2*(Math.pow(diameterInterpolation, 2) - diameterInterpolation);
                const centerOffsetDiameter = straightenedInterpolation * this.tongue.index.range;
                const centerOffsetRadius = centerOffsetDiameter/2;
                
                this.tongue.index.value = (true)? // false for a normal clamp
                    Math.clamp(this.tongue.index.param, this.tongue.index.center - centerOffsetRadius, this.tongue.index.center + centerOffsetRadius) :
                    Math.clamp(this.tongue.index.param, this.tongue.index.minValue, this.tongue.index.maxValue);
            }
        },

        update : () => {
            this.tongue.diameter.update();
            this.tongue.index.update();
        }
    };

    this.tongue.index.range = (this.tongue.index.maxValue - this.tongue.index.minValue);
    this.tongue.index.center = (this.tongue.index.maxValue + this.tongue.index.minValue)/2;

    // POSITIONS
    this.tract.positions.index = {
        minValue : 2,
        maxValue : tractLength,
    };
    this.tract.positions.diameter = {        
        minValue : -0.85 - this.nose.offset,
        maxValue : undefined,
    };

    this.tract.positions.update = () => {    
        this.tongue.update();
  
        this.tract.diameter.rest.update();
        for(let index = 0; index < tractLength; index++) {
           this.tract.diameter.target[index] = this.tract.diameter.rest[index];
        }

        this.tract.velum.target = 0.01;

        const tongueAndPositions = [this.tongue.value].concat(this.tract.positions);
        const length = tongueAndPositions.length;
        for(let _index = length-1; _index >= 0; _index--) {
            const position = tongueAndPositions[_index];
            if(position == undefined) return;

            var {diameter, index} = position;

            if(index > this.nose.start && diameter < -this.nose.offset)
                this.tract.velum.target = 0.4;
            
            // can clamp instead?
            if(
                index >= this.tract.positions.index.minValue &&
                index < this.tract.positions.index.maxValue &&

                diameter > this.tract.positions.diameter.minValue
            ) {
                diameter -= 0.3;
                diameter = Math.max(0, diameter);
                if(diameter < 3) {
                    var width = 2;

                    if(index < 25)
                        width = 10;
                    else if(index >= this.tract.tip.start)
                        width = 5;
                    else
                        width = 10 - 5 * (index-25) / (this.tract.tip.start - 25);

                    const indexOffset = Math.round(index);
                    for(let __index = -Math.ceil(width)-1 +indexOffset; __index < width+1 +indexOffset; __index++) {
                        if(__index >= 0 && __index < tractLength) {
                            const relpos = Math.abs(__index - index) - 0.5;

                            var shrink;
                            if(relpos <= 0)
                                shrink = 0;
                            else if(relpos > width)
                                shrink = 1;
                            else
                                shrink = 0.5 * (1 - Math.cos(Math.PI * relpos/width));

                            const difference = this.tract.diameter.target[__index] - diameter;
                            if(difference > 0)
                                this.tract.diameter.target[__index] = diameter + difference * shrink;
                        }
                    }
                }
            }
        }
    };


    // TRANSIENTS
    this.transients = [];
    this.transients.obstruction = {
        last : -1,
        new : -1,

        update : () => {
            this.transients.obstruction.last = this.transients.obstruction.new;
        }
    };
    this.transients.update = () => {
        if((this.transients.obstruction.last > -1) && (this.transients.obstruction.new == -1))
            this.transients.create();
        this.transients.obstruction.update();
    };
    this.transients.process = () => {
        const length = this.transients.length;

        for(let index = 0; index < length; index++) {
            const transient = this.transients[index];
            const amplitude = transient.getAmplitude();
            const halvedAmplitude = amplitude/2;

            this.tract.left[transient.position] += halvedAmplitude;
            this.tract.left[transient.position] += halvedAmplitude;

            transient.update();
        }

        for(let index = length-1; index >= 0; index--) {
            const transient = this.transients[index];

            if(!transient.isAlive)
                this.transients.splice(index, 1);
        }
    };
    this.transients.create = () => {
        const _this = this;

        const transient = {
            position : this.transients.obstruction.new,
            timeAlive : 0,
            lifetime : 0.2,
            strength : 0.3,
            exponent : 200,
            isAlive : true,

            getAmplitude() {
                return this.stength * Math.pow(-2, this.exponent*this.timeAlive)
            },
            update() {
                this.timeAlive += _this.time.step/2;
                this.isAlive = (this.timeAlive > this.lifetime);
            }
        };

        this.transients.push(transient);

    };

    // TURBULENCE
    this.turbulence = {
        process : (sample) => {
            this.tract.positions.forEach(position => {
                const {index, diameter} = position;
                if(index >= 2 && index <= tractLength && diameter > 0) {
                    const _index = Math.floor(index);
                    const delta = index - _index;
                    
                    const intensity = 1;
                    sample *= 0.66 * intensity * this.glottis.getNoiseModulator();

                    const thinness = Math.clamp(8 * (0.7 - diameter), 0, 1);
                    const openness = Math.clamp(30 * (diameter-0.3), 0, 1);
                    const _ness = thinness*openness;

                    const noise = [
                        sample * (1-delta) * _ness,
                        sample * delta * _ness,
                    ];

                    this.tract.right[_index+1] += noise[0]/2;
                    this.tract.left[_index+1] += noise[0]/2;

                    this.tract.right[_index+2] += noise[1]/2;
                    this.tract.left[_index+2] += noise[1]/2;
                }
            })
        }
    }

    // INITIALIZATION
    this.nose.setup();
    this.tract.diameter.update();

    this.waveform.coefficients.update();

    this.tract.reflection.update();
    this.nose.update();

    this.nose.diameter[0] = this.tract.velum.target;

    this.process = function(sample, sampleIndex) {
        this.time.update();
        this.waveform.update();

        const glottisSample = this.glottis.process(sample, sampleIndex);
        const tractSample = this.tract.process(sample, sampleIndex, glottisSample);

        return tractSample * 0.125;
    };

    this.update = function() {
        this.glottis.update();
        this.tract.update();
    };
};

export default VoiceProcessor;