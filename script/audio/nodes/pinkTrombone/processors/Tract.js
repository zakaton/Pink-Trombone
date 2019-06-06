/*
    TODO
        figure out the neccessity of "target"
        using tongue as a k-rate constriction
*/

import Nose from "./Nose.js";
import Transient from "./Transient.js";

Math.interpolate = function(interpolation, from, to) {
    return (from * (1-interpolation)) + (to * (interpolation));
}
Math.clamp = function(value, minValue, maxValue) {
    return (value <= minValue)?
        minValue :
        (value < maxValue)?
            value :
            maxValue;
}

class Tract {
    constructor(length = 44) {
        this.length = length;

        // Indices
        this.blade = {
            start : Math.floor(10 * this.length/44),
        };
        
        this.tip = {
            start : Math.floor(32 * this.length/44),
        };

        this.lip = {
            start : Math.floor(39 * this.length/44),
            reflection : -0.85,
        };

        this.glottis = {
            reflection : 0.75
        };

        this.velum = {
            target : 0.01,
        };

        this.grid = {
            offset : 1.7,
        };


        // Tongue & Nose
        this.tongue = {
            _diameter : 2.43,
            _index : 12.9,

            range : {
                diameter : {
                    minValue : 2.05,
                    maxValue : 3.5,
                    get range() {
                        return this.maxValue - this.minValue;
                    },
                    get center() { // for rendering
                        return (this.maxValue + this.minValue)/2;
                    },
                    interpolation(diameterValue) {
                        const interpolation = (diameterValue - this.minValue) / this.range;
                        return Math.clamp(interpolation, 0, 1);
                    }
                },
                index : {
                    minValue : this.blade.start+2,
                    maxValue : this.tip.start-3,
                    get range() {
                        return this.maxValue - this.minValue;
                    },
                    get center() {
                        return (this.maxValue + this.minValue)/2;
                    },
                    centerOffset(interpolation) {
                        const centerOffsetDiameter = interpolation * this.range;
                        const centerOffsetRadius = centerOffsetDiameter/2;
                        return centerOffsetRadius;
                    },
                },
            },

            get diameter() {
                return this._diameter;
            },
            set diameter(newValue) {
                this._diameter = Math.clamp(newValue, this.range.diameter.minValue, this.range.diameter.maxValue);
            },

            get index() {
                return this._index;
            },
            set index(newValue) {
                const diameterInterpolation = this.range.diameter.interpolation(this.diameter);
                const invertedDiameterInterpolation = 1 - diameterInterpolation;

                const straightenedInterpolation = Math.pow(invertedDiameterInterpolation, 0.58) - 0.2*(Math.pow(invertedDiameterInterpolation, 2) - invertedDiameterInterpolation);
                const centerOffset = this.range.index.centerOffset(straightenedInterpolation);

                this._index = true?
                    Math.clamp(newValue, this.range.index.center -centerOffset, this.range.index.center +centerOffset) :
                    Math.clamp(newValue, this.range.index.minValue, this.range.index.maxValue) ;
            },
        };
        this.nose = new Nose(this);


        // Transients
        this.transients = [];
            this.transients.obstruction = {
                last : -1,
                new : -1,
            };
        
        // Constrictions
        this.previousConstrictions = [];
            this.previousConstrictions.tongue = {};


        // Buffers
        this.right = new Float64Array(this.length);
            this.right.junction = new Float64Array(this.length+1);
            this.right.reflection = {
                value : 0,
                new : 0,
            };

        this.left = new Float64Array(this.length);
            this.left.junction = new Float64Array(this.length+1);
            this.left.reflection = {
                value : 0,
                new : 0,
            };
        
        this.reflection = new Float64Array(this.length+1);
            this.reflection.new = new Float64Array(this.length+1);
        
        this.amplitude = new Float64Array(this.length);
            this.amplitude.max = new Float64Array(this.length);
        
        this.diameter = new Float64Array(this.length);
            this.diameter.rest = new Float64Array(this.length);
            this.diameter.target = new Float64Array(this.length);
            this.diameter.new = new Float64Array(this.length);
        

        // diameter.update
        for(let index = 0; index < this.length; index++) {
            var value = 0;

            if(index < (7 * this.length/44 - 0.5))
                value = 0.6;
            else if(index < (12 * this.length/44))
                value = 1.1;
            else
                value = 1.5;

            this.diameter[index] = value;
            this.diameter.rest[index] = value;
            this.diameter.target[index] = value;
            this.diameter.new[index] = value;
        }


        this._updateDiameterRest();

        for(let index = 0; index < this.length; index++) {
            this.diameter[index] = this.diameter.rest[index];
            this.diameter.target[index] = this.diameter.rest[index];
        }

        this._updateReflection();
    }

