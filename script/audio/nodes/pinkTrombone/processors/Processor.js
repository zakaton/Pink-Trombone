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

    process(inputSamples, parameterSamples, sampleIndex, bufferLength, seconds) {
        var outputSample = 0;

        if (inputSamples) {
            parameterSamples.glottis = inputSamples[sampleIndex];
        } else {
            const glottisSample = this.glottis.process(...arguments);
            parameterSamples.glottis = glottisSample;
        }

        outputSample += this.tract.process(...arguments);
        sampleIndex += 0.5; // process twice - note the "...arguments" doesn't read this
        outputSample += this.tract.process(inputSamples, parameterSamples, sampleIndex, bufferLength, seconds);

        if (!inputSamples) {
            outputSample *= 0.125;
        }

        return outputSample;
    }

    update(seconds, constrictions) {
        this.glottis.update();
        this.tract.update(seconds, constrictions);
    }
}

export default Processor;
