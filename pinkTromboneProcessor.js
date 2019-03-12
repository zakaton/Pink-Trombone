import Glottis from "/Glottis.js";
import Tract from "/Tract.js";

Object.assign(Math, {
    clamp : function(input, min, max) {
        var output = input;

        if(output < min)
            output = min;
        else if(output > max)
            output = max;
        
        return output;
    },
    interpolate : function(interpolation, from, to) {
        interpolation = Math.clamp(interpolation, 0, 1);
        const weight = {
            from : (1 - interpolation),
            to : interpolation,
        };
        return (from * weight.from) + (to * weight.to);
    },
    moveTowards : function(current, target, amountUp, amountDown) {
        return (current < target)?
            Math.min(current + amountUp, target) :
            Math.max(current-amountDown, target) ;
    }
})

class PinkTromboneProcessor extends AudioWorkletProcessor {
    constructor() {
        super();

        this.glottis = new Glottis();
        this.tract = new Tract();

        this.alwaysVoice = true;
        this.alwaysWobble = true;

        this.port.onmessage = event => {
            switch(event.data.type) {
                default:
                    break;
            }
        }
    }

    static get parameterDescriptors() {
        return [
            {
                name : "turbulenceNoise"
            },
            {
                name : "alwaysVoice",
                defaultValue : 1,
            },
            {
                name : "alwaysWobble",
                defaultValue : 1,
            },
        ].concat(...Glottis.parameterDescriptors, ...Tract.parameterDescriptors);
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];
        const turbulenceNoise = parameters.turbulenceNoise;

        var bufferLength;

        for(let channelIndex = 0; channelIndex < output.length; channelIndex++) {
            const outputChannel = output[channelIndex];

            for(let sampleIndex = 0; sampleIndex < outputChannel.length; sampleIndex++) {
                if(!bufferLength)
                    bufferLength = outputChannel.length;

                this.setParameters(parameters, sampleIndex);

                const turbulenceNoiseSample = (turbulenceNoise.length === 0)?
                    turbulenceNoise[0] :
                    turbulenceNoise[sampleIndex]

                var outputSample = 0;
                
                outputSample = this.runStep(turbulenceNoiseSample, sampleIndex, bufferLength);
                
                outputChannel[sampleIndex] = outputSample;
            }
        }

        this.finishBlock(bufferLength);

        return true;
    }

    setParameters(parameters, sampleIndex) {
        ["alwaysVoice", "alwaysWobble"].forEach(parameterName => {
            const parameter = parameters[parameterName];
            const sample = parameter.length === 1?
                parameter[0] :
                parameter[sampleIndex];

            this[parameterName] = (sample >= 1);
        })

        this.glottis.setParameters(parameters, sampleIndex);
        this.tract.setParameters(parameters, sampleIndex);
    }

    runStep(turbulenceNoiseSample, sampleIndex, bufferLength) {
        const lambda1 = sampleIndex / bufferLength;
        const lambda2 = (sampleIndex + 0.5) / bufferLength;
        
        const glottisSample = this.glottis.runStep(lambda1, turbulenceNoiseSample);

        var outputSample = 0;

        this.tract.runStep(glottisSample, turbulenceNoiseSample, lambda1, this.glottis.noiseModulator);
            outputSample += this.tract.output.lip + this.tract.output.nose;
        this.tract.runStep(glottisSample, turbulenceNoiseSample, lambda2, this.glottis.noiseModulator);
            outputSample += this.tract.output.lip + this.tract.output.nose;
        
        return outputSample * 0.125;
    }

    finishBlock(bufferLength) {
        this.glottis.finishBlock(this.alwaysWobble, this.alwaysVoice);
        this.tract.finishBlock(bufferLength);
    }
}
registerProcessor("pink-trombone-processor", PinkTromboneProcessor);