const THREE = require('three');
const _ = require('lodash');

const Shape = require('./Shape');
const IsoDivider = require('./IsoTriangle/IsoDivider');

class IsoTriangle extends Shape {

  get identity() {
    return this.parent.identity.concat([this.parentIndex]);
  }

  get rootPointIndex() {
    return 0;
  }

  get rowPointIndex() {
    return 1;
  }

  get colPointIndex() {
    return 2;
  }

  get rowParentPointIndex() {
    return this.parentPointIndexes[this.rowPointIndex];
  }

  get rootParentPointIndex() {
    return this.parentPointIndexes[this.rootPointIndex];
  }

  get colParentPointIndex() {
    return this.parentPointIndexes[this.colPointIndex];
  }

  get cornerParentPointIndexes() {
    return this.parentPointIndexes.slice(0, 3);
  }

  get cornerParentPointIndexSet() {
    if (!this._cpiSet) {
      this._cpiSet = new Set(this.cornerParentPointIndexes);
    }
    return this._cpiSet;
  }

  get rootPoint() {
    return this.getPoint(this.rootPointIndex);
  }

  get rowPoint() {
    return this.getPoint(this.rowPointIndex);
  }

  get colPoint() {
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
    if (!this._divider) {
      return 0;
    }
    return this._divider.count;
  }

  edgePeers() {
    let ppi = this.cornerParentPointIndexes;
    let group = _(this.parent.shapes)
      .groupBy((shape) => {
        return _.intersection(shape.cornerParentPointIndexes, ppi).length;
      }).value();
    return group[2];
  }
}

module.exports = IsoTriangle;
