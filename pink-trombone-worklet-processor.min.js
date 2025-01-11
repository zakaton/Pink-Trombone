const ParameterDescriptors = [
  {
    name: "noise",
    defaultValue: 0,
    minValue: -1,
    maxValue: 1,
  },
  {
    name: "frequency",
    defaultValue: 140,
    minValue: 0,
  },
  {
    name: "tenseness",
    defaultValue: 0.6,
    minValue: 0,
    maxValue: 1,
  },
  {
    name: "intensity",
    defaultValue: 1,
    minValue: 0,
    maxValue: 1,
  },
  {
    name: "loudness",
    defaultValue: 1,
    minValue: 0,
    maxValue: 1,
  },

  {
    name: "tongueIndex",
    defaultValue: 12.9,
    //automationRate : "k-rate",
  },
  {
    name: "tongueDiameter",
    defaultValue: 2.43,
    //automationRate : "k-rate",
  },

  {
    name: "vibratoWobble",
    defaultValue: 1,
    minValue: 0,
    maxValue: 1,
  },

  {
    name: "vibratoFrequency",
    defaultValue: 6,
    minValue: 0,
  },
  {
    name: "vibratoGain",
    defaultValue: 0.005,
    minValue: 0,
  },

  {
    name: "tractLength",
    defaultValue: 44,
    minValue: 15,
    maxValue: 88,
  },
];

ParameterDescriptors.numberOfConstrictions = 4;

for (
  let index = 0;
  index < ParameterDescriptors.numberOfConstrictions;
  index++
) {
  const constrictionParameterDescriptors = [
    {
      name: "constriction" + index + "index",
      defaultValue: 0,
      //automationRate: "k-rate",
    },
    {
      name: "constriction" + index + "diameter",
      defaultValue: 0,
      //automationRate: "k-rate",
    },
  ];

  ParameterDescriptors.push(...constrictionParameterDescriptors);
}

// VECTOR 3

function Vector3(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
}

Object.defineProperties(Vector3.prototype, {
    dot2 : {
        value : function(x, y) {
            return (this.x*x) + (this.y*y);
        }
    },
    dot3 : {
        value : function(x, y, z) {
            return this.dot2(x, y) + (this.z*z);
        }
    }
});

//////////////////////////////////////////////////////////////////////

// SIMPLEX NOISE

