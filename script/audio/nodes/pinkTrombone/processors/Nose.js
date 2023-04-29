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

export default Nose;
