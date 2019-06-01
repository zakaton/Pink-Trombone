/*
    TODO
        Get the buffer to work...
        Parameterize this.buffer.length
        Parameterize whether its fixed or dynamic
        Parameterize Random generator (white, pink, brown...)
*/

class NoiseWorkletProcessor extends AudioWorkletProcessor {
    createBuffer(bufferLength = Math.pow(2, 7)) {
        this.buffer = new Float32Array(bufferLength);

        for(let sampleIndex = 0; sampleIndex < bufferLength; sampleIndex++)
            this.buffer[sampleIndex] = ((Math.random() *2) -1);
    }

    constructor() {
        super();

        this.isPlaying = false;
        this.createBuffer();

        this.port.onmessage = (event) => {
            switch(event.data.name) {
                case "start":
                    this.isPlaying = true;
                    break;
                case "stop":
                    this.isPlaying = false;
                    break;
                default:
                    break;
            }
        }
    }

    static get parameterDescriptors() {
        return [

        ];
    }

    process(inputs, outputs, parameters) {

        for(let outputIndex = 0; outputIndex < outputs.length; outputIndex++)
            for(let channelIndex = 0; channelIndex < outputs[outputIndex].length; channelIndex++)
                for(let sampleIndex = 0; sampleIndex < outputs[outputIndex][channelIndex].length; sampleIndex++)
                    outputs[outputIndex][channelIndex][sampleIndex] = ((Math.random() *2) -1);

        return true;
    }
}

registerProcessor("noise-worklet-processor", NoiseWorkletProcessor);