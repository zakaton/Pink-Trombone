class NoiseWorkletProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.isPlaying = false;

        this.port.onmessage = event => {
            switch(event.data.type) {
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

    process(inputs, outputs, parameters) {
        const output = outputs[0];
        const channelCount = output.length;

        for(let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
            const outputChannel = output[channelIndex];
            const sampleCount = outputChannel.length;
            
            for(let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {                
                
                output[channelIndex][sampleIndex] = this.isPlaying?
                    (Math.random()*2)-1 :
                    0;
            }
        }

        return true;
    }
}

registerProcessor("noise-worklet-processor", NoiseWorkletProcessor);