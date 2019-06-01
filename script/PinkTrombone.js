/*
    TODO
        *
*/

import {} from "./audio/nodes/noise/AudioNode.js";
import {} from "./audio/nodes/pinkTrombone/AudioNode.js";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

class PinkTrombone {
    addModules(audioContext) {
        if(audioContext.audioWorklet !== undefined) {
            return Promise.all([
                audioContext.audioWorklet.addModule("/script/audio/nodes/noise/processors/workletProcessors/WorkletProcessor.js"),
                audioContext.audioWorklet.addModule("/script/audio/nodes/pinkTrombone/processors/workletProcessors/WorkletProcessor.js"),
            ]);
        }
        else {
            return new Promise(resolve => {
                resolve();
            });
        }
    }

    constructor(audioContext) {
        this.loadPromise = 
            this.addModules(audioContext)
                .then(() => {
                    this.audioContext = audioContext;
                    this.setupAudioGraph();
                    return this.audioContext;
                });
    }

    setupAudioGraph() {
        this.noise = this.audioContext.createNoise();

        this.aspirateFilter = this.audioContext.createBiquadFilter();
                this.aspirateFilter.type = "bandpass";
                this.aspirateFilter.frequency.value = 500;
                this.aspirateFilter.Q.value = 0.5;
            
        this.fricativeFilter = this.audioContext.createBiquadFilter();
            this.fricativeFilter.type = "bandpass";
            this.fricativeFilter.frequency.value = 1000;
            this.fricativeFilter.Q.value = 0.5;

        this.pinkTromboneNode = this.audioContext.createPinkTromboneNode();

        this.noise.connect(this.aspirateFilter);
            this.aspirateFilter.connect(this.pinkTromboneNode.noise);

        this.noise.connect(this.fricativeFilter);
            this.fricativeFilter.connect(this.pinkTromboneNode.noise);
    }

    connect() {
        return this.pinkTromboneNode.connect(...arguments);
    }
    disconnect() {
        return this.pinkTromboneNode.disconnect(...arguments);
    }

    start() {
        this.noise.start();
    }
    stop() {
        this.noise.stop();
    }

    newConstriction() {
        return this.pinkTromboneNode.newConstriction(...arguments);
    }
    removeConstriction(constriction) {
        this.pinkTromboneNode.removeConstriction(constriction);
    }
}

window.AudioContext.prototype.createPinkTrombone = function() {
    return new PinkTrombone(this);
}

export default PinkTrombone;