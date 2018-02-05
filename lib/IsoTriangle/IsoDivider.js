const THREE = require('three');
const _ = require('lodash');

const LERP_POINT = new THREE.Vector3(0, 0, 0);
const IsoTriangleEdge = require('./IsoTriangleEdge');
const NEIGHBOR_OFFSETS = [
  [1, 0],
  [1, 1],
  [0, 1],
  [0, -1],
  [-1, -1],
  [-1, 0]
];

class IsoDivider {
  /**
   *
   * @param isoTriangle {IsoTriangle}
   * @param IsoTriangleClass {class}
   */
  constructor(isoTriangle, IsoTriangleClass) {
    this.isoTriangle = isoTriangle;
    this.IsoTriangleClass = IsoTriangleClass;
  }

  divide(count) {
    this.count = count;
    this._colVector = null;
    this.isoTriangle.initialize();
    this._makePoints();
    this._makeFaceShapes();
    this._makeEdges();
  }

  indexAtRC(row, col, trust) {
    if (trust) {
      return this.vertexes2DArray[row][col];
    }

    if (_.isArray(row)) {
      [row, col] = row;
    }
    if ((row < 0) || (col < 0) || (row > this.count) || (col > row)) {
      return null;
    }
    return this.vertexes2DArray[row][col];
  }

  pointAtRC(row, col) {
    const index = this.indexAtRC(row, col);
    return index === null ? null : this.isoTriangle.getPoint(index);
  }

  localNeighborIndexes(row, col) {
    return _(NEIGHBOR_OFFSETS)
      .map((offsets) => this.indexAtRC(offsets[0] + row, offsets[1] + col))
      .reject((index) => index === null)
      .value();
  }

  /**
   *
   * @param row {int}
   * @param col {int}
   * @returns {*}
   */
  rcEdges(row, col) {
    const index = this.indexAtRC(row, col);
    return this.indexEdges(index);
  }

  indexEdges(index) {
    const edges = [];
    if (index === null) return edges;
    for (let [name, edge] of this.edges) {
      if (edge.contains(index)) edges.push(edge);
    }
    return edges;
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

  _makePoints() {
    this.pointRCs = [];
    this.vertexes2DArray = _(_.range(0, this.count + 1))
      .map((row) => {
        return _(_.range(0, row + 1))
          .map((col) => this._vertexAtRC(row, col))
          .value();
      })
      .value();
  }

  _vertexAtRC(row, col) {
    let index;
    if (row === 0) {
      index = this.isoTriangle.rootPointIndex;
    } else if ((row === (this.count)) && (col === 0)) {
      index = this.isoTriangle.rowPointIndex;
    } else if ((row === (this.count)) && (col === row)) {
      index = this.isoTriangle.colPointIndex;
    } else {
      const rowPercent = row / this.count;
      const point = LERP_POINT.lerpVectors(this.isoTriangle.rootPoint,
        this.isoTriangle.rowPoint, rowPercent);
      if (col > 0) {
        const colOffset = this.colUnitVector
          .clone()
          .multiplyScalar(col);
        point.add(colOffset);
      }
      if (this.isoTriangle.rootShape.radius) {
        this.isoTriangle.rootShape.spherify(point);
      }
      index = this.isoTriangle.putVector(point);
    }
    this.pointRCs[index] = [row, col];
    return index;
  }

  _makeFaceShapes() {
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

  get edges() {
    return this._edges;
  }

  _makeEdges() {
    this._edges = new Map();

    this._edges.set(IsoTriangleEdge.EDGE_ROOT_ROW,
      new IsoTriangleEdge(this.isoTriangle,
        this.isoTriangle.rootPointIndex,
        this.isoTriangle.rowPointIndex));

    this._edges.set(IsoTriangleEdge.EDGE_ROOT_COL,
      new IsoTriangleEdge(this.isoTriangle,
        this.isoTriangle.rootPointIndex,
        this.isoTriangle.colPointIndex));

    this._edges.set(IsoTriangleEdge.EDGE_ROW_COL,
      new IsoTriangleEdge(this.isoTriangle,
        this.isoTriangle.rowPointIndex,
        this.isoTriangle.colPointIndex));
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

  get pointsString() {
    return this.vertexes2DArray.map((row) => row
      .map((value) => String(value).padStart(5)))
      .join("\n");
  }
}

module.exports = IsoDivider;
