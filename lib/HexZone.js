'use strict';
const THREE = require('three');
const _ = require('lodash');
/**
 * this is a triangle, subdivided into subtriangles.
 * It can either be the child of another hexZone or the original icosahedron.
 */
module.exports = class HexZone {

  constructor(points, subdivisions = 2, parent, parentType = 'zone', index) {
    this.parentVertices = points;
    this.parent = parent;
    this.parentType = parentType;
    this.index = index;
    if (subdivisions > 1) {
      this.subdivide(subdivisions);
    }
  }

  set parentVertices(pointArray) {
    if (!_.isArray(pointArray)) {
      throw new Error('HexZone points must be an array');
    }

    if (pointArray.length !== 3) {
      throw new Error('HexZone points must have three items; contains item count ' + pointArray.length);
    }

    _.each(pointArray, (point) => {
      _.each(['x', 'y', 'z'], (coord) => {
        if (!(point.hasOwnProperty(coord) && _.isNumber(point[coord]))) {
          throw new Error('coord fail on point in HexZone');
        }
      });
    });
    this._parentVertices = pointArray;
  }

  get parentVertices() {
    return this._parentVertices;
  }

  addFace(a, b, c) {
    this.subFaces.push(new THREE.Face3(a.subPointIndex, b.subPointIndex, c.subPointIndex));
  }

  subdivide(subs) {
    if (subs) {
      this.subdivisions = subs;
    }
    if (this.subdivisions < 2) {
      return;
    }
    const rows = 2 * this.subdivisions;
    const root = this.parentVertices[0];
    const rowPoint = this.parentVertices[1];
    const colPoint = this.parentVertices[2];
    const colScalar = colPoint
      .clone()
      .sub(rowPoint)
      .multiplyScalar(1 / this.subdivisions);

    this.subFaces = [];
    this.subPoint2Array = _(_.range(0, this.subdivisions + 1))
      .map((rowIndex) => {
        const basePoint = root
          .clone()
          .lerpVectors(root, rowPoint, rowIndex / this.subdivisions);

        return _(_.range(0, rowIndex + 1))
          .map((colIndex) => {
            const colOffset = colScalar
              .clone()
              .multiplyScalar(colIndex);
            return basePoint.clone().add(colOffset);
          })
          .value();
      })
      .value();
    this.subPoints = _(this.subPoint2Array)
      .flatten()
      .value();
    _.each(this.subPoints, (point, i) => point.subPointIndex = i);

    this._subdivideFaces();
  }

  _subdivideFaces() {
    _(this.subPoint2Array)
      .each((row, rowIndex) => {
        _.each(row, (first, colIndex) => {
          const nextRow = this.subPoint2Array[rowIndex + 1];
          if (!nextRow) {
            return;
          }
          const second = nextRow[colIndex];
          const third = nextRow[colIndex + 1];
          this.addFace(first, second, third);
          const nextPoint = row[rowIndex + 1];
          if (nextPoint) {
            this.addFace(first, nextPoint, third);
          }
        });
      });

//      this.subPoints = _(this.subPoint2Array)
//          .flatten()
//          .value();
//      _.each(this.subPoint2Array, (row, rowIndex) => {
//        const nextRow = this.subPoint2Array[rowIndex + 1]
//        if (!nextRow) {
//          return;
//        }
//        _.each(row, (point00, r) => {
//          const point01 = row[r + 1];
//          const point10 = nextRow[r];
//          const point11 = nextRow[r + 1]; // may be not existent
//          if(point10 && point01) this.addFace(point00, point10, point01);
//         // if(point10 && point11 && point01) this.addFace(point10, point11, point01);
//        })
//      })
  }

  geometry() {
    const vertices = _.map(this.subPoints, (p) => p.clone());
    const faces = _.map(this.subFaces, (p) => p.clone());
    return _.extend(new THREE.Geometry(), {vertices, faces});
  }
};