    // PROCESS
    process(parameterSamples, sampleIndex, bufferLength, seconds, constrictions) {
        this.tongue.diameter = parameterSamples.tongueDiameter;
        this.tongue.index = parameterSamples.tongueIndex;

        this._processTransients(seconds);
        this._processConstrictions(this.previousConstrictions, parameterSamples);

        const bufferInterpolation = (sampleIndex/bufferLength);
        const updateAmplitudes = (Math.random() < 0.1);

        const outputSample = this._processLips(parameterSamples, bufferInterpolation, updateAmplitudes)

        return outputSample;
    }

    _processTransients(seconds) {
        for(let index = this.transients.length-1; index >= 0; index--) {
            const transient = this.transients[index];

            this.left[transient.position] += transient.amplitude;
            transient.update(seconds);

            if(!transient.isAlive)
                this.transients.splice(index, 1);
        }
    }
    _processConstrictions(constrictions, parameterSamples) {
        for(let index = 0; index < constrictions.length; index++) {
            const constriction = constrictions[index];
            
            // 758
            if(constriction.index >= 2 && constriction.index <= this.length && constriction.diameter > 0) {
                var noise = parameterSamples.glottis;

                const noiseScalar = parameterSamples.noiseModulator * 0.66;
                    noise *= noiseScalar;

                const thinness = Math.clamp(8 * (0.7 - constriction.diameter), 0, 1);
                const openness = Math.clamp(30 * (constriction.diameter - 0.3), 0, 1);
                    const _ness = thinness*openness;
                        noise *= _ness/2;

                const lowerIndex = Math.floor(constriction.index);
                    const lowerWeight = constriction.index - lowerIndex;
                        const lowerNoise = noise * lowerWeight;

                const upperIndex = lowerIndex+1;
                    const upperWeight = upperIndex - constriction.index;
                        const upperNoise = noise * upperWeight;

                this.right[lowerIndex+1] += lowerNoise;
                this.right[upperIndex+1] += upperNoise;

                this.left[lowerIndex+1] += lowerNoise;
                this.left[upperIndex+1] += upperNoise;
            }
        }
    }

