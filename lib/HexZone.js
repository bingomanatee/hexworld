'use strict';

const THREE = require('three');
const _ = require('lodash');

/**
 * this is a triangle, subdivided into subtriangles.
 * It can either be the child of another hexZone or the original icosahedron.
 */
module.exports = class HexZone {

  constructor(points, subdivisions = 2, parent, parentType = 'zone', index) {
    this.initial_points = points;
    this.parent = parent;
    this.parentType = parentType;
    this.index = index;

    if (subdivisions > 1) {
      this.subdivide(subdivisions);
    }
  }

  set initial_points(pointArray) {
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

    this._points = pointArray;
  }

  get points() {
    return this._points;
  }

  subdivide(subs) {
    if (subs < 2) return;
    this.subdivisions = subs;
    const root = this.points[0];
    const rowPoint = this.points[1];
    const colPoint = this.points[2];
    const vector = (point) => point
      .clone()
      .sub(root)
      .multiplyScalar(1/subs);

    const rowScalar = vector(rowPoint);
    const colScalar = vector(colPoint);

    this.subPoints = _(_.range(0, this.subdivisions + 1))
      .map((rowIndex) => {
        const rowOffset = rowScalar
          .clone()
          .multiplyScalar(rowIndex);

        return _(_.range(0, rowIndex + 1))
          .map((colIndex) => {
            const colOffset = colScalar
              .clone()
              .multiplyScalar(colIndex);
            return colOffset.add(rowOffset);
          })
          .value();
      })
      .value();
  }

};
