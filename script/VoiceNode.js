import VoiceProcessor from "./VoiceProcessor.js";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

if(window.AudioWorklet) {
    // NOISE
    class NoiseNode extends AudioWorkletNode {
        constructor(audioContext) {
            super(audioContext, "noise-worklet-processor");

            this.port.onmessage = event => {
                switch(event.data.type) {
                    default:
                        break;
                }
            }
        }

        start() {
            this.port.postMessage({
                type : "start",
            })
        }
        stop() {
            this.port.postMessage({
                type : "stop",
            })
        }
    };

    window.AudioContext.prototype.createNoise = function() {
        return new NoiseNode(this);
    }


    // VOICE
    class VoiceNode extends AudioWorkletNode {
        constructor(audioContext) {
            super(audioContext, "voice-worklet-processor");
            
            this.params = {
                tongue : {
                    diameter : undefined,
                    index : undefined,
                },
            };
            
            this.parameters.forEach((audioParam, paramName) => {
                if(paramName.includes("tongue")) {
                    const _paramName = (paramName.toLowerCase().includes("diameter"))?
                        "diameter" :
                        "index";
                    this.params.tongue[_paramName] = audioParam;
                }
                else {
                    this.params[paramName] = audioParam;    
                }
            });

            this._availablePositionIndices = [0];
            this._availablePositionIndices.getNewIndex = function() {
                const index = this[0];
                
                if(this.length > 1)
                    this.splice(0, 1);
                else
                    this[0]++

                return index;
            };
            this._availablePositionIndices.removeIndex = function(index) {
                if(this.includes(index)) {
                    return false;
                }
                else {
                    this.push(index);
                    this.sort();  
                    return true;  
                }
            }

            this.port.onmessage = event => {
                switch(event.data.type) {
                    default:
                        break;
                }
            };
        }

        start() {
            this.params.loudness.value = 1;
        }
        stop() {
            this.params.loudness.value = 0;
        }

        addPosition(position) {
            const positionIndex = this._availablePositionIndices.getNewIndex();

            const value = {
                position : position,
            };

            this.port.postMessage({
                type : "position",
                subtype : "add",
                value : JSON.stringify(value),
            });

            return positionIndex;
        }
        movePosition(index, position) {
            const value = {
                index : index,
                position : position,
            };
            this.port.postMessage({
                type : "position",
                subtype : "move",
                value : JSON.stringify(value),
            });
        }
        removePosition(index) {
            this._availablePositionIndices.removeIndex(index);
            const value = {
                index : index,
            };
            this.port.postMessage({
                type : "position",
                subtype : "remove",
                value : JSON.stringify(value),
            })
        }
        updatePositions() {
            this.port.postMessage({
                type : "position",
                subtype : "update",
            })
        }
    };

    window.AudioContext.prototype.createVoice = function() {
        return new VoiceNode(this);
    }
}
else {
    window.AudioContext.prototype.createVoice = function() {
        const voice = this.createScriptProcessor(Math.pow(2, 9));
        voice.processor = new VoiceProcessor(this.sampleRate, voice.bufferSize);

        voice.onaudioprocess = function(event) {
            const inputChannel = event.inputBuffer.getChannelData(0);
            const outputChannel = event.outputBuffer.getChannelData(0);

            for(let index = 0; index < this.bufferSize; index++) {
                const inputSample = inputChannel[index];
                outputChannel[index] = this.processor.process(inputSample, index);
            }

            this.processor.update();
        }

        voice.params = {
            frequency : {
                set value(newFrequency) {
                    voice.processor.glottis.frequency.param = Math.clamp(newFrequency, this.minValue, this.maxValue);
                },
                get value() {
                    return voice.processor.glottis.frequency.param;
                },

                minValue : 10,
                maxValue : 1000,
            },

            tenseness : {
                set value(newTenseness) {
                    voice.processor.glottis.tenseness.param = Math.clamp(newTenseness, this.minValue, this.maxValue);
                },
                get value() {
                    return voice.processor.glottis.tenseness.param;
                },

                minValue : 0,
                maxValue : 1,
            },

            intensity : {
                set value(newIntensity) {
                    voice.processor.glottis.intensity.param = Math.clamp(newIntensity, this.minValue, this.maxValue);
                },
                get value() {
                    return voice.processor.glottis.intensity.param;
                },
                minValue : 0,
                maxValue : 1,
            },

            loudness : {
                set value(newLoudness) {
                    voice.processor.glottis.loudness.param = Math.clamp(newLoudness, this.minValue, this.maxValue);
                },
                get value() {
                    return voice.processor.glottis.loudness.param;
                },
                minValue : 0,
                maxValue : 1,
            },

            wobble : {
                set value(newWobble) {
                    voice.processor.glottis.vibrato.wobble = Math.clamp(newWobble, this.minValue, this.maxValue);
                },
                get value() {
                    return voice.processor.glottis.vibrato.wobble;
                },
                minValue : 0,
                maxValue : 1,
            },

            tongue : {
                set value(newPosition) {
                    const {index, diameter} = newPosition;
                    
                    this.index.value = index;
                    this.diameter.value = diameter;

                    voice.processor.tract.positions.update();
                },
                
                get value() {
                    return {
                        index : this.index.value,
                        diameter : this.diameter.value,
                    };
                },

                diameter : {
                    set value(newDiameter) {
                        voice.processor.tongue.diameter.param = Math.clamp(newDiameter, this.minValue, this.maxValue);
                        voice.processor.tract.positions.update();
                    },
                    get value() {
                        return voice.processor.tongue.diameter.value;
                    },

                    minValue : voice.processor.tongue.diameter.minValue,
                    maxValue : voice.processor.tongue.diameter.maxValue,
                },

                index : {
                    set value(newIndex) {
                        voice.processor.tongue.index.param = Math.clamp(newIndex, this.minValue, this.maxValue);
                        voice.processor.tract.positions.update();
                    },
                    get value() {
                        return voice.processor.tongue.index.value;
                    },

                    minValue : voice.processor.tongue.index.minValue,
                    maxValue : voice.processor.tongue.index.maxValue,
                },
            }
        }

        voice.addPosition = function(position) {
            var index = this.processor.tract.positions.length;
            for(let _index = 0; _index < this.processor.tract.positions.length; _index++)
                if(this.processor.tract.positions[_index] == undefined) {
                    index = _index;
                    break;
                }
            
            this.processor.tract.positions[index] = position;
            this.processor.tract.positions.update();
            return index;
        };
        voice.movePosition = function(index, newPosition) {
            this.processor.tract.positions[index] = newPosition;
            this.processor.tract.positions.update();
        };
        voice.removePosition = function(index) {
            delete this.processor.tract.positions[index];
            this.processor.tract.positions.update();
        }

        voice.start = function() {
            this.params.loudness.value = 1;
        };
        voice.stop = function() {
            this.params.loudness.value = 0;
        }

        return voice;
    }

    window.AudioContext.prototype.createNoise = function() {
        const bufferPeriod = 2;

        const bufferSize = this.sampleRate * bufferPeriod;
        const buffer = this.createBuffer(1, bufferSize, this.sampleRate);

        const channelData = buffer.getChannelData(0);
        for(let index = 0; index < bufferSize; index++) {
            channelData[index] = (Math.random()+1)/2;
        }

        const source = this.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        return source;
    }
}

export {};