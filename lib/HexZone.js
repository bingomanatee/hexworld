'use strict';
const THREE = require('three');
const _ = require('lodash');
const HexZoneVector = require('./HexZoneVector');

/**
 * this is a triangle, subdivided into subtriangles.
 * It can either be the child of another hexZone or the original icosahedron.
 */
class HexZone {

  constructor (points, divisions = 1, parent = null, parentType = 'zone', index = 0) {
    this.parentVertices = points;
    this.parent = parent;
    this.parentType = parentType;
    this.index = index;

    this._initName();

    if (divisions > 1) {
      this.divide(divisions);
    } else {
      this._initFaces();
      this._initVertices();
      this._initSubZones();
    }
  }

  _initName () {
    if ((!this.parent) || this.firstZone) {
      this._name = `zone_${this.index}`;
    } else {
      this._name = `${this.parent.name}:zone_${this.index}`;
    }
  }

  get name () {
    return this._name
  }

  hasParentVertex (corner) {
    if (_.isArray(corner)) {
      return _.every(corner, (c) => this.hasParentVertex(c));
    }

    if (corner.corner) {
      corner = corner.corner
    }

    return _.reduce(this.parentVertices, (match, pVertex) => {
      return match || (pVertex.name === corner.name);
    }, false);
  }

  get firstZone () {
    return this.parentType === 'hexworld';
  }

  get hexWorld () {
    if (this.firstZone) {
      return this.parent;
    } else if (this.parent) {
      return this.parent.hexWorld();
    } else {
      return null;
    }
  }

  get depth () {
    return this.firstZone ? 2 : this.parent ? this.parent.depth + 1 : 0;
  }

  set parentVertices (pointArray) {
    if (!_.isArray(pointArray)) {
      throw new Error('HexZone points must be an array');
    }

    if (pointArray.length !== 3) {
      throw new Error('HexZone points must have three items; contains item count ' + pointArray.length);
    }

    _.each(pointArray, (point) => {
      _.each(['x', 'y', 'z'], (coord) => {
        if (!(point.hasOwnProperty(coord) && _.isNumber(point[coord]))) {
          throw new Error('coord fail on point in HexZone');
        }
      });
    });
    this._parentVertices = pointArray
  }

  get parentVertices () {
    return this._parentVertices.slice(0);
  }

  indexOfCornerPoint (cornerVertex) {
    return _.indexOf(cornerVertex, this.parentVertices);
  }

  addFace (a, b, c) {
    const normal = a.clone()
      .add(b)
      .add(c)
      .normalize();
    this.faces.push(new THREE.Face3(a.vertexIndex, b.vertexIndex, c.vertexIndex, normal));
  }

  get root () {
    return this.parentVertices[0];
  }

  get rowPoint () {
    return this.parentVertices[1];
  }

  get colPoint () {
    return this.parentVertices[2];
  }

  get colVector () {
    if (!this._colVector) {
      this._colVector = this.colPoint
        .clone()
        .sub(this.rowPoint)
        .multiplyScalar(1 / this.divisions);
    }
    return this._colVector;
  }

  get corners () {
    return [
      _.first(this.vertices),
      _.first(_.last(this.vertexes2dArray)),
      _.last(this.vertices)
    ];
  }

  get faces () {
    if (!this._faces) {
      this._faces = [];
    }
    return this._faces;
  }

  _initFaces () {
    this._faces = [];
  }

  get vertices () {
    if (!this._vertices) {
      this._vertices = [];
    }
    return this._vertices;
  }

  _initVertices () {
    this._vertices = [];
  }

  _initSubZones () {
    this._subZones = [];
  }

  get subZones () {
    return this._subZones;
  }

  // ----------- IDEMODENT METHODS ---------------------

  edge (vertex1, vertex2) {
    const corners = this._edgeCorners(vertex1, vertex2);

    if (corners.length < 2) {
      return [];
    }

    return this._edgePoints(corners);
  }

