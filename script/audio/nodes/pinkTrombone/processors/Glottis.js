/*
    TODO
        simplify the tenseness (as an interpolation between noise and voice)
        normalizedWaveform & noiseModulator getter|setter
*/

Math.clamp = function(value, min, max) {
    if(value <= min)
        return min;
    else if (value < max)
        return value;
    else
        return max;
}

import SimplexNoise from "./SimplexNoise.js";

class Glottis {
    constructor() {
        this.noise = new SimplexNoise();

        this.coefficients = {
            alpha : 0,
            Delta : 0,
            E0 : 0,
            epsilon : 0,
            omega : 0,
            shift : 0,
            Te : 0,
        };

        this.startSeconds = 0;
    }

    process(parameterSamples, sampleIndex, bufferLength, seconds) {

        const intensity = parameterSamples.intensity;
        const loudness = parameterSamples.loudness;

        var vibrato = 0;
        vibrato += parameterSamples.vibratoGain * Math.sin(2 * Math.PI * seconds * parameterSamples.vibratoFrequency);
        vibrato += 0.02 * this.noise.simplex1(seconds * 4.07);
        vibrato += 0.04 * this.noise.simplex1(seconds * 2.15);

        if(parameterSamples.vibratoWobble > 0) {
            var wobble = 0;
                wobble += 0.2 * this.noise.simplex1(seconds * 0.98);
                wobble += 0.4 * this.noise.simplex1(seconds * 0.50);
            vibrato += wobble * parameterSamples.vibratoWobble;
        }

        var frequency = parameterSamples.frequency;
        frequency *= (1 + vibrato);

        var tenseness = parameterSamples.tenseness;
        tenseness += 0.10 * this.noise.simplex1(seconds * 0.46);
        tenseness += 0.05 * this.noise.simplex1(seconds * 0.36);
        tenseness += (3 - tenseness) * (1 - intensity);


        // waveform.update()
        const period = (1/frequency);

        var secondsOffset = (seconds - this.startSeconds);
        var interpolation = secondsOffset/period;

        if(interpolation >= 1) {
            this.startSeconds = seconds + (secondsOffset % period);
            interpolation = this.startSeconds/period;
            this._updateCoefficients(tenseness);
        }


        // process
        var outputSample = 0;
        
        var noiseModulator = this._getNoiseModulator(interpolation);
            noiseModulator += ((1 -(tenseness*intensity)) *3);
        parameterSamples.noiseModulator = noiseModulator;

        var noise = parameterSamples.noise;
            noise *= noiseModulator;
            noise *= tenseness;
            noise *= intensity;
            //noise *= intensity;
            noise *= (1 - Math.sqrt(Math.max(tenseness, 0)));
            noise *= (0.02*this.noise.simplex1(seconds*1.99)) + 0.2;

        var voice = this._getNormalizedWaveform(interpolation);
            //voice *= intensity;
            voice *= loudness;

        outputSample = noise + voice;
        outputSample *= intensity;

        return outputSample;
    }

    update() {
        
    }

    _updateCoefficients(tenseness = 0) {

        const R = {};
            R.d = Math.clamp(3*(1-tenseness), 0.5, 2.7);
            R.a = -0.01 + 0.048*R.d;
            R.k = 0.224 + 0.118*R.d;
            R.g = (R.k/4)*(0.5+1.2*R.k)/(0.11*R.d-R.a*(0.5+1.2*R.k));

        const T = {};
            T.a = R.a;
            T.p = 1/(2*R.g);
            T.e = T.p + T.p*R.k;

        this.coefficients.epsilon = 1/T.a;
        this.coefficients.shift = Math.exp(-this.coefficients.epsilon * (1-T.e));
        this.coefficients.Delta = 1 - this.coefficients.shift;

        const integral = {};
            integral.RHS = ((1/this.coefficients.epsilon) * (this.coefficients.shift-1) + (1-T.e) * this.coefficients.shift) / this.coefficients.Delta;
            integral.total = {};
                integral.total.lower = -(T.e - T.p)/2 + integral.RHS;
                integral.total.upper = -integral.total.lower;
        
        this.coefficients.omega = Math.PI/T.p;
        
        const s = Math.sin(this.coefficients.omega * T.e);
        const y = -Math.PI * s * integral.total.upper / (T.p*2);
        const z = Math.log(y);

        this.coefficients.alpha = z/(T.p/2 - T.e);
        this.coefficients.E0 = -1 / (s*Math.exp(this.coefficients.alpha*T.e));
        this.coefficients.Te = T.e;
    }

    _getNormalizedWaveform(interpolation) {
        return (interpolation > this.coefficients.Te)?
            (-Math.exp(-this.coefficients.epsilon * (interpolation-this.coefficients.Te)) + this.coefficients.shift)/this.coefficients.Delta :
            this.coefficients.E0 * Math.exp(this.coefficients.alpha*interpolation) * Math.sin(this.coefficients.omega * interpolation);
    }

    _getNoiseModulator(interpolation) {
        const angle = 2*Math.PI*interpolation;
        const amplitude = Math.sin(angle);
        const positiveAmplitude = Math.max(0, amplitude);
        
        const offset = 0.1
        const gain = 0.2;

        const noiseModulator = ((positiveAmplitude *gain) + offset);

        return noiseModulator;
    }
}

export default Glottis;