    _processLips(parameterSamples, bufferInterpolation, updateAmplitudes) {
        this.right.junction[0] = this.left[0] * this.glottis.reflection + parameterSamples.glottis;
        this.left.junction[this.length] = this.right[this.length-1] * this.lip.reflection;

        for(let index = 1; index < this.length; index++) {
            const interpolation = Math.interpolate(bufferInterpolation, this.reflection[index], this.reflection.new[index]);
            const offset = interpolation * (this.right[index-1] + this.left[index]);

            this.right.junction[index] = this.right[index-1] - offset;
            this.left.junction[index] = this.left[index] + offset;
        }

        const leftInterpolation = Math.interpolate(bufferInterpolation, this.left.reflection.new, this.left.reflection.value);
            this.left.junction[ this.nose.start] = leftInterpolation  * this.right[this.nose.start-1] + (leftInterpolation +1) * (this.nose.left[0] + this.left[ this.nose.start  ]);
        const rightInterpolation = Math.interpolate(bufferInterpolation, this.right.reflection.new, this.right.reflection.value);
            this.right.junction[this.nose.start] = rightInterpolation * this.left[ this.nose.start  ] + (rightInterpolation+1) * (this.nose.left[0] + this.right[this.nose.start-1]);

        for(let index = 0; index < this.length; index++) {
            this.right[index] = this.right.junction[index] * 0.999;
            this.left[index] = this.left.junction[index+1] * 0.999;

            if(updateAmplitudes) {
                const sum = Math.abs(this.left[index] + this.right[index]);
                this.amplitude.max[index] = (sum > this.amplitude.max[index])?
                    sum :
                    this.amplitude.max[index] * 0.999;
            }
        }

        //this.lip.output = this.right[this.length-1];

        return this.right[this.length-1];
    }
    _processNose(parameterSamples, bufferInterpolation, updateAmplitudes) {
        this.nose.left.junction[this.nose.length] = this.nose.right[this.nose.length-1] * this.lip.reflection;

        const noseInterpolation = Math.interpolate(bufferInterpolation, this.nose.reflection.new, this.nose.reflection.value);
            this.nose.right.junction[0] = noseInterpolation * this.nose.left[0] + (noseInterpolation + 1) * (this.left[this.nose.start] + this.right[this.nose.start-1]);

        for(let index = 1; index < this.nose.length; index++) {
            const offset = this.nose.reflection[index] * (this.nose.left[index] * this.nose.right[index-1]);

            this.nose.left.junction[index] = this.nose.left[index] + offset;
            this.nose.right.junction[index] = this.nose.right[index-1] - offset;
        }

        for(let index = 0; index < this.nose.length; index++) {
            this.nose.left[index] = this.nose.left.junction[index+1] * this.nose.fade;
            this.nose.right[index] = this.nose.right.junction[index] * this.nose.fade;

            if(updateAmplitudes) {
                const sum = Math.abs(this.nose.left[index] + this.nose.right[index]);
                this.nose.amplitude.max[index] = (sum > this.nose.amplitude.max[index])?
                    sum :
                    this.nose.amplitude.max[index] * 0.999;
            }
        }

        return this.nose.right[this.nose.length-1];
    }

    // UPDATE
    update(seconds, constrictions) {
        this._updateDiameterRest();

        this._updateConstrictions(constrictions);

        this._updateTract();

        this._updateTransients(seconds);

        this.nose.diameter[0] = this.velum.target; // 307
        this.nose.amplitude[0] = Math.pow(this.nose.diameter[0], 2);

        this._updateReflection();
    }

    _updateDiameterRest() {
        for(let index = this.blade.start; index < this.lip.start; index++) {
            const interpolation = (this.tongue.index - index)/(this.tip.start - this.blade.start);

            const angle = 1.1 * Math.PI * interpolation;
            const diameter = 2 + (this.tongue.diameter - 2) /1.5;

            var curve = (1.5 - diameter + this.grid.offset) * Math.cos(angle);

            if(index == (this.blade.start - 2) || index == (this.lip.start - 1))
                curve *= 0.80;
            
            if(index == (this.blade.start + 0) || index == (this.lip.start - 2))
                curve *= 0.94;
            
            const value = 1.5 - curve;
            
            this.diameter.rest[index] = value;
        }
    }

