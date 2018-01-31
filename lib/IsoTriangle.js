const THREE = require('three');
const _ = require('lodash');

const Shape = require('./Shape');

class IsoTriangle extends Shape {

  constructor(parent, parentIndex, parentPointIndexes = []) {
    super(parent, parentIndex, parentPointIndexes);
  }

  initialize(radius = 1, divisions = 0) {
    if (this.parent) {
      throw new Error('cannot initialize non-root IsoTriangle');
    }

    this.radius = radius;
    this.divisions = divisions;

    this.iso = new THREE.IcosahedronGeometry(radius, divisions);

    _.each(this.iso.vertices, (vertex) => this.copyPoint(vertex));

    _.each(this.iso.faces, (face, index) => {
      this.shapes.push(new IsoTriangle(this, index, [face.a, face.b, face.c]));
    });
  }

}

module.exports = IsoTriangle;
