const THREE = require('three');
const _ = require('lodash');

const Shape = require('./Shape');
const IsoDivider = require('./IsoTriangle/IsoDivider');

class IsoTriangle extends Shape {

  get rootPointIndex () { return 0; }
  get rowPointIndex() { return 1;}
  get colPointIndex() { return 2;}

  get rootPoint () {
    return this.getPoint(this.rootPointIndex);
  }

  get rowPoint () {
    return this.getPoint(this.rowPointIndex);
  }

  get colPoint () {
    return this.getPoint(this.colPointIndex);
  }

  divide(count) {
    this._divider = new IsoDivider(this, IsoTriangle);
    this._divider.divide(count);
  }

  get divider() {
    return this._divider || null;
  }

  get divisions() {
    if (!this._divider) return 0;
    return this._divider.count;
  }
}

module.exports = IsoTriangle;
