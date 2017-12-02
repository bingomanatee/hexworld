'use strict';
const THREE = require('three');
const _ = require('lodash');
const DEFAULT_RADIUS = 100;
const DEFAULT_DIVISIONS = 2;
const HexZone = require('./HexZone');

const pn = (n) => Math.round(10 * n);
const ptStr = (p) => `${pn(p.x)},${pn(p.y)},${pn(p.z)}`;

function dist(p, p2) {
  const dx = p.x - p2.x;
  const dy = p.y - p2.y;
  const dz = p.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

const c = ['x', 'y', 'z'];

class Hexworld {
  constructor(radius = DEFAULT_RADIUS, divisions = DEFAULT_DIVISIONS, subdivisions = 0) {
    this.radius = radius;
    this.divisions = divisions;
    this.subdivisions = subdivisions;
    console.log('this.detail/divisions: ', divisions);
    this._base = new THREE.IcosahedronGeometry(this.radius, this.divisions);
    if (subdivisions > 1) {
      this.subdivide(subdivisions);
    }
  }

  set radius(v) {
    if (!(v > 0)) {
      throw new Error(`bad radius: ${v}`);
    }
    this._rad = v;
  }

  get radius() {
    return this._rad;
  }

  subdivide(subs) {
    if (subs) {
      this.subdivisions = subs;
    }
    this._zones = this._base.faces.map((face, i)=> {
      let points = [face.a, face.b, face.c].map((p) => this._base.vertices[p]);
      return new HexZone(points, this.subdivisions, this, 'root', index);
    })
  }

  sphere_json() {
    //
    let points = this._base.vertices;
    let faces = this._base.faces;


    return {
      points, faces
    };
  }
}

module.exports = Hexworld; // class definition - not an instance
