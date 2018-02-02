const THREE = require('three');
const _ = require('lodash');

const LERP_POINT = new THREE.Vector3(0, 0, 0);

class IsoDivider {
  /**
   *
   * @param isoTriangle {IsoTriangle}
   * @param count {int}
   */
  constructor(isoTriangle, IsoTriangleClass) {
    this.isoTriangle = isoTriangle;
    this.IsoTriangleClass = IsoTriangleClass;
  }

  divide(count) {
    this.count = count;
    this._colVector = null;
    this.isoTriangle.initialize();
    this.vertexes2DArray = _(_.range(0, this.count + 1))
      .map((row) => {
        return _(_.range(0, row + 1))
          .map((col) => this._vertexAtRC(row, col))
          .value();
      })
      .value();
    this._makeFaceShapes();
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

  _vertexAtRC(row, col) {
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
      if (this.isoTriangle.rootShape.radius) {
        this.isoTriangle.rootShape.spherify(point);
      }
      return this.isoTriangle.putVector(point);
    }
  }

  _makeFaceShapes () {
    _(this.vertexes2DArray)
      .each((row, rowIndex) => {
        _.each(row, (first, colIndex) => {
          const nextRow = this.vertexes2DArray[rowIndex + 1];
          if (nextRow) {
            const next = nextRow[colIndex];
            const nextNext = nextRow[colIndex + 1];
            if (nextNext && next) {
              this.addFace(first, next, nextNext);
            } // first face
            const nextInRow = row[colIndex + 1];
            if (nextInRow && nextNext) {
              this.addFace(first, nextNext, nextInRow); // second face
            }
          }
        });
      });
  }

  /**
   *
   * @param p1 {int}
   * @param p2 {int}
   * @param p3 {int}
   */

  addFace(p1, p2, p3) {
    const index = this.isoTriangle.shapes.length;
    this.isoTriangle.shapes.push(new this.IsoTriangleClass(this.isoTriangle, index, [p1, p2, p3]))
  }
}

module.exports = IsoDivider;
