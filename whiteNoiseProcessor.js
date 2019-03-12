class WhiteNoiseProcessor extends AudioWorkletProcessor {
    constructor() {
        super();

        this.length = 16;
        this.play = false;

        this.port.onmessage = event => {
            switch(event.data.type) {
                case "start":
                    this.start();
                    break;
                case "stop":
                    this.stop();
                    break;
                default:
                    break;
            }
        }
    }

    start() {
        this.play = true;
    }
    stop() {
        this.play = false;
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];

        for(let channelIndex = 0; channelIndex < output.length; channelIndex++) {
            const outputChannel = output[channelIndex];

            for(let sampleIndex = 0; sampleIndex < outputChannel.length; sampleIndex++) {
                var outputSample = 0;

                if(this.play) {
                    for(let i = 0; i < this.length; i++) {
                        outputSample += Math.random();
                    }
                    outputSample -= this.length/2;
                    outputSample /= this.length/4;
                }

                outputChannel[sampleIndex] = outputSample;
            }
        }
        
        return true;
    }
}
registerProcessor("white-noise-processor", WhiteNoiseProcessor);