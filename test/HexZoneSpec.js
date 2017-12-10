/*global describe, it*/
'use strict';
const HexZone = require('./../lib/HexZone');
const HexWorld = require('./../lib/Hexworld');

const expect = require('chai').expect;
const _ = require('lodash');
const THREE = require('three');

describe('HexZone', () => {
  describe('.hasParentVertex', () => {
    let hw;
    let vertex;
    let zones;

    beforeEach(() => {
      hw = new HexWorld(100, 0, 4);
      vertex = hw.vertices[2];

      zones = _.filter(hw.zones, (zone) => {
        return zone.hasParentVertex(vertex);
      });
    });

    it('should find 5 zones with a vertex', () => {
      expect(zones.length).to.eql(5);
    });

    it('should only find matches', () => {
      _.each(zones, (zone) => {
        expect(zone.hasParentVertex(vertex)).to.be.true;
      });
    });
  });
  describe('.divide', () => {
    let zone;
    let subPoint2ArrayAsArrayOfPoints;
    let subFacesAsArrayOfIndexes;

    beforeEach(() => {
      const top = new THREE.Vector3(2, 3, 4);
      const left = new THREE.Vector3(6, 3, 4);
      const right = new THREE.Vector3(2, 7, 4);

      zone = new HexZone([top, left, right]);
      zone.divide(4);
      subPoint2ArrayAsArrayOfPoints = zone.vertexes2dArray;
      _.each(subPoint2ArrayAsArrayOfPoints, (row, index) => {
        subPoint2ArrayAsArrayOfPoints[index] = row.map((v) => v.toArray());
      });

      subFacesAsArrayOfIndexes = zone.faces.map((face) => [face.a, face.b, face.c]);
    });

    it('should give vertexes2dArray', () => {
      expect(subPoint2ArrayAsArrayOfPoints).to.eql(
        [[[2, 3, 4]],
          [[3, 3, 4], [2, 4, 4]],
          [[4, 3, 4], [3, 4, 4], [2, 5, 4]],
          [[5, 3, 4], [4, 4, 4], [3, 5, 4], [2, 6, 4]],
          [[6, 3, 4], [5, 4, 4], [4, 5, 4], [3, 6, 4], [2, 7, 4]]]
      );
    });
    it('should give faces', () => {
      expect(subFacesAsArrayOfIndexes).to.eql(
        [[0, 1, 2],
          [1, 3, 4],
          [1, 4, 2],
          [2, 4, 5],
          [3, 6, 7],
          [3, 7, 4],
          [4, 7, 8],
          [4, 8, 5],
          [5, 8, 9],
          [6, 10, 11],
          [6, 11, 7],
          [7, 11, 12],
          [7, 12, 8],
          [8, 12, 13],
          [8, 13, 9],
          [9, 13, 14]]
      )
    });
  });

  describe('.hexWorld', () => {
    let hexWorld, zone;

    beforeEach(() => {
      hexWorld = new HexWorld(1000, 1, 4);
      zone = hexWorld.zone(0);
    });

    it('should give the zone\'s hexWorld', () => {
      expect(zone.hexWorld).to.equal(hexWorld);
    });
  });

  describe('.closestPoint', () => {
    let zone;
    let edge;

    beforeEach(() => {
      const hexWorld = new HexWorld(100, 1, 9);
      zone = hexWorld.zone(0);
      edge = zone.edge(zone.parentVertices)
    });

    it('should find the point closest to an edge point', () => {
      const targetPoint = edge[3].clone();
      targetPoint.x += 1;
      targetPoint.y += 1;
      const match = zone.closestPoint(targetPoint, edge, true);

      expect(match).to.equal(edge[3]);
    });
  });

  describe('.edgePointMirrorZone', () => {
    let zone, hexWorld, edge;

    beforeEach(() => {
      hexWorld = new HexWorld(100, 1, 4);
      zone = hexWorld.zone(0);
      edge = zone.edge(zone.parentVertices);
    });

    it('should find the mirror zone', () => {
      const mirrorZone = hexWorld.edgePointMirrorZone(edge[3]);
      expect(mirrorZone.index).to.eql(1);
    });
  });

  describe('.edge', () => {
    let zone;

    beforeEach(() => {
      const hexWorld = new HexWorld(100, 1, 4);
      zone = hexWorld.zone(0);
      // console.log('base:', zone.hexWorld._base.toJSON());
      // console.log('zone corners:', zone.parentVertices.map(vertString));

    });

    describe('should get the edges of the zone', () => {
      let root_0, root_1, root_2;

      beforeEach(() => {
        [root_0, root_1, root_2] = zone.parentVertices;
      });

      describe('for pair 0-1', () => {
        let edge;

        beforeEach(() => {
          edge = zone.edge(root_0, root_1);
        });

        it('should start at the first point', () => {
          expect(_.first(edge).distanceTo(root_0))
            .to.be.below(0.1);
        });
        it('should start at the first point', () => {
          expect(_.last(edge).distanceTo(root_1))
            .to.be.below(0.1);
        });
      });

      describe('for pair 0-2', () => {
        let edge;

        beforeEach(() => {
          edge = zone.edge(root_0, root_2);
        });

        it('should start at the first point', () => {
          expect(_.first(edge).distanceTo(root_0))
            .to.be.below(0.1);
        });
        it('should start at the first point', () => {
          expect(_.last(edge).distanceTo(root_2))
            .to.be.below(0.1);
        });
      });
      describe('for pair 1-2', () => {
        let edge;

        beforeEach(() => {
          edge = zone.edge(root_1, root_2);
        });

        it('should start at the first point', () => {
          expect(_.first(edge).distanceTo(root_1))
            .to.be.below(0.1);
        });

        it('should start at the first point', () => {
          expect(_.last(edge).distanceTo(root_2))
            .to.be.below(0.1);
        });
      });
    });

    describe('should mark corners', () => {
      let corners;

      beforeEach(() => {
        corners = _.filter(zone.subVertices, 'corner');
      });

      it('should have three corners', () => {
        expect(corners.length).to.eql(3);
      });

      it('should have corners at the parentVertices', () => {
        _.each(corners, (corner, index) => {
          const parentVertex = zone.parentVertices[index];
          expect(corner.distanceTo(parentVertex)).to.be.below(0.1);
        });
      });
    })
  });

  describe('.peers', () => {
    let zone;

    beforeEach(() => {
      const hexWorld = new HexWorld(100, 1, 6);
      zone = hexWorld.zone(0);
    });

    it('should not get any peers in the middle', () => {
      const vertex = zone.vertexAt(2, 1);
      expect(zone.peers(vertex)).to.eql([])
    });

    it('should get one peer at the edge', () => {
      const vertex = zone.vertexAt(3, 0);
      let peers = zone.peers(vertex);
      expect(peers.length).to.eql(1);
      expect(peers[0].rowIndex).to.eql(3);
      expect(peers[0].colIndex).to.eql(3);
      expect(peers[0].zone.index).to.eql(1);
    });
  });
  describe('.corners', () => {
    let zone;

    beforeEach(() => {
      const hexWorld = new HexWorld(100, 1, 6);
      zone = hexWorld.zone(0);
    });

    it('should return three corners', () => {
      const corners = zone.corners;
      expect(corners.length).to.eql(3);
    })
  });
});
