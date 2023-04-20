/*
    TODO
        start/stop for the pinkTromboneNode
*/

import {} from "./audio/nodes/constantSource/AudioNode.js";
import {} from "./audio/nodes/noise/AudioNode.js";
import {} from "./audio/nodes/pinkTrombone/AudioNode.js";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

class PinkTrombone {
  addModules(audioContext) {
    if (audioContext.audioWorklet !== undefined) {
      // return audioContext.audioWorklet.addModule(
      //   "./script/audio/nodes/pinkTrombone/processors/WorkletProcessor.js"
      // );
      return audioContext.audioWorklet.addModule(
        "./pink-trombone-worklet-processor.min.js"
      );
    } else {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
  }

  constructor(audioContext) {
    this.loadPromise = this.addModules(audioContext).then(() => {
      this.audioContext = audioContext;
      this.setupAudioGraph();
      return this.audioContext;
    });
  }

  setupAudioGraph() {
    this._noise = this.audioContext.createNoise();

    this._aspirateFilter = this.audioContext.createBiquadFilter();
    this._aspirateFilter.type = "bandpass";
    this._aspirateFilter.frequency.value = 500;
    this._aspirateFilter.Q.value = 0.5;

    this._fricativeFilter = this.audioContext.createBiquadFilter();
    this._fricativeFilter.type = "bandpass";
    this._fricativeFilter.frequency.value = 1000;
    this._fricativeFilter.Q.value = 0.5;

    this._pinkTromboneNode = this.audioContext.createPinkTromboneNode();

    this._noise.connect(this._aspirateFilter);
    this._aspirateFilter.connect(this._pinkTromboneNode.noise);

    this._noise.connect(this._fricativeFilter);
    this._fricativeFilter.connect(this._pinkTromboneNode.noise);

    this._gain = this.audioContext.createGain();
    this._gain.gain.value = 0;
    this._pinkTromboneNode.channelSplitter.connect(this._gain);
  }

  get parameters() {
    return this._pinkTromboneNode._parameters;
  }

  connect() {
    return this._gain.connect(...arguments);
  }
  disconnect() {
    return this._gain.disconnect(...arguments);
  }

  start() {
    this._gain.gain.value = 1;
  }
  stop() {
    this._gain.gain.value = 0;
  }

  get constrictions() {
    return this._pinkTromboneNode.constrictions;
  }
  newConstriction() {
    return this._pinkTromboneNode.newConstriction(...arguments);
  }
  removeConstriction(constriction) {
    this._pinkTromboneNode.removeConstriction(constriction);
  }

  getProcessor() {
    return this._pinkTromboneNode.getProcessor();
  }
}

window.AudioContext.prototype.createPinkTrombone = function () {
  return new PinkTrombone(this);
};

export default PinkTrombone;