function SimplexNoise() {
    this.grad3 = [
        [+1, +1, +0],
        [-1, +1, +0],
        [+1, -1, +0],
        [-1, -1, +0],
        [+1, +0, +1],
        [-1, +0, +1],
        [+1, +0, -1],
        [-1, +0, -1],
        [+0, +1, +1],
        [+0, -1, +1],
        [+0, +1, -1],
        [+0, -1, -1],
    ].map(vector3Arguments => new Vector3(...vector3Arguments));

    this.p = [151,160,137,91,90,15,
        131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
        190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
        88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,
        77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
        102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,
        135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,
        5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
        223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
        129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,
        251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,
        49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
        138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    
    this.perm = new Array(Math.pow(2, 8+1));
    this.gradP = new Array(Math.pow(2, 8+1));

    this.F2 = (0.5 * (Math.sqrt(3) - 1));
    this.G2 = ((3 - Math.sqrt(3))/6);

    this.F3 = (1/3);
    this.G3 = (1/6);

    this.seed(Date.now());
}

Object.defineProperties(SimplexNoise.prototype, {
    seed : {
        value : function(seed) {
            if((seed > 0) && (seed < 1))
                seed *= Math.pow(2, 16);
            
            seed = Math.floor(seed);
    
            if(seed < Math.pow(2, 8))
                seed |= seed << Math.pow(2, 3);
            
            for(let index = 0; index < Math.pow(2, 8); index++) {
                const seedShift = (index & 1)?
                    0 :
                    Math.pow(2, 3);
    
                const value = this.p[index] ^ ((seed >> seedShift) & (Math.pow(2, 8)-1));
                
                this.perm[index] = this.perm[index + Math.pow(2, 8)] = value;
                this.gradP[index] = this.gradP[index + Math.pow(2, 8)] = this.grad3[value % this.grad3.length];
            }
        }
    },
    simplex2 : {
        value : function(xin, yin) {
            const s = ((xin + yin) * this.F2);
            
            var i = Math.floor(xin + s);
            var j = Math.floor(yin + s);
            
            const t = (i + j) * this.G2;
            
            const x0 = xin - i + t;
            const y0 = yin - j + t;
            
            const i1 = (x0 > y0)? 1:0;
            const j1 = 1 - i1;
    
            const x1 = x0 - i1 + this.G2;
            const y1 = y0 - j1 + this.G2;
    
            const x2 = (x0 - 1) + (2 * this.G2);
            const y2 = (y0 - 1) + (2 * this.G2);
    
            i &= (Math.pow(2, 8)-1);
            j &= (Math.pow(2, 8)-1);
    
            const gi0 = this.gradP[i + this.perm[j]];
            const gi1 = this.gradP[i + i1 + this.perm[j + j1]];
            const gi2 = this.gradP[i + 1 + this.perm[j + 1]];
    
            const t0 = 0.5 - Math.pow(x0, 2) - Math.pow(y0, 2);
            const n0 = (t0 < 0)?
                0 :
                Math.pow(t0, 4) * gi0.dot2(x0, y0);
    
            const t1 = 0.5 - Math.pow(x1, 2) - Math.pow(y1, 2);
            const n1 = (t1 < 0)?
                0 :
                Math.pow(t1, 4) * gi1.dot2(x1, y1);
    
            const t2 = 0.5 - Math.pow(x2, 2) - Math.pow(y2, 2);
            const n2 = (t2 < 0)?
                0 :
                Math.pow(t2, 4) * gi2.dot2(x2, y2);
    
            return 70 * (n0 + n1 + n2);
        }
    },
    simplex1 : {
        value : function(x) {
            return this.simplex2((x * 1.2), -(x * 0.7));
        }
    }
});

/*
    TODO
        *
*/

Math.clamp = function (value, min, max) {
    if (value <= min) return min;
    else if (value < max) return value;
    else return max;
};

class Glottis {
    constructor() {
        this.noise = new SimplexNoise();

        this.coefficients = {
            alpha: 0,
            Delta: 0,
            E0: 0,
            epsilon: 0,
            omega: 0,
            shift: 0,
            Te: 0,
        };

        this.startSeconds = 0;
    }

    process(inputSamples, parameterSamples, sampleIndex, bufferLength, seconds) {
        const intensity = parameterSamples.intensity;
        const loudness = parameterSamples.loudness;

        var vibrato = 0;
        vibrato += parameterSamples.vibratoGain * Math.sin(2 * Math.PI * seconds * parameterSamples.vibratoFrequency);
        vibrato += 0.02 * this.noise.simplex1(seconds * 4.07);
        vibrato += 0.04 * this.noise.simplex1(seconds * 2.15);

        if (parameterSamples.vibratoWobble > 0) {
            var wobble = 0;
            wobble += 0.2 * this.noise.simplex1(seconds * 0.98);
            wobble += 0.4 * this.noise.simplex1(seconds * 0.5);
            vibrato += wobble * parameterSamples.vibratoWobble;
        }

        var frequency = parameterSamples.frequency;
        frequency *= 1 + vibrato;

        var tenseness = parameterSamples.tenseness;
        tenseness += 0.1 * this.noise.simplex1(seconds * 0.46);
        tenseness += 0.05 * this.noise.simplex1(seconds * 0.36);
        tenseness += (3 - tenseness) * (1 - intensity);

        // waveform.update()
        const period = 1 / frequency;

        var secondsOffset = seconds - this.startSeconds;
        var interpolation = secondsOffset / period;

        if (interpolation >= 1) {
            this.startSeconds = seconds + (secondsOffset % period);
            interpolation = this.startSeconds / period;
            this._updateCoefficients(tenseness);
        }

        // process
        var outputSample = 0;

        var noiseModulator = this._getNoiseModulator(interpolation);
        noiseModulator += (1 - tenseness * intensity) * 3;
        parameterSamples.noiseModulator = noiseModulator;

        var noise = parameterSamples.noise;
        noise *= noiseModulator;
        noise *= intensity;
        noise *= intensity;
        noise *= 1 - Math.sqrt(Math.max(tenseness, 0));
        noise *= 0.02 * this.noise.simplex1(seconds * 1.99) + 0.2;

        var voice = this._getNormalizedWaveform(interpolation);
        voice *= intensity;
        voice *= loudness;

        outputSample = noise + voice;
        outputSample *= intensity;

        return outputSample;
    }

    update() {}

    _updateCoefficients(tenseness = 0) {
        const R = {};
        R.d = Math.clamp(3 * (1 - tenseness), 0.5, 2.7);
        R.a = -0.01 + 0.048 * R.d;
        R.k = 0.224 + 0.118 * R.d;
        R.g = ((R.k / 4) * (0.5 + 1.2 * R.k)) / (0.11 * R.d - R.a * (0.5 + 1.2 * R.k));

        const T = {};
        T.a = R.a;
        T.p = 1 / (2 * R.g);
        T.e = T.p + T.p * R.k;

        this.coefficients.epsilon = 1 / T.a;
        this.coefficients.shift = Math.exp(-this.coefficients.epsilon * (1 - T.e));
        this.coefficients.Delta = 1 - this.coefficients.shift;

        const integral = {};
        integral.RHS =
            ((1 / this.coefficients.epsilon) * (this.coefficients.shift - 1) + (1 - T.e) * this.coefficients.shift) /
            this.coefficients.Delta;
        integral.total = {};
        integral.total.lower = -(T.e - T.p) / 2 + integral.RHS;
        integral.total.upper = -integral.total.lower;

        this.coefficients.omega = Math.PI / T.p;

        const s = Math.sin(this.coefficients.omega * T.e);
        const y = (-Math.PI * s * integral.total.upper) / (T.p * 2);
        const z = Math.log(y);

        this.coefficients.alpha = z / (T.p / 2 - T.e);
        this.coefficients.E0 = -1 / (s * Math.exp(this.coefficients.alpha * T.e));
        this.coefficients.Te = T.e;
    }

    _getNormalizedWaveform(interpolation) {
        return interpolation > this.coefficients.Te
            ? (-Math.exp(-this.coefficients.epsilon * (interpolation - this.coefficients.Te)) +
                  this.coefficients.shift) /
                  this.coefficients.Delta
            : this.coefficients.E0 *
                  Math.exp(this.coefficients.alpha * interpolation) *
                  Math.sin(this.coefficients.omega * interpolation);
    }

    _getNoiseModulator(interpolation) {
        const angle = 2 * Math.PI * interpolation;
        const amplitude = Math.sin(angle);
        const positiveAmplitude = Math.max(0, amplitude);

        const offset = 0.1;
        const gain = 0.2;

        const noiseModulator = positiveAmplitude * gain + offset;

        return noiseModulator;
    }
}

/*
    TODO
        *
*/

class Nose {
  constructor(tract) {
    this.maxLength = Math.floor((28 / 44) * tract.maxLength);

    this.fade = 1;
    this.offset = 0.8;

    // buffers
    this.left = new Float64Array(this.maxLength);
    this.left.junction = new Float64Array(this.maxLength + 1);

    this.right = new Float64Array(this.maxLength);
    this.right.junction = new Float64Array(this.maxLength + 1);

    this.reflection = new Float64Array(this.maxLength + 1);
    this.reflection.value = 0;
    this.reflection.new = 0;

    this.diameter = new Float64Array(this.maxLength);

    this.amplitude = new Float64Array(this.maxLength);
    this.amplitude.max = new Float64Array(this.maxLength);

    this._onTractUpdate(tract);
  }

  _onTractUpdate(tract) {
    this.length = Math.floor((28 / 44) * tract.length);

    this.start = tract.length - this.length + 1;

    // setup
    for (let index = 0; index < this.length; index++) {
      const interpolation = index / this.length;

      const value =
        interpolation < 0.5
          ? 0.4 + 1.6 * (2 * interpolation)
          : 0.5 + 1.5 * (2 - 2 * interpolation);

      this.diameter[index] = Math.min(value, 1.9);
    }

    for (let index = 0; index < this.length; index++) {
      this.amplitude[index] = Math.pow(this.diameter[index], 2);

      if (index > 0)
        this.reflection[index] =
          (this.amplitude[index - 1] - this.amplitude[index]) /
          (this.amplitude[index - 1] + this.amplitude[index]);
    }

    this.diameter[0] = tract.velum.target;
  }
}

class Transient {
    constructor(position, seconds) {
        this.position = position;

        this.startTime = seconds;
        this.timeAlive = 0;
        this.lifetime = 0.2;

        this.strength = 0.3;
        this.exponent = 200;
    }

    get amplitude() {
        return this.strength * Math.pow(-2, this.timeAlive * this.exponent);
    }

    get isAlive() {
        return this.timeAlive < this.lifetime;
    }

    update(seconds) {
        this.timeAlive = seconds - this.startTime;
    }
}

/*
    TODO
        using tongue as a k-rate constriction
*/


Math.interpolate = function (interpolation, from, to) {
  return from * (1 - interpolation) + to * interpolation;
};
Math.clamp = function (value, minValue, maxValue) {
  return value <= minValue ? minValue : value < maxValue ? value : maxValue;
};

class Tract {
  constructor(length = 44) {
    this.maxLength = 88;
    //this.length = length;

    // Indices
    this.blade = {
      //start: Math.floor((10 / 44) * this.length),
    };

    this.tip = {
      //start: Math.floor((32 / 44) * this.length),
    };

    this.lip = {
      //start: Math.floor((39 / 44) * this.length),
      reflection: -0.85,
    };

    this.glottis = {
      reflection: 0.75,
    };

    this.velum = {
      target: 0.01,
    };

    this.grid = {
      offset: 1.7,
    };

    // Buffers
    this.right = new Float64Array(this.maxLength);
    this.right.junction = new Float64Array(this.maxLength + 1);
    this.right.reflection = {
      value: 0,
      new: 0,
    };

    this.left = new Float64Array(this.maxLength);
    this.left.junction = new Float64Array(this.maxLength + 1);
    this.left.reflection = {
      value: 0,
      new: 0,
    };

    this.reflection = new Float64Array(this.maxLength + 1);
    this.reflection.new = new Float64Array(this.maxLength + 1);

    this.amplitude = new Float64Array(this.maxLength);
    this.amplitude.max = new Float64Array(this.maxLength);

    this.diameter = new Float64Array(this.maxLength);
    this.diameter.rest = new Float64Array(this.maxLength);

    // Tongue & Nose
    this.tongue = {
      _diameter: 2.43,
      //_index: (12.9 * this.length) / 44,

      range: {
        diameter: {
          minValue: 2.05,
          maxValue: 3.5,
          get range() {
            return this.maxValue - this.minValue;
          },
          get center() {
            return (this.maxValue + this.minValue) / 2;
          },
          interpolation(diameterValue) {
            const interpolation = (diameterValue - this.minValue) / this.range;
            return Math.clamp(interpolation, 0, 1);
          },
        },
        index: {
          //minValue: this.blade.start + 2,
          //maxValue: this.tip.start - 3,
          get range() {
            return this.maxValue - this.minValue;
          },
          get center() {
            return (this.maxValue + this.minValue) / 2;
          },
          centerOffset(interpolation) {
            const centerOffsetDiameter = interpolation * this.range;
            const centerOffsetRadius = centerOffsetDiameter / 2;
            return centerOffsetRadius;
          },
        },
      },

      get diameter() {
        return this._diameter;
      },
      set diameter(newValue) {
        this._diameter = Math.clamp(newValue, this.range.diameter.minValue, this.range.diameter.maxValue);
      },

      get index() {
        return this._index;
      },
      set index(newValue) {
        const diameterInterpolation = this.range.diameter.interpolation(this.diameter);
        const invertedDiameterInterpolation = 1 - diameterInterpolation;

        const straightenedInterpolation =
          Math.pow(invertedDiameterInterpolation, 0.58) -
          0.2 * (Math.pow(invertedDiameterInterpolation, 2) - invertedDiameterInterpolation);
        const centerOffset = this.range.index.centerOffset(straightenedInterpolation);

        this._index = Math.clamp(newValue, this.range.index.center - centerOffset, this.range.index.center + centerOffset)
          ;
      },
    };

    // NOSE
    this.nose = new Nose(this);

    // Transients
    this.transients = [];
    this.transients.obstruction = {
      last: -1,
      new: -1,
    };

    // Constrictions
    this.previousConstrictions = [];
    this.previousConstrictions.tongue = {};

    this._updateTractLength(length);
    this._updateReflection();
  }

  // FILL
  _updateTractLength(length) {
    this.length = length;

    this.blade.start = Math.floor((10 / 44) * this.length);
    this.tip.start = Math.floor((32 / 44) * this.length);

    this.lip.start = Math.floor((39 / 44) * this.length);

    this.tongue._index = (12.9 * this.length) / 44;
    this.tongue.range.index.minValue = this.blade.start + 2;
    this.tongue.range.index.maxValue = this.tip.start - 3;

    this.nose._onTractUpdate(this);

    // diameter.update
    for (let index = 0; index < this.length; index++) {
      var value = 0;
      if (index < (7 / 44) * this.length - 0.5) value = 0.6;
      else if (index < (12 / 44) * this.length) value = 1.1;
      else value = 1.5;

      this.diameter[index] = value;
      this.diameter.rest[index] = value;
    }
  }

  // PROCESS
  process(inputSamples, parameterSamples, sampleIndex, bufferLength, seconds) {
    const currentTractLength = Math.round(parameterSamples.tractLength);
    if (currentTractLength != this.length) {
      this._updateTractLength(currentTractLength);
    }

    this.tongue.diameter = parameterSamples.tongueDiameter;
    this.tongue.index = parameterSamples.tongueIndex;

    this._processTransients(seconds);
    this._processConstrictions(this.previousConstrictions, parameterSamples);

    const bufferInterpolation = sampleIndex / bufferLength;
    const updateAmplitudes = Math.random() < 0.1;

    var outputSample = 0;
    outputSample += this._processLips(parameterSamples, bufferInterpolation, updateAmplitudes);
    outputSample += this._processNose(parameterSamples, bufferInterpolation, updateAmplitudes);

    if (isNaN(outputSample)) this.reset();

    return outputSample;
  }

  _processTransients(seconds) {
    for (let index = this.transients.length - 1; index >= 0; index--) {
      const transient = this.transients[index];

      this.left[transient.position] += transient.amplitude;
      transient.update(seconds);

      if (!transient.isAlive) this.transients.splice(index, 1);
    }
  }
  _processConstrictions(constrictions, parameterSamples) {
    for (let index = 0; index < constrictions.length; index++) {
      const constriction = constrictions[index];

      if (constriction.index >= 2 && constriction.index <= this.length && constriction.diameter > 0) {
        var noise = parameterSamples.glottis;

        const noiseScalar = parameterSamples.noiseModulator * 0.66;
        noise *= noiseScalar;

        const thinness = Math.clamp(8 * (0.7 - constriction.diameter), 0, 1);
        const openness = Math.clamp(30 * (constriction.diameter - 0.3), 0, 1);
        const _ness = thinness * openness;
        noise *= _ness / 2;

        const lowerIndex = Math.floor(constriction.index);
        const lowerWeight = constriction.index - lowerIndex;
        const lowerNoise = noise * lowerWeight;

        const upperIndex = lowerIndex + 1;
        const upperWeight = upperIndex - constriction.index;
        const upperNoise = noise * upperWeight;

        this.right[lowerIndex + 1] += lowerNoise;
        this.right[upperIndex + 1] += upperNoise;

        this.left[lowerIndex + 1] += lowerNoise;
        this.left[upperIndex + 1] += upperNoise;
      }
    }
  }

  _processLips(parameterSamples, bufferInterpolation, updateAmplitudes) {
    this.right.junction[0] = this.left[0] * this.glottis.reflection + parameterSamples.glottis;
    this.left.junction[this.length] = this.right[this.length - 1] * this.lip.reflection;

    for (let index = 1; index < this.length; index++) {
      const interpolation = Math.interpolate(bufferInterpolation, this.reflection[index], this.reflection.new[index]);
      const offset = interpolation * (this.right[index - 1] + this.left[index]);

      this.right.junction[index] = this.right[index - 1] - offset;
      this.left.junction[index] = this.left[index] + offset;
    }

    const leftInterpolation = Math.interpolate(
      bufferInterpolation,
      this.left.reflection.new,
      this.left.reflection.value
    );
    this.left.junction[this.nose.start] =
      leftInterpolation * this.right[this.nose.start - 1] +
      (leftInterpolation + 1) * (this.nose.left[0] + this.left[this.nose.start]);
    const rightInterpolation = Math.interpolate(
      bufferInterpolation,
      this.right.reflection.new,
      this.right.reflection.value
    );
    this.right.junction[this.nose.start] =
      rightInterpolation * this.left[this.nose.start] +
      (rightInterpolation + 1) * (this.nose.left[0] + this.right[this.nose.start - 1]);
    const noseInterpolation = Math.interpolate(
      bufferInterpolation,
      this.nose.reflection.new,
      this.nose.reflection.value
    );
    this.nose.right.junction[0] =
      noseInterpolation * this.nose.left[0] +
      (noseInterpolation + 1) * (this.left[this.nose.start] + this.right[this.nose.start - 1]);

    for (let index = 0; index < this.length; index++) {
      this.right[index] = this.right.junction[index] * 0.999;
      this.left[index] = this.left.junction[index + 1] * 0.999;

      if (updateAmplitudes) {
        const sum = Math.abs(this.left[index] + this.right[index]);

        this.amplitude.max[index] = sum > this.amplitude.max[index] ? sum : this.amplitude.max[index] * 0.999;
      }
    }

    return this.right[this.length - 1];
  }
  _processNose(parameterSamples, bufferInterpolation, updateAmplitudes) {
    this.nose.left.junction[this.nose.length] = this.nose.right[this.nose.length - 1] * this.lip.reflection;

    for (let index = 1; index < this.nose.length; index++) {
      const offset = this.nose.reflection[index] * (this.nose.left[index] + this.nose.right[index - 1]);

      this.nose.left.junction[index] = this.nose.left[index] + offset;
      this.nose.right.junction[index] = this.nose.right[index - 1] - offset;
    }

    for (let index = 0; index < this.nose.length; index++) {
      this.nose.left[index] = this.nose.left.junction[index + 1] * this.nose.fade;
      this.nose.right[index] = this.nose.right.junction[index] * this.nose.fade;

      if (updateAmplitudes) {
        const sum = Math.abs(this.nose.left[index] + this.nose.right[index]);
        this.nose.amplitude.max[index] =
          sum > this.nose.amplitude.max[index] ? sum : this.nose.amplitude.max[index] * 0.999;
      }
    }

    return this.nose.right[this.nose.length - 1];
  }

  // UPDATE
  update(seconds, constrictions) {
    this._updateTract();

    this._updateTransients(seconds);

    this.nose.diameter[0] = this.velum.target;
    this.nose.amplitude[0] = Math.pow(this.nose.diameter[0], 2);

    this._updateReflection();

    this._updateConstrictions(constrictions);
  }

  _updateDiameterRest() {
    for (let index = this.blade.start; index < this.lip.start; index++) {
      const interpolation = (this.tongue.index - index) / (this.tip.start - this.blade.start);

      const angle = 1.1 * Math.PI * interpolation;
      const diameter = 2 + (this.tongue.diameter - 2) / 1.5;

      var curve = (1.5 - diameter + this.grid.offset) * Math.cos(angle);

      if (index == this.blade.start - 2 || index == this.lip.start - 1) curve *= 0.8;

      if (index == this.blade.start + 0 || index == this.lip.start - 2) curve *= 0.94;

      const value = 1.5 - curve;

      this.diameter.rest[index] = value;
    }
  }

  _log() {
    const now = Date.now();
    if (this._numberOfLogs != undefined && this._numberOfLogs < 10) {
      console.log(...arguments);
      this._numberOfLogs++;
      return;
    }
    if (this._lastLogTime == undefined || now - this._lastLogTime > 100) {
      console.log(...arguments);
      this._lastLogTime = now;
      this._numberOfLogs = 0;
    }
  }

  _updateConstrictions(constrictions) {
    var update = false;

    update =
      update ||
      this.tongue.index !== this.previousConstrictions.tongue.index ||
      this.tongue.diameter !== this.previousConstrictions.tongue.diameter;

    const maxIndex = Math.max(this.previousConstrictions.length, constrictions.length);
    for (
      let constrictionIndex = 0, A = constrictions[0], B = this.previousConstrictions[0];
      !update && constrictionIndex < maxIndex;
      constrictionIndex++, A = constrictions[constrictionIndex], B = this.previousConstrictions[constrictionIndex]
    ) {
      update =
        A !== undefined && B !== undefined
          ? A.index !== B.index || A.diameter !== B.diameter
          : !(A == undefined && B == undefined);
    }

    if (update) {
      this._updateDiameterRest();
      for (let index = 0; index < this.length; index++) {
        this.diameter[index] = this.diameter.rest[index];
      }

      this.velum.target = 0.01;

      for (let index = -1; index < constrictions.length; index++) {
        const constriction = constrictions[index] || this.tongue;

        if (constriction.index > this.nose.start && constriction.diameter < -this.nose.offset) this.velum.target = 0.4;
        if (constriction.diameter < -0.85 - this.nose.offset) {
          continue;
        }

        var newTractDiameter = constriction.diameter;
        newTractDiameter -= 0.3;
        newTractDiameter = Math.max(0, newTractDiameter);

        if (newTractDiameter < 3) {
          // FIX
          var tractIndexRange = 2;

          const normalizedIndex = constriction.index / this.length;

          if (!this.indexRangeParams) {
            this.indexRangeParams = {
              lowerIndex: 25 / 44,
              lowerIndexRange: 10,
              upperIndex: this.tip.start / this.length,
              upperIndexRange: 5,
            };
            this.indexRangeParams.indexRange = this.indexRangeParams.upperIndex - this.indexRangeParams.lowerIndex;
          }
          const { lowerIndex, lowerIndexRange, upperIndex, upperIndexRange, indexRange } = this.indexRangeParams;

          if (normalizedIndex < lowerIndex) tractIndexRange = lowerIndexRange;
          else if (normalizedIndex >= upperIndex) tractIndexRange = upperIndexRange;
          else tractIndexRange = lowerIndexRange - (upperIndexRange * (normalizedIndex - lowerIndex)) / indexRange;

          tractIndexRange *= this.length / 44;
          const constrictionIndex = Math.round(constriction.index);
          const constrictionIndexRadius = Math.ceil(tractIndexRange) + 1;

          for (
            let tractIndex = constrictionIndex - constrictionIndexRadius;
            tractIndex < constrictionIndex + tractIndexRange + 1;
            tractIndex++
          ) {
            if (tractIndex < 0 || tractIndex >= this.length) {
              continue;
            }

            const tractIndexOffset = Math.abs(tractIndex - constriction.index) - 0.5; // relpos

            var tractDiameterScalar; // shrink
            if (tractIndexOffset <= 0) tractDiameterScalar = 0;
            else if (tractIndexOffset > tractIndexRange) tractDiameterScalar = 1;
            else tractDiameterScalar = 0.5 * (1 - Math.cos((Math.PI * tractIndexOffset) / tractIndexRange));

            const tractDiameterDifference = this.diameter[tractIndex] - newTractDiameter;
            if (tractDiameterDifference > 0) {
              this.diameter[tractIndex] = newTractDiameter + tractDiameterDifference * tractDiameterScalar;
            }
          }
        }
      }

      this.previousConstrictions = constrictions;
      this.previousConstrictions.tongue = {
        index: this.tongue.index,
        diameter: this.tongue.diameter,
      };
    }
  }

  _updateTract() {
    for (let index = 0; index < this.length; index++) {
      if (this.diameter[index] <= 0) {
        this.transients.obstruction.new = index;
      }
    }
  }

  _updateTransients(seconds) {
    if (this.nose.amplitude[0] < 0.05) {
      if (this.transients.obstruction.last > -1 && this.transients.obstruction.new == -1)
        this.transients.push(new Transient(this.transients.obstruction.new, seconds));

      this.transients.obstruction.last = this.transients.obstruction.new;
    }
  }

  _updateReflection() {
    for (let index = 0; index < this.length; index++) {
      this.amplitude[index] = Math.pow(this.diameter[index], 2);

      if (index > 0) {
        this.reflection[index] = this.reflection.new[index];
        this.reflection.new[index] =
          this.amplitude[index] == 0
            ? 0.999
            : (this.amplitude[index - 1] - this.amplitude[index]) / (this.amplitude[index - 1] + this.amplitude[index]);
      }
    }

    const sum = this.amplitude[this.nose.start] + this.amplitude[this.nose.start + 1] + this.nose.amplitude[0];
    this.left.reflection.value = this.left.reflection.new;
    this.left.reflection.new = (2 * this.amplitude[this.nose.start] - sum) / sum;

    this.right.reflection.value = this.right.reflection.new;
    this.right.reflection.new = (2 * this.amplitude[this.nose.start + 1] - sum) / sum;

    this.nose.reflection.value = this.nose.reflection.new;
    this.nose.reflection.new = (2 * this.nose.amplitude[0] - sum) / sum;
  }

  reset() {
    this.right.fill(0);
    this.right.junction.fill(0);
    this.left.fill(0);
    this.left.junction.fill(0);

    this.nose.left.fill(0);
    this.nose.left.junction.fill(0);
    this.nose.right.fill(0);
    this.nose.right.junction.fill(0);
  }
}

/*
    TODO            
        add "precision" property to iterate this.tract.process
*/


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

/*
    TODO
        *
*/


class PinkTromboneWorkletProcessor extends AudioWorkletProcessor {
    constructor() {
        super();

        this.processor = new Processor();
        this.enabledConstrictionIndices = [];

        this.port.onmessage = (event) => {
            switch (event.data.name) {
                case "enableConstriction":
                    this.enabledConstrictionIndices[event.data.constrictionIndex] = true;
                    this.port.postMessage(event.data);
                    break;
                case "disableConstriction":
                    this.enabledConstrictionIndices[event.data.constrictionIndex] = false;
                    this.port.postMessage(event.data);
                    break;

                case "enabledConstrictionIndices":
                    event.data.enabledConstrictionIndices = this.enabledConstrictionIndices;
                    this.port.postMessage(event.data);
                    break;

                case "getProcessor":
                    event.data.processor = JSON.stringify(this.processor);
                    this.port.postMessage(event.data);
                    break;
            }
        };
    }

    static get parameterDescriptors() {
        return ParameterDescriptors;
    }

    _getParameterSamples(parameters, sampleIndex) {
        const parameterSamples = {};

        for (
            let parameterDescriptorIndex = 0;
            parameterDescriptorIndex < this.constructor.parameterDescriptors.length;
            parameterDescriptorIndex++
        ) {
            const parameterDescriptor = this.constructor.parameterDescriptors[parameterDescriptorIndex];
            if (!parameterDescriptor.name.includes("constriction")) {
                parameterSamples[parameterDescriptor.name] =
                    parameters[parameterDescriptor.name].length == 1
                        ? parameters[parameterDescriptor.name][0]
                        : parameters[parameterDescriptor.name][sampleIndex];
            }
        }

        return parameterSamples;
    }

    _getConstrictions(parameters) {
        const constrictions = [];

        for (
            let constrictionIndex = 0;
            constrictionIndex < ParameterDescriptors.numberOfConstrictions;
            constrictionIndex++
        ) {
            if (this.enabledConstrictionIndices[constrictionIndex]) {
                const prefix = "constriction" + constrictionIndex;

                const constriction = {
                    index: parameters[prefix + "index"][0],
                    diameter: parameters[prefix + "diameter"][0],
                };

                constrictions[constrictionIndex] = constriction;
            }
        }

        return constrictions;
    }

    process(inputs, outputs, parameters) {
        const constrictions = this._getConstrictions(parameters);

        for (let outputIndex = 0; outputIndex < outputs.length; outputIndex++) {
            for (let channelIndex = 0; channelIndex < outputs[outputIndex].length; channelIndex++) {
                for (let sampleIndex = 0; sampleIndex < outputs[outputIndex][channelIndex].length; sampleIndex++) {
                    const parameterSamples = this._getParameterSamples(parameters, sampleIndex);
                    const seconds = currentTime + sampleIndex / sampleRate;
                    const outputSample = this.processor.process(
                        inputs[outputIndex][channelIndex],
                        parameterSamples,
                        sampleIndex,
                        outputs[outputIndex][channelIndex].length,
                        seconds
                    );

                    outputs[outputIndex][channelIndex][sampleIndex] = outputSample;
                }
            }
        }

        this.processor.update(currentTime + outputs[0][0].length / sampleRate, constrictions);

        return true;
    }
}

registerProcessor("pink-trombone-worklet-processor", PinkTromboneWorkletProcessor);
