/*
    TODO            
        add "precision" property to iterate this.tract.process
*/

import Glottis from "./Glottis.js";
import Tract from "./Tract.js";

class Processor {
  constructor() {
    this.glottis = new Glottis();
    this.tract = new Tract();
  }

  process(parameterSamples, sampleIndex, bufferLength, seconds) {
    var outputSample = 0;

    const {
      outputSample: glottisSample,
      noise,
      voice,
    } = this.glottis.process(...arguments);
    parameterSamples.glottis = glottisSample;

    const {
      outputSample: tractSample1,
      nose: nose1,
      lips: lips1,
    } = this.tract.process(...arguments);
    outputSample += tractSample1;
    sampleIndex += 0.5; // process twice - note the "...arguments" doesn't read this
    const {
      outputSample: tractSample2,
      nose: nose2,
      lips: lips2,
    } = this.tract.process(
      parameterSamples,
      sampleIndex,
      bufferLength,
      seconds
    );
    outputSample += tractSample2;

    outputSample *= 0.125;

    const nose = nose1 + nose2;
    const lips = lips1 + lips2;

    return { outputSample, glottisSample, noise, voice, nose, lips };
  }

  update(seconds, constrictions) {
    this.glottis.update();
    this.tract.update(seconds, constrictions);
  }
}

export default Processor;
