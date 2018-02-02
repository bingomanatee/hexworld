const THREE = require('three');
const _ = require('lodash');

class Shape {
  /**
   *
   * @param parent {Shape | null}
   * @param parentIndex {int | null}
   * @param parentPointIndexes {[int]}
   */
  constructor(parent = null, parentIndex = null, parentPointIndexes = []) {
    this.parent = parent;
    this.parentIndex = parentIndex;
    this.parentPointIndexes = parentPointIndexes;

    this.initialize();
  }

  initialize() {
    this.shapes = [];
    this.points = [];
    _.each(this.parentPointIndexes, (value, index) => {
      this.putVector(this.parent.getPoint(value), index);
    });
  }

  /**
   *
   * @param point {Vector3}
   * @param index {int | boolean}
   * @returns {int}
   */
  putVector(point, index = false) {
    return this.putPoint(point.x, point.y, point.z, index);
  }

  /**
   * Puts coordinates into the point registry
   * @param x {Number}
   * @param y {Number}
   * @param z {Number}
   * @param at {int | boolean}
   * @returns {int}
   */
  putPoint(x, y, z, at = false) {
    if (at === false) {
      at = this.points.length;
    }
    this.points[at] = new THREE.Vector3(x, y, z);
    return at;
  }

  /**
   *
   * @param index {Number}
   * @returns {Vector3}
   */
  getPoint(index) {
    return this.points[index];
  }

  /**
   *
   * @returns {Shape}
   */
  get rootShape() {
    return this.parent ? this.parent.rootShape : this;
  }
}


module.exports = Shape;
