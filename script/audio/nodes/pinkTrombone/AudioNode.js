/*
    TODO
        *
*/

import ParameterDescriptors from "./processors/workletProcessors/ParameterDescriptors.js";
import Processor from "./processors/Processor.js";
import {} from "./constantSourceNode/AudioNode.js";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

// CONSTRUCTOR HELPERS
function setupNode(audioNode) {
    audioNode._constrictions = [];
    for(let constrictionIndex = 0; constrictionIndex < ParameterDescriptors.numberOfConstrictions; constrictionIndex++) {
        audioNode._constrictions[constrictionIndex] = {
            _index : constrictionIndex,

            index : null,
            diameter : null,

            _enable : () => audioNode._enableConstriction(constrictionIndex),
            _disable : () => audioNode._disableConstriction(constrictionIndex),

            _isEnabled : false,
        };
    }

    audioNode.newConstriction = function(index, diameter) {
        return this._constrictions.find(constriction => {
            if(!constriction._isEnabled) {
                if(index !== undefined)
                    constriction.index.value = index;

                if(diameter !== undefined)
                    constriction.diameter.value = diameter;

                constriction._enable();
                return true;
            }
        });
    }

    audioNode.removeConstriction = function(constriction) {
        constriction._disable();
    }

    Object.defineProperty(audioNode, "constrictions", {
        get : function() {
            return this._constrictions.filter(constriction => constriction._isEnabled)
        }
    });

    audioNode._parameters = {};

    audioNode.tongue = audioNode._parameters.tongue = {
        index : null,
        diameter : null,
    };
    audioNode.vibrato = audioNode._parameters.vibrato = {
        frequency : null,
        gain : null,
        wobble : null,
    };
}
function assignAudioParam(audioNode, audioParam, paramName) {
    if(paramName.includes("constriction")) {
        const constrictionIndex = Number(paramName.match(/[0-9]+/g)[0]);
        const constriction = audioNode._constrictions[constrictionIndex];

        constriction[paramName.includes("index")? "index":"diameter"] = audioParam;
        
        audioNode.constrictions[constrictionIndex] = constriction;
    }
    else if(paramName.includes("vibrato")) {
        audioNode.vibrato[paramName.replace("vibrato", '').toLowerCase()] = audioParam;
    }
    else if(paramName.includes("tongue")) {
        audioNode.tongue[paramName.replace("tongue", '').toLowerCase()] = audioParam;
    }
    else {
        audioNode[paramName] = audioNode._parameters[paramName] = audioParam;    
    }
}

