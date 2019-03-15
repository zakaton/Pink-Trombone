import SimplexNoise from "./SimplexNoise.js";

class Glottis {
    constructor() {
        this.noise = new SimplexNoise();

        this.time = {
            inWaveform : 0,
            total : 0,
            get step() {return 1.0 / sampleRate},
        }
        
        this.frequency = {
            current : 140,
            new : 140,
            old : 140,
            UI : 140,
            smooth : 140,
        };
        
        this.tenseness = {
            current : 0.6,
            old : 0.6,
            new : 0.6,
            UI : 0.6,
        };

        this.vibrato = {
            amount : 0.005,
            frequency : 6,
        };

        this.intensity = 0;
        this.loudness = 1;

        this.semitones = 20;
        this.marks = [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0];
        this.baseNote = 87.3071;

        this.isTouched = false;

        this.setupWaveform(0);
    }

    get waveformLength() {
        return 1.0/this.frequency.current;
    }
    set waveformLength(newWaveformLength) {
        this.frequency = 1.0/newWaveformLength;
    }

    get waveformInterpolation() {
        return this.time.inWaveform / this.waveformLength;
    }

    static get parameterDescriptors() {
        return [
            // can define custom parameters that will be used by the pinkTromboneWorkletProcessor
        ]
    }
    setParameters(parameters, sampleIndex) {
        // will be passed parameters from the parent pinkTromboneWorkletProcessor in its .process method
    }

    setupWaveform(lambda) {
        ["frequency", "tenseness"].forEach(type => this[type].current = Math.interpolate(lambda, this[type].old, this[type].new));
        
        const R = {};
            R.d = Math.clamp(3*(1-this.tenseness.current), 0.5, 2.7);
            R.a = -0.05 + 0.048*R.d;
            R.k = 0.224 + 0.118*R.d;
            R.g = (R.k/4)*(0.5+1.2*R.k)/(0.11*R.d-R.a*(0.5+1.2*R.k));

        const T = {};
            T.a = R.a;
            T.p = 1/(2*R.g);
            T.e = T.p + T.p*R.k;
        
        this.epsilon = 1/T.a;
        this.shift = Math.exp(-this.epsilon * (1-T.e));
        this.Delta = 1 - this.shift;

        const RHSIntegral = ((1/this.epsilon)*(this.shift-1) + (1-T.e)*this.shift)/this.Delta;

        const totalIntegral = {
            lower : -(T.e-T.p)/2 + RHSIntegral,
            get upper() {return -this.lower},
        };

        this.omega = Math.PI/T.p;
        const s = Math.sin(this.omega*T.e);
        const y = -Math.PI*s*totalIntegral.upper / (T.p*2);
        const z = Math.log(y);

        this.alpha = z/(T.p/2 - T.e);
        this.E0 = -1 / (s*Math.exp(this.alpha*T.e));
        this.Te = T.e;
    }
    runStep(lambda, noiseSource) {
        this.time.inWaveform += this.time.step;
        this.time.total += this.time.step;
        
        if(this.time.inWaveform > this.waveformLength) {
            this.time.inWaveform -= this.waveformLength;
            this.setupWaveform(lambda);
        }

        var out = this.normalizedLFWaveform;
        var aspiration = this.intensity * (1-Math.sqrt(this.tenseness.UI))*this.noiseModulator*noiseSource;
            aspiration *= 0.2 + 0.02*this.noise.simplex1(this.time.total * 1.99);
        out += aspiration;

        return out;
    }
    get normalizedLFWaveform() {
        const output = (this.waveformInterpolation > this.Te)?
            (-Math.exp(-this.epsilon * (this.waveformInterpolation-this.Te)) + this.shift)/this.Delta :
            this.E0 * Math.exp(this.alpha*this.waveformInterpolation) * Math.sin(this.omega * this.waveformInterpolation);

            return output * this.intensity * this.loudness;
    }
    get noiseModulator() {
        const voiced = 0.1 + 0.2 * Math.max(0, Math.sin(Math.PI * 2 * this.waveformInterpolation));
        return this.tenseness.UI * this.intensity * voiced + (1 - this.tenseness.UI * this.intensity) * 0.3;
    }
    finishBlock(autoWobble, alwaysVoice) {
        var vibrato = 0;
            // can connect an Oscillator for the vibrato, and maybe a Simplex node as well
            vibrato += this.vibrato.amount * Math.sin(2 * Math.PI * this.time.total * this.vibrato.frequency);
            vibrato += 0.02 * this.noise.simplex1(this.time.total * 4.07);
            vibrato += 0.04 * this.noise.simplex1(this.time.total * 2.15);
        
        if(autoWobble) {
            vibrato += 0.2 * this.noise.simplex1(this.time.total * 0.98);
            vibrato += 0.4 * this.noise.simplex1(this.time.total * 0.50);
        }

        if(this.frequency.UI > this.frequency.smooth)
            this.frequency.smooth = Math.min(this.frequency.smooth * 1.1, this.frequency.UI);
        if(this.frequency.UI < this.frequency.smooth)
            this.frequency.smooth = Math.max(this.frequency.smooth / 1.1, this.frequency.UI);
        
        this.frequency.old = this.frequency.new;
        this.frequency.new = this.frequency.smooth * (1+vibrato);
        
        this.tenseness.old = this.tenseness.new;
        this.tenseness.new = this.tenseness.UI + 0.1*this.noise.simplex1(this.time.total*0.46) + 0.5*this.noise.simplex1(this.time.total*0.36);

        if(!this.isTouched && alwaysVoice)
            this.tenseness.new += (3 - this.tenseness.UI) * (1 - this.intensity)
        
        const intensityOffset = (this.isTouched || alwaysVoice)?
            +0.13:
            -0.05;
        
        this.intensity = Math.clamp(this.intensity + intensityOffset, 0, 1);
    }
    handleTouches(event) {
        
    }
}

export default Glottis;