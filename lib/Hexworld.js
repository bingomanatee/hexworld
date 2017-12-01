'use strict';
const THREE = require('three');
const Hexasphere = require('hexasphere.js');
const _ = require('lodash');
const TILE_WIDTH = 1;
const DEFAULT_RADIUS = 100;
const DEFAULT_DIVISIONS = 2;
const HexDivision = require('./HexDivision');

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
  constructor(radius = DEFAULT_RADIUS, divisions = DEFAULT_DIVISIONS) {
    this.radius = radius;
    this.divisions = divisions;
    this._hs = new Hexasphere(radius, divisions, TILE_WIDTH);
  }

  set radius (v) {
    if (!(v > 0)) throw new Error(`bad radius: ${v}`);
    this._rad = v;
  }

  get radius () {
    return this._rad;
  }

  subdivide(divisions = 4) {
    return _.map(this._hs.tiles, (tile) => new HexDivision(this, tile, divisions));
  }

  sphere_json(divisons = 0) {
    //
    let points = [];
    let pointIndex = new Map(); // the index (in points) of a point with a given name.
    let faces = [];
    let firstTile = this._hs.tiles[0];
    let segDist = dist(firstTile.boundary[0], firstTile.boundary[1]);

    for (let tile of this._hs.tiles.slice(0, 12) ){
      let facePoints = [];

      const addPoint = (point) => {
        point.str = point.str || ptStr(point);
        if (pointIndex.has(point.str)) {

          facePoints.push(pointIndex.get(point.str));
        } else {
          let newIndex = points.length;

          points.push(point);
          pointIndex.set(point.str, newIndex);
          facePoints.push(newIndex);
        }
      };

      for (let point of tile.boundary) {
        addPoint(point);
      }
      addPoint(tile.boundary[0]);
      faces.push(facePoints)
    } // end tiles for

    points = _.map(points, (p) => _.pick(p, c));

    /**
     * adding subdivided faces
     */

    if ( divisons > 1) {
      const divs = this.subdivide(divisons).slice(0, 12);
      let index = 0;
      for (let div of divs) {
       // console.log('squaring div ', index, 'of', divs.length);
        ++index;
        div.freeze();
        for (let child of div.children()) {
          let square = child.asSquare();
          if (square) {
            let centers = _.map(square, 'center');

            let face = [];
            _.each(centers, (p) => {
              face.push(points.length);
              points.push(_.pick(p, c));
            });
            faces.push(face);
          }
        }
      }
    }

    return {
      points, faces
    };
  }
}

module.exports = Hexworld; // class definition - not an instance
