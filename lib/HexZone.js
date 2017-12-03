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
      if (subs < 2) {
        return;
      }
      this.subdivisions = subs;
      const root = this.parentVertices[0];
      const rowPoint = this.parentVertices[1];
      const colPoint = this.parentVertices[2];
      const vector = (point) => point
            .clone()
            .sub(root)
            .multiplyScalar(1 / subs);
      const rowScalar = vector(rowPoint);
      const colScalar = vector(colPoint);
      this.subFaces = [];
      this.subPoint2Array = _(_.range(0, this.subdivisions + 1))
          .map((rowIndex) => {
            const rowOffset = rowScalar
                .clone()
                .multiplyScalar(rowIndex);
            return _(_.range(0, rowIndex + 1))
                .map((colIndex) => {
                  const colOffset = colScalar
                      .clone()
                      .multiplyScalar(colIndex);
                  return colOffset.add(rowOffset)
                      .add(root);
                })
                .value();
          })
          .value();
      this._subdivideFaces();
    }
    
    _subdivideFaces() {
      this.subPoints = _(this.subPoint2Array)
          .flatten()
          .value();
      _.each(this.subPoints, (point, i) => point.subPointIndex = i);
      _.each(this.subPoint2Array, (row, rowIndex) => {
        const nextRow = this.subPoint2Array[rowIndex + 1]
        if (!nextRow) {
          return;
        }
        _.each(row, (rowPoint, r) => {
          const nextPointInRow = row[r + 1];
          if (!nextPointInRow) {
            return;
          }
          const pointAboveRowPoint = nextRow[r];
          const pointAboveAndNextRowPoint = nextRow[r + 1]; // may be not existent

          this.addFace(pointAboveRowPoint, rowPoint, nextPointInRow);
          if (pointAboveAndNextRowPoint) {
            this.addFace(pointAboveRowPoint, pointAboveAndNextRowPoint, nextPointInRow);
          }
        })
      })
    }

    geometry() {
      const vertices = _.map(this.subPoints, (p) => p.clone());
      const faces = _.map(this.subFaces, (p) => p.clone());
      return _.extend(new THREE.Geometry(), {vertices, faces});
    }
  };