  _edgePoints (corners) {
    const edgeName = _.map(corners, 'index').join('-');

    switch (edgeName) {
      case '0-1':
        return _(this.vertexes2dArray)
          .map(_.first)
          .value();
        break;

      case '0-2':
        return _(this.vertexes2dArray)
          .map(_.last)
          .value();
        break;

      case '1-2':
        return _.last(this.vertexes2dArray).slice();
        break;

      default:
        throw new Error(`unknown edge ${edgeName}`);
    }
  }

  toString () {
    return `zone ${this.name} index ${this.index} 
    depth ${this.depth}
    from points 
    -------------------------
    ${_.map(this.corners, 'name').join("\n")}`;
  }

  vertexAt (rowIndex, colIndex) {
    if (_.isArray(rowIndex)) {
      [rowIndex, colIndex] = rowIndex;
    }
    if (!this.vertexes2dArray[rowIndex]) {
      return null;
    }
    return this.vertexes2dArray[rowIndex][colIndex];
  }

  // get the point at a specific row/column offset from a point
  vertexOffset (vertex, rowOffset, colOffset) {
    if (_.isArray(rowOffset)) {
      [rowOffset, colOffset] = rowOffset;
    }
    return this.vertexAt(vertex.rowIndex + rowOffset, vertex.colIndex + colOffset);
  }

  // get the adjacent points to a given vertex. NOTE: are NOT in any particular order
  localNeighbors (vertex) {
    if (vertex.localNeighbors) {
      return vertex.localNeighbors;
    }
    let neighbors = _(HexZone.neighborOffsets)
      .map((neighborOffset) => this.vertexOffset(vertex, neighborOffset))
      .compact()
      .value();
    vertex.localNeighbors = neighbors;
    return neighbors;
  }

  // points that are at the same location as a vertex
  // but are on different zones.
  peers (vertex) {
    if (vertex.corner) {
      return this.parent.cornerPeers(vertex);
    } else if (vertex.edge) {
      return this.parent.edgePeers(vertex);
    } else {
      return [];
    }
  }

  // the neighbors of a vertex in this zone AND across other zones
  neighbors (vertex) {
    let peerNeighbors, vertexPeers;
    if (vertex.neighbors) {
      return vertex.neighbors;
    }
    const localNeighbors = this.localNeighbors(vertex); // neighbors in this zone

    let localPeers = _.map(localNeighbors, (v) => this.peers(v));
    // peers of localNeighbors in other zones.

    vertexPeers = this.peers(vertex);
    peerNeighbors = _.map(vertexPeers,
      (vertexPeer) => vertexPeer.zone.localNeighbors(vertexPeer));
    // if the vertex is on the edge, find out the peers of its peer

    vertex.neighbors = _(localNeighbors)
      .concat(peerNeighbors)
      .concat(localPeers)
      .flatten()
      .compact()
      .uniq()
      .value();
    return vertex.neighbors;
  }

  geometry () {
    const vertices = _.map(this.vertices, (p) => (p.export || p).clone());
    const faces = _.map(this.faces, (p) => p.clone());
    return _.extend(new THREE.Geometry(), {vertices, faces});
  }

  closestPoint (vertex, points) {
    return HexZone.closestPoint(vertex, points || this.vertices);
  }

  // ------------- MUTATING METHODS

  divide (divisions) {
    if (arguments.length > 0) {
      this.divisions = divisions;
    }
    if (this.divisions < 2) {
      return;
    }

    this._initVertices();
    this._initFaces();
    this._initSubZones();

    this.vertexes2dArray = _(_.range(0, this.divisions + 1))
      .map((rowIndex) => {
        return _(_.range(0, rowIndex + 1))
          .map((colIndex) => {
            return this.makeVertexAtRC(rowIndex, colIndex);
          })
          .value();
      })
      .value();

    this._markEdges();
    this._verticesToFaces();
  }

