const THREE = require('three');
const _ = require('lodash');

const LERP_POINT = new THREE.Vector3(0, 0, 0);

class IsoDivider {
  /**
   *
   * @param isoTriangle {IsoTriangle}
   * @param count {int}
   */
  constructor(isoTriangle) {
    this.isoTriangle = isoTriangle;
  }

  divide(count) {
    this.count = count;
    this._colVector = null;
    this.isoTriangle.initialize();
    this.vertexes2DArray = _(_.range(0, this.count + 1))
      .map((row) => {
        return _(_.range(0, row + 1))
          .map((col) => this.vertexAtRC(row, col))
          .value();
      })
      .value();
  }

  /**
   * the offset of a single side from the rowPoint
   * @returns {*}
   */
  get colUnitVector() {
    if (!this._colVector) {
      this._colVector = this.isoTriangle.colPoint
        .clone()
        .sub(this.isoTriangle.rowPoint)
        .divideScalar(this.count);
    }
    return this._colVector;
  }

  vertexAtRC(row, col) {
    if (row === 0) {
      return this.isoTriangle.rootIndex;
    } else if ((row === (this.count)) && (col === 0)) {
      return this.isoTriangle.rowPointIndex;
    } else if ((row === (this.count)) && (col === row)) {
      return this.isoTriangle.colPointIndex;
    } else {
      const rowPercent = row / this.count;
      const point = LERP_POINT.lerpVectors(this.isoTriangle.rootPoint,
        this.isoTriangle.rowPoint, rowPercent);
      // a vector lerped between corner 1 and 2 by rowIndex units
      if (col > 0) {
        const colOffset = this.colUnitVector
          .clone()
          .multiplyScalar(col);
        point.add(colOffset);
      }
      return this.isoTriangle.putVector(point);
    }
  }
}

module.exports = IsoDivider;
