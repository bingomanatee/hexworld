const THREE = require('three');
const _ = require('lodash');

module.exports = class HexDivisionNode {

  /**
   * A hex node is a sub-coordinate within a HexDivision.
   *
   * @param div {HexDivision} the parent of this node
   * @param north {int} a numeric offset in the coordinate system of the parent
   * @param west {int} " "
   * @param index {int} the index of this node within the parent's children array
   */
  constructor(div, north, west, index) {
    this._frozen = false;
    this.div = div;
    this.north = north;
    this.west = west;
    this.index = index;
    if (this.div.frozen) {
      this.freeze();
    }
  }

  set div(v) {
    if (!v) throw new Error('setting div to bad value');
    this._div = v;
  }

  get div() {
    return this._div;
  }

  get id() {
    return `node ${this.north},${this.west}`;
  }

  get value() {
    return this.north + this.west;
  }

  get northLerp() {
    if (this.north < 0) return 0;
    return this.north / this.div.divs;
  }

  get southLerp() {
    if (this.north > 0) return 0;
    return -this.north / this.div.divs;
  }

  __center() {
    let location
     = this.div.center.clone();
    const LIB = new THREE.Vector3(); // we are using static methods off a point
    const divs = this.div.divs;
    const r = this.div.radius;
    if (!r) {
      throw new Error(`missing radius for ${ this.index}, ${this.north}, ${this.west}`);
    }
    if (this.north > 0) {
      location = LIB.lerpVectors(location, this.div.northPoint, this.northLerp);
    } else if (this.north < 0) {
      location = LIB.lerpVectors(location, this.div.southPoint, this.southLerp);
    } else {
    }

    let westVector;
    if (this.west === 0)
      return location;
    else if (this.west > 0) {
      westVector = LIB.lerpVectors(this.div.center, this.div.westPoint, (this.west) / divs);
    } else {
      westVector = LIB.lerpVectors(this.div.center, this.div.eastPoint, (-this.west) / divs);
    }
    westVector.sub(this.div.center);
    location.add(westVector);

    let scale = r / location.length();
     location.multiplyScalar(scale);
    return location;
  }

  get center() {
    if (!this._center) this._center = this.__center();
    return this._center;
  }

  freeze() {
    this._frozen = true;
    this.center;
  }

  get frozen() {
    return this._frozen;
  }

  asSquare() {
    const e = this.div.childAt(this.north, this.west - 1);
    if (!e) return null;
    const s = this.div.childAt(this.north - 1, this.west);
    if (!s) return null;
    const se = this.div.childAt(this.north - 1, this.west - 1);
    if (!se) return null;
    return [this, e, se, s];
  }
};
