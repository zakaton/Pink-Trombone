class WhiteNoise extends AudioWorkletNode {
    constructor(audioContext) {
        if(!WhiteNoise.isLoaded)
            throw "Not Loaded!";

        super(audioContext, "white-noise-processor");
    }

    static Load(audioContext) {
        return audioContext.audioWorklet.addModule("whiteNoiseProcessor.js").then(() => {
            this.isLoaded = true;
        })
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
}

export default WhiteNoise;