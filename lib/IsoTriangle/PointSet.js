const THREE = require('three');
const _ = require('lodash');

const LERP_POINT = new THREE.Vector3(0,0,0);

class IsoTrianglePointSet {
  /**
   *
   * @param isoTriangle {IsoTriangle}
   * @param count {int}
   */
  constructor(isoTriangle, count) {
    this.isoTriangle = isoTriangle;
    this.count = count;

    this.init();
  }

  init() {
    this.vertexes2DArray = _(_.range(0, this.count + 1))
      .map((row) => {
        return _(_.range(0, row + 1))
          .map((col) => this.vertexAtRC(row, col)
          .value();
      })
      .value();
  }

  /**
   * the offset of a single side from the rowPoint
   * @returns {*}
   */
  get colUnitVector () {
    if (!this._colVector) {
      this._colVector = LERP_POINT.lerpVectors(this.isoTriangle.rowPoint, this.isoTriangle.colPoint, 1/this.count)
        .sub(this.isoTriangle.rowPoint);
    }
    return this._colVector;
  }

  vertexAtRC(row, col) {
    if (row === 0) {
      return this.isoTriangle.rootIndex;
    } else if ((row === (count - 1)) && (col === 0)) {
      return this.isoTriangle.rowPointIndex;
    } else if ((row === (count - 1)) && (col === row)) {
      return this.isoTriangle.colPointIndex;
    } else {
      const rowPercent = row / this.count;
      const point = LERP_POINT.lerpVectors(this.isoTriangle.root, this.isoTriangle.rowPoint, rowPercent);
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

module.exports = IsoTrianglePointSet;
