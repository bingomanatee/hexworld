const THREE = require('three');
const _ = require('lodash');

const Shape = require('./Shape');
const IsoTriangle = require('./IsoTriangle');

class IsoRoot extends Shape {

  get identity() {
    return ['root'];
  }

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

  // note -- assuming origin is 0,0,0
  /**
   *
   * @param point {Vector3}
   */
  spherify(point) {
    const length = point.length();
    if (length === 0) {
      return point;
    }
    const scale = this.radius / length;
    point.multiplyScalar(scale);
    return point;
  }

  divide(count) {
    _.each(this.shapes, (shape) => shape.divide(count));
  }
}

module.exports = IsoRoot;