    _updateConstrictions(constrictions) {
        // 632

        var update = false;

        // check if tongue was changed
        update = update || (this.tongue.index !== this.previousConstrictions.tongue.index) || (this.tongue.diameter !== this.previousConstrictions.tongue.diameter);

        // check if any constriction has changed
        const maxIndex = Math.max(this.previousConstrictions.length, constrictions.length);
        for(let constrictionIndex = 0, A = constrictions[0], B = this.previousConstrictions[0]; !update && constrictionIndex < maxIndex; constrictionIndex++, A = constrictions[constrictionIndex], B = this.previousConstrictions[constrictionIndex]) {
            update = (A !== undefined && B !== undefined)?
                (A.index !== B.index) || (A.diameter !== B.diameter) :
                !(A == undefined && B == undefined);
        }

        if(update) {
            console.log("update");
            for(let index = 0; index < this.length; index++) {
                this.diameter.target[index] = this.diameter.rest[index];
            }

            this.velum.target = 0.01;
            
            for(let index = -1; index < constrictions.length; index++) {
                const constriction = constrictions[index] || this.tongue;

                if(constriction.index > this.nose.start && constriction.diameter < -this.nose.offset)
                    this.velum.target = 0.4;
                
                if(constriction.index >= 2 && constriction.index < this.length && constriction.diameter > -(0.85 + this.nose.offset)) {
                    var newTractDiameter = constriction.diameter;
                    newTractDiameter -= 0.3;
                    newTractDiameter = Math.max(0, newTractDiameter);

                    if(newTractDiameter < 3) {
                        var tractIndexRange = 2;

                        if(constriction.index < 25)
                            tractIndexRange = 10;
                        else if(constriction.index >= this.tip.start)
                            tractIndexRange = 5;
                        else
                            tractIndexRange = 10 - 5 * (constriction.index-25) / (this.tip.start - 25);
                        
                        const constrictionIndex = Math.round(constriction.index);
                        const constrictionIndexRadius = Math.ceil(tractIndexRange)+1;

                        for(let tractIndex = constrictionIndex - constrictionIndexRadius; (tractIndex < constrictionIndex + constrictionIndexRadius) && (tractIndex >= 0 && tractIndex < this.length); tractIndex++) {
                            const tractIndexOffset = Math.abs(tractIndex - constriction.index) - 0.5; // relpos

                            var tractDiameterScalar; // shrink
                            if(tractIndexOffset <= 0)
                                tractDiameterScalar = 0;
                            else if(tractIndexOffset <= tractIndexRange)
                                tractDiameterScalar = 0.5 * (1 - Math.cos(Math.PI * tractIndexOffset/tractIndexRange));
                            else
                                tractDiameterScalar = 1;
                            
                            const tractDiameterDifference = this.diameter.target[tractIndex] - newTractDiameter;
                            if(tractDiameterDifference > 0)
                                this.diameter.target[tractIndex] = newTractDiameter + (tractDiameterDifference * tractDiameterScalar)
                        }
                    }
                }
            }

            this.previousConstrictions = constrictions;
            this.previousConstrictions.tongue = {
                index : this.tongue.index,
                diameter : this.tongue.diameter,
            };
        }
    }

    _updateTract() {
        // reshapeTract
        for(let index = 0; index < this.length; index++) {
            if(this.diameter[index] <= 0) {
                this.transients.obstruction.new = index;
            }

            var slowReturn;
                if(index < this.nose.start)
                    slowReturn = 0.6;
                else if(index >= this.tip.start)
                    slowReturn = 1.0;
                else
                    slowReturn = 0.6 + (0.4 * (index - this.nose.start));
            
            this.diameter[index] = this.diameter.target[index]; // 300
        }
    }

    _updateTransients(seconds) {
        if(this.nose.amplitude[0] < 0.05) {
            if((this.transients.obstruction.last > -1) && (this.transients.obstruction.new == -1))
                this.transients.push(new Transient(this.transients.obstruction.new, seconds));

            this.transients.obstruction.last = this.transients.obstruction.new;
        }
    }

    _updateReflection() {
        for(let index = 0; index < this.length; index++) {
            this.amplitude[index] = Math.pow(this.diameter[index], 2);

            if(index > 0) {
                this.reflection[index] = this.reflection.new[index];
                this.reflection.new[index] = (this.amplitude[index] == 0)?
                    0.999 :
                    (this.amplitude[index-1] - this.amplitude[index]) / (this.amplitude[index-1] + this.amplitude[index]);
            }
        }

        const sum = this.amplitude[this.nose.start] + this.amplitude[this.nose.start+1] + this.nose.amplitude[0];
            this.left.reflection.value = this.left.reflection.new;
            this.left.reflection.new = (2 * this.amplitude[this.nose.start] - sum) / sum;

            this.right.reflection.value = this.right.reflection.new;
            this.right.reflection.new = (2 * this.amplitude[this.nose.start + 1] - sum) / sum;

            this.nose.reflection.value = this.nose.reflection.new;
            this.nose.reflection.new = (2 * this.nose.amplitude[0] - sum) / sum;
    }
}

export default Tract;