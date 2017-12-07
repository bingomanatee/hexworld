'use strict';
const THREE = require('three');
const _ = require('lodash');

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
    return this.firstZone? 2: this.parent ? this.parent.depth + 1 : 0;
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

  addFace(a, b, c) {
    const normal = a.clone()
      .add(b)
      .add(c)
      .normalize();
    this.faces.push(new THREE.Face3(a.vertexIndex, b.vertexIndex, c.vertexIndex, normal));
  }

  subdivide(subs) {
    if (subs) {
      this.subdivisions = subs;
    }
    if (this.subdivisions < 2) {
      return;
    }

    const root = this.parentVertices[0];
    const rowPoint = this.parentVertices[1];
    const colPoint = this.parentVertices[2];
    const colVector = colPoint
      .clone()
      .sub(rowPoint)
      .multiplyScalar(1 / this.subdivisions);

    this.faces = [];
    this.vertexes2dArray = _(_.range(0, this.subdivisions + 1))
      .map((rowIndex) => {
        const basePoint = root
          .clone()
          .lerpVectors(root, rowPoint, rowIndex / this.subdivisions);

        return _(_.range(0, rowIndex + 1))
          .map((colIndex) => {
            const colOffset = colVector
              .clone()
              .multiplyScalar(colIndex);
            let vertex = basePoint.clone().add(colOffset);
            if (this.hexWorld) {
              let scale = this.hexWorld.radius / vertex.length();
              vertex = vertex.multiplyScalar(scale);
            }
            vertex.rowIndex = rowIndex;
            vertex.colIndex = colIndex;
            vertex.zone = this;
            return vertex;
          })
          .value();
      })
      .value();
    this.subVertices = _(this.vertexes2dArray)
      .flatten()
      .value();
    _.each(this.subVertices, (point, i) => point.vertexIndex = i);

    this._markEdges();
    this._subdivideFaces();
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
      const edge = this.edge(pair[0], pair[1]);
      edge.pop();
      edge.shift();
      _.each(edge, (vertex) => {
        vertex.edge = pair;
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

  edge(vertex1, vertex2) {
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

    const corners = _(this.parentVertices)
      .reduce((corners, vertex, index) => {
        if (!(vertex.name === vertex1 || vertex.name === vertex2)) {
          return corners;
        }
        corners.push({vertex, index});
        return corners;
      }, []);

    const edge = _.map(corners, 'index').join('-');

    switch (edge) {
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
        console.log('bad edge:', vertex1, vertex2);
        throw new Error(`unknown edge ${edge}`);
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
      return `${isParent ? 'parent': 'sub'} point ${isParent ? v.name: v.vertexIndex}: ${vRound.toArray().join(', ')} of zone ${this.index}`;
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
  neighborAt(vertex, rowOffset, colOffset){
    if (_.isArray(rowOffset)) {
      [rowOffset, colOffset] = rowOffset;
    }
    return this.vertexAt(vertex.rowIndex + rowOffset, vertex.colIndex + colOffset);
  }

  neighbors(vertex) {
    const local = _(HexZone.neighborOffsets)
      .map((offsets) => [offsets[0] + vertex.rowIndex,
        offsets[1] + vertex.colIndex])
      .map((neighborOffset) => this.vertexAt(neighborOffset))
      .compact()
      .value();

    let peers = [];
    if (vertex.corner) {
      peers = this.hexWorld.cornerPeers(vertex);
    } else if (vertex.edge) {
      peers = this.hexWorld.edgePeers(vertex);
    }

    let neighbors = local.concat(peers);
    neighbors.local = local;
    neighbors.peers = peers;
    return neighbors;
  }

  localPeers(vertex) {
    return _([
      this.neighborAt()
    ])
  }

  geometry() {
    const vertices = _.map(this.subVertices, (p) => (p.export || p).clone());
    const faces = _.map(this.faces, (p) => p.clone());
    return _.extend(new THREE.Geometry(), {vertices, faces});
  }

  closestPoint(vertex, points, sorted = false) {
    return HexZone.closestPoint(vertex, points || this.subVertices, sorted);
  }
};

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
