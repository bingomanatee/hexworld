const THREE = require('three');
const _ = require('lodash');

const Shape = require('./Shape');
const IsoTriangle = require('./IsoTriangle');

class IsoRoot extends Shape {

  constructor(radius = 1, divisions = 0) {
    super();

    this.radius = radius;
    this.divisions = divisions;
    this.iso = new THREE.IcosahedronGeometry(radius, divisions);

    _.each(this.iso.vertices, (vertex) => this.putVector(vertex));

    _.each(this.iso.faces, (face, index) => {
      this.shapes.push(new IsoTriangle(this, index, [face.a, face.b, face.c]));
    });
  }
}

module.exports = IsoRoot;
