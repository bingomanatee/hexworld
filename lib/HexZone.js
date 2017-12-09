'use strict';
const THREE = require('three');
const _ = require('lodash');
const HexZoneVector = require('./HexZoneVector');

/**
 * this is a triangle, subdivided into subtriangles.
 * It can either be the child of another hexZone or the original icosahedron.
 */
class HexZone {

  constructor(points, subdivisions = 1, parent, parentType = 'zone', index) {
    this.parentVertices = points;
    this.parent = parent;
    this.parentType = parentType;
    this.index = index;

    if (this.firstZone) {
      _.each(this.parentVertices, (vertex) => vertex.zones.add(this));
    }

    if (subdivisions > 1) {
      this.subdivide(subdivisions);
    }
  }

  hasParentVertex(corner) {
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

  get firstZone() {
    return this.parentType === 'hexworld';
  }

  get hexWorld() {
    if (this.firstZone) {
      return this.parent;
    } else if (this.parent) {
      return this.parent.hexWorld();
    } else {
      return null;
    }
  }

  get depth() {
    return this.firstZone ? 2 : this.parent ? this.parent.depth + 1 : 0;
  }

  set parentVertices(pointArray) {
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

  get parentVertices() {
    return this._parentVertices.slice(0);
  }

  indexOfCornerPoint(cornerVertex) {
    return _.indexOf(cornerVertex, this.parentVertices);
  }

  addFace(a, b, c) {
    const normal = a.clone()
      .add(b)
      .add(c)
      .normalize();
    this.faces.push(new THREE.Face3(a.vertexIndex, b.vertexIndex, c.vertexIndex, normal));
  }

  get root() {
    return this.parentVertices[0];
  }

  get rowPoint() {
    return this.parentVertices[1];
  }

  get colPoint() {
    return this.parentVertices[2];
  }

  get colVector() {
    if (!this._colVector) {
      this._colVector = this.colPoint
        .clone()
        .sub(this.rowPoint)
        .multiplyScalar(1 / this.subdivisions);
    }
    return this._colVector;
  }

  subdivide(subs) {
    if (arguments.length > 0) {
      this.subdivisions = subs;
    }
    this.faces = [];
    if (this.subdivisions < 2) {
      return;
    }

    this.vertexes2dArray = _(_.range(0, this.subdivisions + 1))
      .map((rowIndex) => {
        return _(_.range(0, rowIndex + 1))
          .map((colIndex) => {
            return this.subVertexAt(rowIndex, colIndex);
          })
          .value();
      })
      .value();
    this.subVertices = _(this.vertexes2dArray)
      .flatten()
      .value();
    _.each(this.subVertices, (vector, i) => vector.vertexIndex = i);

    this._markEdges();
    this._subdivideFaces();
  }

  subVertexAt(rowIndex, colIndex) {
    const colOffset = this.colVector
      .clone()
      .multiplyScalar(colIndex);

    const basePoint = this.root
      .clone()
      .lerpVectors(this.root, this.rowPoint, rowIndex / this.subdivisions);

    let vertex = basePoint.add(colOffset);

    if (this.hexWorld) {
      let scale = this.hexWorld.radius / vertex.length();
      vertex = vertex.multiplyScalar(scale);
    }
    vertex = new HexZoneVector(vertex.x, vertex.y, vertex.z, this, rowIndex, colIndex);
    return vertex;
  }

  _markEdges() {
    if (!this.parent) {
      return;
    }

    this.subVertices[0].corner = this.parentVertices[0];
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

      _.each(edge, (vertex, i) => {
        vertex.edge = pair;
        vertex.edgeCorners = corners;
        vertex.edgeIndex = i + 1;
      });
    });
  }

  get corners() {
    return [
      _.first(this.subVertices),
      _.first(_.last(this.vertexes2dArray)),
      _.last(this.subVertices)
    ];
  }

  _edgeCorners(vertex1, vertex2) {
    if (_.isArray(vertex1)) {
      vertex2 = vertex1[1];
      vertex1 = vertex1[0];
    }

    if (vertex1.name) {
      vertex1 = vertex1.name;
    }
    if (vertex2.name) {
      vertex2 = vertex2.name;
    }

    return _(this.parentVertices)
      .reduce((corners, vertex, index) => {
        if (!(vertex.name === vertex1 || vertex.name === vertex2)) {
          return corners;
        }
        const name = vertex.name;
        corners.push({vertex, index, name});
        return corners;
      }, []);
  }