  makeVertexAtRC (rowIndex, colIndex) {
    const colOffset = this.colVector
      .clone()
      .multiplyScalar(colIndex);
    // a vector to push point towards corner 3 by colIndex units

    const basePoint = this.root
      .clone()
      .lerpVectors(this.root, this.rowPoint, rowIndex / this.divisions);
    // a vector lerped between corner 1 and 2 by rowIndex units
    let vertex = basePoint.add(colOffset);

    if (this.hexWorld) {
      const scale = this.hexWorld.radius / vertex.length();
      vertex.multiplyScalar(scale);
      // extruding the point to the spherical surface of the world
    }
    const zoneVertex = new HexZoneVector(vertex.x, vertex.y, vertex.z, this, rowIndex, colIndex, this.vertices.length);
    this.vertices.push(zoneVertex);
    return zoneVertex;
  }

  _verticesToFaces () {
    _(this.vertexes2dArray)
      .each((row, rowIndex) => {
        _.each(row, (first, colIndex) => {
          const nextRow = this.vertexes2dArray[rowIndex + 1];
          if (nextRow) {
            const next = nextRow[colIndex];
            const nextNext = nextRow[colIndex + 1];
            if (nextNext && next) {
              this.addFace(first, next, nextNext);
            } // first face
            const nextInRow = row[colIndex + 1];
            if (nextInRow && nextNext) {
              this.addFace(first, nextNext, nextInRow); // second face
            }
          }
        });
      });
  }

  // note - we are currently burying a lot of data about edges into vertices.
  // probably better to have a HexZoneEdge
  // or to have a "depth-shared" map of where edge points can be found. @TODO
  _markEdges () {
    if (!this.parent) {
      return;
    }

    // associate the subdivided points at the corners with the seed points from the higher level
    this.vertices[0].corner = this.parentVertices[0];
    _.first(_.last(this.vertexes2dArray)).corner = this.parentVertices[1];
    _.last(_.last(this.vertexes2dArray)).corner = this.parentVertices[2];

    let root_0, root_1, root_2;
    [root_0, root_1, root_2] = this.parentVertices;

    _.each([
      [root_0, root_1],
      [root_0, root_2],
      [root_1, root_2]
    ], (pair) => {
      const edge = this.edge(pair);
      edge.pop();
      edge.shift();
      const corners = this._edgeCorners(pair);

      // note - we aren't marking the corner points to be "on the edge".
      _.each(edge, (vertex, i) => {
        vertex.edge = pair;
        vertex.edgeCorners = corners; // the points the edge is between
        vertex.edgeIndex = i + 1; // the distance from the first point in the edge
      });
    });
  }

  // Metadata for a pair of corners
  _edgeCorners (vertex1, vertex2) {
    if (_.isArray(vertex1)) {
      [vertex1, vertex2] = vertex1;
    }

    if (vertex1.name) {
      vertex1 = vertex1.name;
    }
    if (vertex2.name) {
      vertex2 = vertex2.name;
    }

    return _.reduce(this.parentVertices, (corners, vertex, index) => {
      if (!(vertex.name === vertex1 || vertex.name === vertex2)) {
        return corners;
      }
      const name = vertex.name;
      corners.push({vertex, index, name});
      return corners;
    }, []);
  }
}

HexZone.neighborOffsets = [
  [1, 0],
  [1, 1],
  [0, 1],
  [0, -1],
  [-1, -1],
  [-1, 0]
];

/**
 *
 * Finds the point in the set closest to the input vertex.
 * The assumption made is that the point is already
 * very close to a point in the set,
 * so a (faster) manhattan distance is good enough.
 * If not pass true to careful and true distance is used.
 *
 * @param vertex {THREE.Vertex}
 * @param points {[THREE.Vertex]}
 * @param careful {boolean?}
 * @returns {THREE.Vertex || null}
 */
HexZone.closestPoint = (vertex, points, careful = false) => {
  if (points.length <= 1) {
    return points[0];
  }

  if (!_.isArray(points)) {
    throw new Error('closestPoint: bad array');
  }

  const vertexDistance = _.memoize((point) => careful ? point.distanceTo(vertex) : point.distanceToManhattan(vertex));

  return _(points)
    .sortBy(vertexDistance)
    .first();
};

module.exports = HexZone;
