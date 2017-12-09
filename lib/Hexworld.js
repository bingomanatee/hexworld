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

class HexWorld {
  constructor(radius = DEFAULT_RADIUS, divisions = DEFAULT_DIVISIONS, subdivisions = 1) {
    this.radius = radius;
    this.divisions = divisions;
    this.subdivisions = subdivisions;
    this.initialize();
  }

  get faces() {
    return !this._base ? [] : this._base.faces.slice(0);
  }

  get vertices() {
    return !this._base ? [] : this._base.vertices.slice(0);
  }

  vertex(index) {
    return this._base.vertices[index];
  }

  get subdivisions() {
    return this._subdivisions;
  }

  set subdivisions(value) {
    if (!(_.isInteger(value) && value >= 1)) {
      throw new Error(`Bad value for subdivisions (${value})`);
    }
    this._subdivisions = value;
    if (this._initialized) {
      this.initialize();
    }
  }

  initialize() {
    this._base = new THREE.IcosahedronGeometry(this.radius, this.divisions);

    _.each(this.vertices, (vertex, index) => {
      vertex.name = `root_${index}`;
      vertex.vertexIndex = index;
      vertex.zones = new Set();
    });

    if (this._subdivisions > 1) {
      this.subdivide();
    }
    this._initialized = true;
  }

  get divisions() {
    return this._divisions;
  }

  set divisions(value) {
    if (!(_.isInteger(value) && value >= 0)) {
      throw new Error(`Bad value for divisions (${value})`);
    }
    this._divisions = value;
    if (this._initialized) {
      this.initialize();
    }
  }

  set radius(value) {
    if (!(_.isNumber(value) && value > 0)) {
      throw new Error(`Bad value for radius (${value})`);
    }
    this._radius = value;
    if (this._initialized) {
      this.initialize();
    }
  }

  get radius() {
    return this._radius;
  }

  subdivide(subs) {
    if (subs) {
      this._subdivisions = subs;
    }
    if (this.subdivisions <= 1) {
      return;
    }
    this._zones = this.faces.map((face, index) => {
      let points = _([face.a, face.b, face.c])
        .map((p) => this.vertex(p))
        .value();
      return new HexZone(points, this._subdivisions, this, 'hexworld', index);
    })
  }

  /**
   * vertex is a HezZone Vertex
   * @param vertex
   */
  cornerPeers(vertex) {
    let out = [];
    for (let zone of vertex.corner.zones) {
      if (vertex.zone !== zone) {
        for (let zoneVertex of zone.corners) {
          if (zoneVertex.corner === vertex.corner) {
            out.push(zoneVertex);
          }
        }
      }
    }
    return out;
  }

  edgePointMirrorZone(vertex) {
    //  console.log('testing vertex', vertex.zone.vertexToString(vertex));

    for (let zone of this.zones) {
      //  console.log(`======================
      //   testing match of zone:`, zone.toString());
      if (zone === vertex.zone) {
        //   console.log('skipping matching zone');
      } else if (zone.hasParentVertex(vertex.edge)) {
        //   console.log('zone match');
        return zone;
      }
    }
    return false;
  }

  edgePeers(vertex) {
    const zone = this.edgePointMirrorZone(vertex);
    const zoneEdge = zone.edge(vertex.edge);

/*
    const cornerIndexes = _.map(vertex.edge,
      (cornerVertex) => vertex.zone.indexOfCornerPoint(cornerVertex));

    const cornerIndexOffsets = _.map(cornerIndexes,
      (index) => vertex.offsets[index]);

    const mirrorIndexes = _.map(vertex.edge,
      (cornerVertex) => zone.indexOfCornerPoint(cornerVertex));

    const max = zone.subdivisions - 1;
    const targetOffsets = [max, max, max];

    _.each(mirrorIndexes,
      (cornerIndex, i) => targetOffsets[cornerIndex] = cornerIndexOffsets[i]
    );
*/
    debugger;
    let index = vertex.edgeIndex;
    let peer = zoneEdge[index];
    if (peer.edgeCorners[0].name !== vertex.edgeCorners[0].name) {
      index = (vertex.subdivisions - index);
      peer = zoneEdge[index];
    }
    return [peer];

  //  const closest = HexZone.closestPoint(vertex, edge, true);
   // return [closest];
  }

  zone(index) {
    return this._zones[index];
  }

  get zones() {
    return this._zones.slice(0);
  }

  geometry() {
    const vertices = _.map(this.vertices, (v) => v.clone());
    const faces = _.map(this.faces, (face) => face.clone());

    return _.extend(new THREE.Geometry(), {vertices, faces});
  }

  sphere_json(include_base = false) {
    let geometry = [];
    if (include_base) {
      geometry.push(this.geometry());
    }

    if (this._zones) {
      _.each(this._zones, (z) => geometry.push(z.geometry()));
    }

    return geometry;
  }
}

module.exports = HexWorld; // class definition - not an instance
