const THREE = require('three');
const Hexasphere = require('hexasphere.js');
const _ = require('lodash');
const TILE_WIDTH = 1;
const DEFAULT_RADIUS = 100;
const DEFAULT_DIVISIONS = 2;

const pn = (n) => Math.round(10 * n);
const ptStr = (p) => `${pn(p.x)},${pn(p.y)},${pn(p.z)}`;

function dist(p, p2) {
  const dx = p.x - p2.x;
  const dy = p.y - p2.y;
  const dz = p.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

class Hexworld {
  constructor(radius = DEFAULT_RADIUS, divisions = DEFAULT_DIVISIONS) {
    this.radius = radius;
    this.divisions = divisions;
    this._hs = new Hexasphere(radius, divisions, TILE_WIDTH);
  }

  sphere_json() {
    //
    let points = [];
    let pointIndex = new Map(); // the index (in points) of a point with a given name.
    let faces = [];
    let firstTile = this._hs.tiles[0];
    let segDist = dist(firstTile.boundary[0], firstTile.boundary[1]);
    let insaneLength = segDist * 2;

    for (let tile of this._hs.tiles) {
      let facePoints = [];

      let lastPoint = 0;
      for (let point of tile.boundary) {
        if (lastPoint && dist(point, lastPoint) > insaneLength) {
          console.log('insane tile', tile);
          lastPoint = point;
          continue;
        } else if (lastPoint) {
          console.log('sane length: ', dist(point, lastPoint))
        }
        lastPoint = point;
      }


      function addPoint(point) {
        point.str = point.str || ptStr(point);
        if (pointIndex.has(point.str)) {

          facePoints.push(pointIndex.get(point.str));
        } else {
          let newIndex = points.length;

          points.push(point);
          pointIndex.set(point.str, newIndex);
          facePoints.push(newIndex);
        }
      }

      for (let point of tile.boundary) {
        addPoint(point);
      }
      addPoint(tile.boundary[0]);
      faces.push(facePoints)
    } // end tiles for

    const c = ['x', 'y', 'z'];
    points = _.map(points, (p) => _.pick(p, c));

    return {
      points, faces
    };
  }
}

module.exports = Hexworld; // class definition - not an instance
