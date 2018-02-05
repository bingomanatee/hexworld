const THREE = require('three');
const _ = require('lodash');

class IsoTriangleEdge {

  /**
   *
   * @param triangle {IsoTriangle}
   * @param fromPointIndex {int}
   * @param toPointIndex {int}
   */
  constructor(triangle, fromPointIndex, toPointIndex) {
    this.triangle = triangle;
    this.fromPointIndex = fromPointIndex;
    this.toPointIndex = toPointIndex;
    this.edgeSet = new Set([this.fromPointIndex, this.toPointIndex]);
  }

  get edgeIdentity() {
    if (!this._edgeIdentity) {
      if (_.isEqual(this.edgeSet, new Set([this.triangle.rowPointIndex, this.triangle.colPointIndex]))) {
        this._edgeIdentity = IsoTriangleEdge.EDGE_ROW_COL;
      } else if (_.isEqual(this.edgeSet, new Set([this.triangle.rootPointIndex, this.triangle.colPointIndex]))) {
        this._edgeIdentity = IsoTriangleEdge.EDGE_ROOT_COL;
      } else {
        this._edgeIdentity = IsoTriangleEdge.EDGE_ROOT_ROW;
      }
    }
    return this._edgeIdentity;
  }

  contains(index) {
    if (this.edgeSet.has(index)) {
      return true;
    } else if (this.triangle.divisions < 2) {
      return false;
    } else {
      const [row, col] = this.triangle.divider.pointRCs[index];

      switch (this.edgeIdentity) {
        case IsoTriangleEdge.EDGE_ROOT_ROW:
          return col === 0;
          break;

        case IsoTriangleEdge.EDGE_ROOT_COL:
          return row === col;
          break;

        case IsoTriangleEdge.EDGE_ROW_COL:
          return row === this.triangle.divisions;
          break;
      }
    }
  }

  get pointIndexes() {
    if (this.triangle.divisions < 2) {
      return [this.fromPointIndex, this.toPointIndex];
    } else {
      switch (this.edgeIdentity) {
        case IsoTriangleEdge.EDGE_ROOT_ROW:
          return _.range(0, this.triangle.divisions + 1)
            .map((row) => this.triangle.divider.indexAtRC(row, 0, true));
          break;

        case IsoTriangleEdge.EDGE_ROOT_COL:
          return _.range(0, this.triangle.divisions + 1)
            .map((row) => this.triangle.divider.indexAtRC(row, row, true));
          break;

        case IsoTriangleEdge.EDGE_ROW_COL:
          return _.range(0, this.triangle.divisions + 1)
            .map((col) => this.triangle.divider.indexAtRC(this.triangle.divisions, col, true));
          break;
      }
    }
  }
}

IsoTriangleEdge.EDGE_ROOT_ROW = 'EDGE_ROOT_ROW';
IsoTriangleEdge.EDGE_ROOT_COL = 'EDGE_ROOT_COL';
IsoTriangleEdge.EDGE_ROW_COL = 'EDGE_ROW_COL';

module.exports = IsoTriangleEdge;
