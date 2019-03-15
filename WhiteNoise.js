class WhiteNoise extends AudioWorkletNode {
    constructor(audioContext) {
        if(!WhiteNoise.isLoaded)
            throw "Not Loaded!";

        super(audioContext, "white-noise-processor");
        this.started = false;
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
        this.started = true;
    }
    stop() {
        this.port.postMessage({
            type : "stop",
        })
        this.started = false;
    }
}

export default WhiteNoise;