if(false && window.AudioWorklet !== undefined) {
    class PinkTromboneNode extends AudioWorkletNode {
        constructor(audioContext) {
            super(audioContext, "pink-trombone-worklet-processor");

            setupNode(this);

            this.parameters.forEach((audioParam, paramName) => {
                assignAudioParam(this, audioParam, paramName);
            });

            this.port.onmessage = (event) => {
                switch(event.data.name) {
                    default:
                        break;
                }
            }
        }

        _postMessage(eventData) {
            eventData.id = Math.random();

            return new Promise((resolve, reject) => {
                const resolveCallback = (event) => {
                    if(eventData.id == Number(event.data.id)) {
                        this.port.removeEventListener("message", resolveCallback);
                        resolve(event);
                    }
                }

                this.port.addEventListener("message", resolveCallback);
                this.port.postMessage(eventData);
            });
        }

        _enableConstriction(constrictionIndex) {
            return this._postMessage({
                name : "enableConstriction",
                constrictionIndex : constrictionIndex,
            }).then(() => {
                this._constrictions[constrictionIndex]._isEnabled = true;
            });
        }

        _disableConstriction(constrictionIndex) {
            return this._postMessage({
                name : "disableConstriction",
                constrictionIndex : constrictionIndex,
            }).then(() => {
                this._constrictions[constrictionIndex]._isEnabled = false; 
            });
        }

        getProcessor() {
            return this._postMessage({
                name : "getProcessor",
            }).then(event => {
                return JSON.parse(event.data.processor);
            });
        }
    }

    window.AudioContext.prototype.createPinkTromboneNode = function() {
        return new PinkTromboneNode(this, ...arguments);
    }
}
else {
    window.AudioContext.prototype.createPinkTromboneNode = function() {
        const pinkTromboneNode = this.createScriptProcessor(Math.pow(2, 11), ParameterDescriptors.length, 1);
        pinkTromboneNode.processor = new Processor();

        setupNode(pinkTromboneNode);

        pinkTromboneNode.channelMerger = this.createChannelMerger(ParameterDescriptors.length);
            pinkTromboneNode.channelMerger.channels = [];
        pinkTromboneNode.channelMerger.connect(pinkTromboneNode);

        ParameterDescriptors.forEach((parameterDescriptor, index) => {
            const constantSource = this.createConstantSource();
            constantSource.start();

            const audioParam = constantSource.offset;
                audioParam.automationRate = parameterDescriptor.automationRate || "a-rate";
                audioParam.value = parameterDescriptor.defaultValue || 0;
            constantSource.connect(pinkTromboneNode.channelMerger, 0, index);

            pinkTromboneNode.channelMerger.channels[index] = parameterDescriptor.name;

            assignAudioParam(pinkTromboneNode, audioParam, parameterDescriptor.name);
        });


        pinkTromboneNode._getParameterChannels = function(inputBuffer) {
            const parameterChannels = {};

            for(let channelIndex = 0; channelIndex < inputBuffer.numberOfChannels; channelIndex++) {
                parameterChannels[this.channelMerger.channels[channelIndex]] = inputBuffer.getChannelData(channelIndex);
            }
            
            return parameterChannels;
        }

        pinkTromboneNode._getParameterSamples = function(parameterChannels, sampleIndex) {
            const parameterSamples = {};
            const parameterNames = Object.keys(parameterChannels);

            for(let channelIndex = 0; channelIndex < parameterNames.length; channelIndex++) {
                const parameterName = parameterNames[channelIndex];
                
                if(!parameterName.includes("constriction"))
                    parameterSamples[parameterName] = parameterChannels[parameterName][sampleIndex];
            }

            return parameterSamples;
        }

        pinkTromboneNode._getConstrictions = function(parameterChannels) {
            const constrictions = [];

            for(let constrictionIndex = 0; constrictionIndex < this._constrictions.length; constrictionIndex++) {
                const _constriction = this._constrictions[constrictionIndex];

                if(_constriction._isEnabled) {
                    const constriction = {
                        index : parameterChannels["constriction" + constrictionIndex + "index"][0],
                        diameter : parameterChannels["constriction" + constrictionIndex + "diameter"][0],
                    };

                    constrictions[constrictionIndex] = constriction;    
                }
            }

            return constrictions;
        }
        
        pinkTromboneNode.onaudioprocess = function(event) {
            const outputChannel = event.outputBuffer.getChannelData(0);

            const parameterChannels = this._getParameterChannels(event.inputBuffer);
            const constrictions = this._getConstrictions(parameterChannels);

            for(let sampleIndex = 0; sampleIndex < outputChannel.length; sampleIndex++) {
                const parameterSamples = this._getParameterSamples(parameterChannels, sampleIndex);
                const bufferLength = outputChannel.length;
                const seconds = event.playbackTime + (sampleIndex/event.inputBuffer.sampleRate);

                outputChannel[sampleIndex] = this.processor.process(parameterSamples, sampleIndex, bufferLength, seconds, constrictions);
            }

            this.processor.update(event.playbackTime + (outputChannel.length/event.inputBuffer.sampleRate), constrictions);
        }

        pinkTromboneNode._enableConstriction = function(constrictionIndex) {
            this._constrictions[constrictionIndex]._isEnabled = true;
        }
        pinkTromboneNode._disableConstriction = function(constrictionIndex) {
            this._constrictions[constrictionIndex]._isEnabled = false;
        }

        pinkTromboneNode.getProcessor = function() {
            return new Promise((resolve, reject) => {
                resolve(this.processor);
            });
        }

        return pinkTromboneNode;
    }
}

export {};