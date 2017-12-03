'use strict';

const THREE = require('three');
const _ = require('lodash');
const HexDivisionNode = require('./HexDivisionNode');

const Table = require('cli-table');
const fl = (n) => _.isNumber(n) ? Math.round(10 * parseFloat(n)) / 10 : n;
/*
 northVector and westVector are two arbitrary directional vectors in "hex space"
 that are 60 degrees apart (or so) in euclidean space.
 */

const _ci = (n, w) => `${n},${w}`;

const pToV = (p) => new THREE.Vector3(parseFloat(p.x), parseFloat(p.y), parseFloat(p.z));

module.exports = class HexDivision {
  constructor(world, tile, divisions) {
    this._frozen = false;
    this._reset();
    this.world = world;
    this.tile = tile;
    this.divs = divisions;
  }

  data(yell = false) {
    const div = this;
    const table = new Table({
      title: 'Div',
      colWidths: [20, 20, 20, 20],
      head: ['#', 'x', 'y', 'z']
    });

    table.push(['center', div.center.x, div.center.y, div.center.z].map(fl));

    _.each(div.boundary, (p, i) => {
      table.push([i].concat(p.toArray().map(fl)));
    });

    const n = div.northPoint.toArray().map(fl);
    table.push(['north Point'].concat(n));

    const s = div.southPoint.toArray().map(fl);
    table.push(['south Point'].concat(s));

    const w = div.westPoint.toArray().map(fl);

    table.push(['west Point'].concat(w));

    if (yell) {
      console.log(table.toString());
    }
    return table;
  }

  get radius() {
    return this.world.radius;
  }

  get center() {
    if (!this._center) {
      this._center = new THREE.Vector3(this.tile.centerPoint.x,
        this.tile.centerPoint.y,
        this.tile.centerPoint.z)
    }
    return this._center;
  }

  _reset() {
    if (this.frozen) {
      throw new Error('attempt to alter frozen division');
    }
    this._upVector = null;
    this._westVector = null;
    this._divs = null;
    this._tileDist = null;
    this._children = null;
    this._center = null;
    this._childIndex = new Map();
    this._northPoint = null;
    this._westPoint = null;
    this._boundry = null;
  }

  get tileSize() {
    if (this._tileDist === null) {

      this._tileDist =
        _(this.tile.boundary)
          .map((b) => {
            let v = new THREE.Vector3(b.x, b.y, b.z);
            return v.distanceTo(this.tile.centerPoint);
          })
          .mean();
    }
    return this._tileDist;
  }

  __pointAt(index) {
    return this.boundary[index];
  }

  __vector(index) {
    let vector = this.__pointAt(index);
    vector.sub(this.tile.centerPoint);
    vector.divideScalar(this.divs);
    return vector;
  }

  get boundary() {
    if (!this._boundry) {
      this._boundry = this.tile.boundary.map(pToV);
    }
    return this._boundry;
  }

  get northVector() {
    if (!this._upVector) {
      this._upVector = this.__vector(0);
    }
    return this._upVector;
  }

  get northPoint() {
    if (!this._northPoint) {
      this._northPoint = pToV(this.__pointAt(0));
    }
    return this._northPoint;
  }

  /**
   * The point opposite to center from NorthPoint.
   * At this point we are using "candyass" relativity - its the point farthest from North.
   * note it is an absolute point - unlike northVector which is relative to the center
   * @returns {Vector3}
   */
  get southPoint() {
    if (!this._southPoint) {

      let north = this.northPoint;
      this._southPoint = _.reduce(this.boundary, (south, candidate) => {
        if (!south) {
          return candidate;
        }
        if (north.distanceToSquared(south) < north.distanceToSquared(candidate)) {
          return candidate;
        }
        return south;
      });
    }
    return this._southPoint;
  }

  get eastPoint() {
    if (!this._eastPoint) {

      let west = this.westPoint;
      this._eastPoint = _.reduce(this.boundary, (east, candidate) => {
        if (!east) {
          return candidate;
        }
        if (west.distanceToSquared(east) < west.distanceToSquared(candidate)) {
          return candidate;
        }
        return east;
      });
    }
    return this._eastPoint;
  }

  get westPoint() {
    if (!this._westPoint) {
      this._westPoint = this.__pointAt(1);
    }
    return this._westPoint;
  }

  get westVector() {
    if (!this._westVector) {
      this._westVector = this.__vector(1);
    }
    return this._westVector;
  }

  get divs() {
    return this._divs;
  }

  set divs(d) {

    this._reset();
    this._divs = d;
  }

  children() {
    if (!this._children) {
      this._children = [];
      for (let n of _.range(-this.divs, this.divs + 1)) {
        for (let w of _.range(-this.divs, this.divs + 1)) {
          if (this.validChildIndex(n, w)) {
            let node = new HexDivisionNode(this, n, w, this._children.length);
            this._children.push(node);
            this._childIndex.set(_ci(n, w), node);
          }
        }
      }
    }
    return this._children;
  }


  validChildIndex(n, w) {
    return _.inRange(n + w, this.divs + 1, -this.divs);
  }

  /**
   *
   * @param n {int}
   * @param w {int} the "western" index of the point
   */
  childAt(n, w) {
    if (!this.validChildIndex(n, w)) {
      return null;
    }
    const k = _ci(n, w);
    return this._childIndex.get(k) || null;
  }

  freeze() {
    // potentially reset?
    this._frozen = true;
    if (this._children) {
      for (let child of this.children) {
        child.freeze();
      }
    }
  }

  get frozen() {
    return this._frozen;
  }
};
