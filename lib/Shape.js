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

  get depth() {
    return this.parent ? this.parent.depth + 1 : 1;
  }

  setPointData(dataType, dataSetter) {
    if (!this._pointDataMap) {
      this._pointDataMap = new Map;
    }
    this._pointDataMap.set(dataType, this.points.map((point, i) => dataSetter(point, i, this)));
    this.shapes.forEach((shape) => shape.setPointData(dataType, dataSetter));
  }

  getPointData(dataType, index) {
    if (!(this._pointDataMap && this._pointDataMap.has(dataType))) {
      return null;
    }
    return this._pointDataMap.get(dataType)[index];
  }

  /**
   * runs a routine over each point
   * @param fn {function}
   * @param recurse {boolean}
   */
  eachPoint(fn, recurse) {
     _.each(this.points, (point, index) => {
      fn(point, index, this, this.parentPointIndexes[index]);
    });
    if (recurse) {
      _.each(this.shapes, (shape) => shape.eachPoint(fn, recurse))
    }
  }
}


module.exports = Shape;
