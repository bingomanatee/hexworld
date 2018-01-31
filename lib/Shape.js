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
    this.parentIndex = parentIndex
    this.points = [];
    this.parentPointIndexes = parentPointIndexes;
    this.shapes = [];

    this._copyParentPoints();
  }

  /**
   * note - this is a destructive operation populating points with alue
   * @private
   */
  _copyParentPoints () {
    _.each(this.parentPointIndexes, (value, index) => {
      let point = this.parent.getPoint(value);
      this.putPoint(point.x, point.y, point.z, index);
    });
  }

  copyPoint(point) {
    this.putPoint(point.x, point.y, point.z);
  }

  putPoint(x, y, z, at = false) {
    if (at === false) at = this.points.length;
    const point = new THREE.Vector3(x, y, z);
    this.points[at] = point;
    return point;
  }

  getPoint(index) {
    return this.points[index];
  }
}


module.exports = Shape;
