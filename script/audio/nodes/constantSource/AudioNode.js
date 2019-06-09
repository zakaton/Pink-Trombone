/*
    TODO
        define custom value setters
*/

Math.clamp = function(value, min, max) {
    return value <= min?
    min :
    value < max?
        value :
        max;
}

Math.interpolate = function(interpolation, from, to) {
    interpolation = Math.clamp(interpolation, 0, 1);
    return (from * (1 - interpolation)) + (to * (interpolation));
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;

if(window.AudioContext.prototype.createConstantSource == undefined) {
    window.AudioContext.prototype.createConstantSource = function() {
        
        const constantSourceNode = this.createScriptProcessor(Math.pow(2, 14), 1, 1);
        constantSourceNode._isRunning = false;
        constantSourceNode._audioContext = this;
        constantSourceNode.offset = constantSourceNode;
    
        constantSourceNode.__interpolationMode = "none";
        Object.defineProperty(constantSourceNode, "_interpolationMode", {
            get : function() {
                return this.__interpolationMode;
            },
            set : function(newValue) {
                if(["none", "linear"].includes(newValue))
                    this.__interpolationMode = newValue;
            }
        });

        constantSourceNode._startValue;
        constantSourceNode._targetValue;

        constantSourceNode._startTime;
        constantSourceNode._targetTime;
        constantSourceNode._duration;

        constantSourceNode.minValue = -3.402820018375656e+38;
        constantSourceNode.maxValue = +3.402820018375656e+38;
        constantSourceNode._clamp = function(newValue) {
            return Math.clamp(newValue, this.minValue, this.maxValue);
        }

        constantSourceNode._update = function() {
            if(this._interpolationMode !== "none") {
                const timeOffset = (this._audioContext.currentTime - this._startTime);
                
                const linearInterpolation = timeOffset/this._duration;
                var interpolation = linearInterpolation;

                switch(this._interpolationMode) {
                    case "linear":
                        interpolation = linearInterpolation;
                        break;
                    default:
                        break;
                }

                interpolation = Math.clamp(interpolation, 0, 1);

                this._value = this._clamp(Math.interpolate(interpolation, this._startValue, this._targetValue));
                
                if(interpolation >= 1)
                    this._interpolationMode = "none";
            }
        }

        constantSourceNode._value = 1;
        Object.defineProperty(constantSourceNode, "value", {
            get : function() {
                return this._value;
            },
            set : function(newValue) {
                this._interpolationMode = "none";
                this._value = Math.clamp(newValue, this.minValue, this.maxValue);
            },
        });

        constantSourceNode.linearRampToValueAtTime = function(value, time) {
            // FILL
            this.value = value;
            return this;
        }
        constantSourceNode.setValueAtTime = function(value, time) {
            // FILL
            this.value = value;
            return this;
        }
        constantSourceNode.exponentialRampToValueAtTime = function(value, time) {
            // FILL
            this.value = value;
            return this;
        }
        constantSourceNode.setTargetAtTime = function(value, time, timeConstant) {
            // FILL
            this.value = value;
            return this;
        }
        constantSourceNode.setValueAtTime = function(value, time) {
            // FILL
            this.value = value;
            return this;
        }
        constantSourceNode.setValueCurveAtTime = function(value, time, duration) {
            // FILL
            this.value = value;
            return this;
        }

        constantSourceNode.onaudioprocess = function(event) {
            const inputChannel = event.inputBuffer.getChannelData(0);
            const outputChannel = event.outputBuffer.getChannelData(0);

            if(this._isRunning)
                for(let sampleIndex = 0; sampleIndex < outputChannel.length; sampleIndex++) {
                    this._update();
                    outputChannel[sampleIndex] = inputChannel[sampleIndex] + this.value;
                }
        }

        constantSourceNode.start = function() {
            this._isRunning = true;
        }
        constantSourceNode.stop = function() {
            this._isRunning = false;
        }

        return constantSourceNode;
    }
}

export {};