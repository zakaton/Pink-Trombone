/*
    TODO
        figure when to update tongue...
*/

import VoiceProcessor from "./VoiceProcessor.js";

class VoiceWorkletProcessor extends AudioWorkletProcessor {
    constructor() {
        super();

        this.processor = new VoiceProcessor(sampleRate, Math.pow(2, 9));

        this.port.onmessage = event => {
            switch(event.data.type) {
                case "position":
                    const value = event.data.value?
                        JSON.parse(event.data.value) :
                        {};
                    const {position, index} = value;

                    switch(event.data.subtype) {
                        case "add":
                            const _index = index || Math.max(0, this.processor.tract.positions.findIndex(value => (value == undefined)));
                            this.processor.tract.positions[_index] = position;
                            break;
                        case "move":
                            this.processor.tract.positions[index] = position;
                            break;
                        case "remove":
                            delete this.processor.tract.positions[index];
                            break;
                        case "update":
                            // just let it pass through to update
                            break;
                        default:
                            break;
                    }
                    this.processor.tract.positions.update();
                    break;
                default:
                    break;
            }
        }
    }

    static get parameterDescriptors() {
        return [
            {
                name : "frequency",
                defaultValue : 140,
                minValue : 10,
                maxValue : 1000,
            },
            {
                name : "tenseness",
                defaultValue : 0.6,
                minValue : 0,
                maxValue : 1,
            },
            {
                name : "intensity",
                defaultValue : 1,
                minValue : 0,
                maxValue : 1,
            },
            {
                name : "loudness",
                defaultValue : 0,
                minValue : 0,
                maxValue : 1,
            },
            {
                name : "wobble",
                defaultValue : 1,
                minValue : 0,
                maxValue : 1,
            },

            // TONGUE
            {
                name : "tongueDiameter",
                defaultValue : 2.43,
                minValue : -3,
                maxValue : 4,
            },
            {
                name : "tongueIndex",
                defaultValue : 12.9,
                minValue : 0,
                maxValue : 44,
            },
        ];
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        for(let channelIndex = 0; channelIndex < input.length; channelIndex++) {
            const inputChannel = input[channelIndex];
            
            for(let sampleIndex = 0; sampleIndex < inputChannel.length; sampleIndex++) {
                const inputSample = inputChannel[sampleIndex];
                
                output[channelIndex][sampleIndex] = this.processor.process(inputSample, sampleIndex); 
            }
        }

        // UPDATE PARATEMETERS
        ["frequency", "tenseness", "intensity", "loudness"].forEach(parameterName => {
            this.processor.glottis[parameterName].param = parameters[parameterName][0];
        });
        
        this.processor.glottis.vibrato.wobble = parameters["wobble"][0];

        ["tongueDiameter", "tongueIndex"].forEach(parameterName => {
            this.processor.tongue[parameterName.replace("tongue", '').toLowerCase()].param = parameters[parameterName][0];
        });

        this.processor.update();

        return true;
    }
}

registerProcessor("voice-worklet-processor", VoiceWorkletProcessor);