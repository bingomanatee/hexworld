/*global describe, it*/
'use strict';
const HexZone = require('./../lib/HexZone');
const HexWorld = require('./../lib/Hexworld');

const expect = require('chai').expect;
const _ = require('lodash');
const THREE = require('three');

describe('HexZone', () => {

  describe('.subdivide', () => {
    let zone;
    let subPoint2ArrayAsArrayOfPoints;
    let subFacesAsArrayOfIndexes;

    beforeEach(() => {
      const top = new THREE.Vector3(2, 3, 4);
      const left = new THREE.Vector3(6, 3, 4);
      const right = new THREE.Vector3(2, 7, 4);

      zone = new HexZone([top, left, right]);
      zone.subdivide(4);
      subPoint2ArrayAsArrayOfPoints = zone.vertexes2dArray;
      _.each(subPoint2ArrayAsArrayOfPoints, (row, index) => {
        subPoint2ArrayAsArrayOfPoints[index] = row.map((v) => v.toArray());
      });

      subFacesAsArrayOfIndexes = zone.faces.map((face) => [face.a, face.b, face.c]);
    });

    it('should give subdivided points', () => {
      expect(subPoint2ArrayAsArrayOfPoints).to.eql(
        [[[2, 3, 4]],
          [[3, 3, 4], [2, 4, 4]],
          [[4, 3, 4], [3, 4, 4], [2, 5, 4]],
          [[5, 3, 4], [4, 4, 4], [3, 5, 4], [2, 6, 4]],
          [[6, 3, 4], [5, 4, 4], [4, 5, 4], [3, 6, 4], [2, 7, 4]]]
      );

      expect(subFacesAsArrayOfIndexes).to.eql(
        [[0, 1, 2],
          [1, 3, 4],
          [2, 4, 5],
          [3, 6, 7],
          [4, 7, 8],
          [5, 8, 9],
          [6, 10, 11],
          [7, 11, 12],
          [8, 12, 13],
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

  describe('.edge', () => {
    let zone;
    let subPoint2ArrayAsArrayOfPoints;
    let subFacesAsArrayOfIndexes;

    const vertString = (v) => v.clone().round().toArray().join(',')
      + ` name: ${v.name}, index: ${v.vertexIndex}`;

    const asInt = (vert) => _(vert.clone()
      .sub(_.first(pair))
      .round()
      .toArray()
    ).map((v) => v + 0)
      .value();

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

      const testPair = (pair) => {

        expect(edge[1].distanceTo(pair[1]))
          .to.be.below(0.1);
      };

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
  });
});
