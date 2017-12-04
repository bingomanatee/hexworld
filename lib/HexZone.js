'use strict';
const THREE = require('three');
const _ = require('lodash');

/**
 * this is a triangle, subdivided into subtriangles.
 * It can either be the child of another hexZone or the original icosahedron.
 */
module.exports = class HexZone {

  constructor(points, subdivisions = 1, parent, parentType = 'zone', index) {
    this.parentVertices = points;
    this.parent = parent;
    this.parentType = parentType;
    this.index = index;

    if (this.firstZone) {
      _.each(this.parentVertices, (vertex) => vertex.zones.add(this));
    }

    if (subdivisions > 1) {
      this.subdivide(subdivisions);
    }
  }

  get firstZone() {
    return this.parentType === 'hexworld';
  }

  get hexWorld() {
    if (this.firstZone) {
      return this.parent;
    } else if (this.parent) {
      return this.parent.hexWorld();
    } else {
      return null;
    }
  }

  get depth() {
    return this.parent ? this.parent.depth + 1 : 0;
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
    this._parentVertices = _.sortBy(pointArray, 'vertexIndex');
  }

  get parentVertices() {
    return this._parentVertices.slice(0);
  }

  addFace(a, b, c) {
    this.faces.push(new THREE.Face3(a.vertexIndex, b.vertexIndex, c.vertexIndex));
  }

  subdivide(subs) {
    if (subs) {
      this.subdivisions = subs;
    }
    if (this.subdivisions < 2) {
      return;
    }

    const root = this.parentVertices[0];
    const rowPoint = this.parentVertices[1];
    const colPoint = this.parentVertices[2];
    const colVector = colPoint
      .clone()
      .sub(rowPoint)
      .multiplyScalar(1 / this.subdivisions);

    this.faces = [];
    this.vertexes2dArray = _(_.range(0, this.subdivisions + 1))
      .map((rowIndex) => {
        const basePoint = root
          .clone()
          .lerpVectors(root, rowPoint, rowIndex / this.subdivisions);

        return _(_.range(0, rowIndex + 1))
          .map((colIndex) => {
            const colOffset = colVector
              .clone()
              .multiplyScalar(colIndex);
            let vertex = basePoint.clone().add(colOffset);
            if (this.hexWorld) {
              let scale = this.hexWorld.radius / vertex.length();
              vertex = vertex.multiplyScalar(scale);
            }
            return vertex;
          })
          .value();
      })
      .value();
    this.subVertices = _(this.vertexes2dArray)
      .flatten()
      .value();
    _.each(this.subVertices, (point, i) => point.vertexIndex = i);

    this._subdivideFaces();
  }

  edge(vertex1, vertex2) {
    if (vertex1.name) {
      vertex1 = vertex1.name;
    }
    if (vertex2.name) {
      vertex2 = vertex2.name;
    }
    const corners = _(this.parentVertices)
      .reduce((corners, vertex, index) => {
        if (!(vertex.name === vertex1 || vertex.name === vertex2)) {
          return corners;
        }
        corners.push({vertex, index});
        return corners;
      }, []);

    const edge = _.map(corners, 'index').join('-');

    switch (edge) {
      case '0-1':
        return _(this.vertexes2dArray)
          .map(_.first)
          .value();
        break;

      case '0-2':
        return _(this.vertexes2dArray)
          .map(_.last)
          .value();
        break;

      case '1-2':
        return _.last(this.vertexes2dArray);
        break;

      default:
        throw new Error(`unknown edge ${edge}`);
    }
  }

  _subdivideFaces() {
    _(this.vertexes2dArray)
      .each((row, rowIndex) => {
        _.each(row, (first, colIndex) => {
          const nextRow = this.vertexes2dArray[rowIndex + 1];
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
  }

  geometry() {
    const vertices = _.map(this.subVertices, (p) => p.clone());
    const faces = _.map(this.faces, (p) => p.clone());
    return _.extend(new THREE.Geometry(), {vertices, faces});
  }
};
