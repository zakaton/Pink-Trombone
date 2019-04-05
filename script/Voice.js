import {} from "./VoiceNode.js";

function Voice(audioContext) {
    this.audioContext = audioContext;

    this.noise = this.audioContext.createNoise();
    this.noiseGain = this.audioContext.createGain();
        this.noiseGain.gain.value = 0;

    this.aspirateFilter = this.audioContext.createBiquadFilter();
            this.aspirateFilter.type = "bandpass";
            this.aspirateFilter.frequency.value = 500;
            this.aspirateFilter.Q.value = 0.5;
        
    this.fricativeFilter = this.audioContext.createBiquadFilter();
        this.fricativeFilter.type = "bandpass";
        this.fricativeFilter.frequency.value = 1000;
        this.fricativeFilter.Q.value = 0.5;

    this.voice = this.audioContext.createVoice();

    this.noise.connect(this.noiseGain);
        this.noiseGain.connect(this.aspirateFilter);
            this.aspirateFilter.connect(this.voice);
        this.noiseGain.connect(this.fricativeFilter);
            this.fricativeFilter.connect(this.voice);
    
    this.voice.connect(this.audioContext.destination);
    this.noise.start();
}

Voice.prototype.start = function() {
    if(this.audioContext.state !== "running")
        this.audioContext.resume();

    this.noiseGain.gain.value = 1;
    this.voice.start();
}
Voice.prototype.stop = function() {
    this.noiseGain.gain.value = 0;
    this.voice.stop();
}

export default Voice;