  edge(vertex1, vertex2) {
    const corners = this._edgeCorners(vertex1, vertex2);

    if (corners.length < 2) {
      return [];
    }

    return this._edgePoints(corners);
  }

  _edgePoints(corners) {
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

  toString() {
    const points = _.map(this.parentVertices, (v) => this.vertexToString(v, true));
    return `zone index ${this.index} 
    depth ${this.depth}
    from points 
    -------------------------
    ${points.join("\n")}`;
  }

  vertexToString(v, isParent) {
    const vRound = v.clone().round();
    return `${isParent ? 'parent' : 'sub'} point ${isParent ? v.name : v.vertexIndex}: ${vRound.toArray().join(', ')} of zone ${this.index} - row ${v.rowIndex}, col ${v.colIndex}`;
  }

  _subdivideFaces() {
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

  vertexAt(rowIndex, colIndex) {
    if (_.isArray(rowIndex)) {
      [rowIndex, colIndex] = rowIndex;
    }
    if (!this.vertexes2dArray[rowIndex]) {
      return null;
    }
    return this.vertexes2dArray[rowIndex][colIndex];
  }

  vertexOffset(vertex, rowOffset, colOffset) {
    if (_.isArray(rowOffset)) {
      [rowOffset, colOffset] = rowOffset;
    }
    return this.vertexAt(vertex.rowIndex + rowOffset, vertex.colIndex + colOffset);
  }

  localNeighbors(vertex) {
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

  peers(vertex) {
    if (vertex.corner) {
      return this.hexWorld.cornerPeers(vertex);
    } else if (vertex.edge) {
      return this.hexWorld.edgePeers(vertex);
    } else {
      return [];
    }
  }

  neighbors(vertex) {
    if (vertex.neighors) {
      return vertex.neighbors;
    }
    const localNeighbors = this.localNeighbors(vertex); // neighbors in this zone

    let localPeers = _(localNeighbors)
      .map((local) => this.peers(local))
      .value(); // peers of localNeighbors in other zones.

    let peerNeighbors, vertexPeers;
    try {
      vertexPeers = this.peers(vertex);
      peerNeighbors = _.map(vertexPeers,
        (vertexPeer) => vertexPeer.zone.localNeighbors(vertexPeer));
    } catch (err) {
      console.log('error with peers of ', require('util').inspect(vertex, {depth: 0}))
      console.log('vertexPeers ', require('util').inspect(vertexPeers, {depth: 0}))

    }

    vertex.neighbors = _(localNeighbors)
      .concat(peerNeighbors)
      .concat(localPeers)
      .flatten()
      .compact()
      .uniq()
      .value();
    return vertex.neighbors;
  }

  geometry() {
    const vertices = _.map(this.subVertices, (p) => (p.export || p).clone());
    const faces = _.map(this.faces, (p) => p.clone());
    return _.extend(new THREE.Geometry(), {vertices, faces});
  }

  closestPoint(vertex, points, sorted = false) {
    return HexZone.closestPoint(vertex, points || this.subVertices, sorted);
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

HexZone.closestPoint = (vertex, points, sorted = false) => {
  if (points.length <= 1) {
    return points[0];
  }

  if (!_.isArray(points)) {
    throw new Error('closestPoint: bad array');
  }

  const vertexDistance = _.memoize((pointIndex) => points[pointIndex].distanceToManhattan(vertex));

  if (!sorted) {
    return _(points)
      .sortBy(vertexDistance)
      .first();
  }

  let lastIndex = points.length - 1;
  let firstIndex = 0;
  let candidates;
  while (lastIndex > firstIndex + 1) {
    candidates = _([lastIndex, firstIndex,
      Math.ceil(_.mean([lastIndex, firstIndex]))])
      .uniq();

    // console.log('first:', firstIndex);
    // console.log('last:', lastIndex);
    // console.log('candidates:', candidates.value());

    [firstIndex, lastIndex] = candidates
      .sortBy(vertexDistance) // order by distance
      .slice(0, 2) //find the two closest
      .sortBy() // sort by index order
      .value();
  }
  return candidates
    .sortBy(vertexDistance)
    .map((index) => points[index])
    .first();
};


module.exports = HexZone;
