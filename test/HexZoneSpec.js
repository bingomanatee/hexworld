/*global describe, it*/
'use strict';
const HexZone = require('./../lib/HexZone');
const expect = require('chai').expect;
const _ = require('lodash');
const THREE = require('three');

describe('HexZone', () => {

  describe('subdivide', () => {
    const top = new THREE.Vector3(2, 3, 4);
    const left = new THREE.Vector3(6, 3, 4);
    const right = new THREE.Vector3(2, 7, 4);

    let zone = new HexZone([top, left, right]);

    it('should give subdivided points', () => {
      zone.subdivide(4);
      let subPoints = zone.subPoint2Array;
      _.each(subPoints, (row, index) => {
        subPoints[index] = row.map((v) => v.toArray());
      });

      expect(subPoints).to.eql([[[0, 0, 0]],
        [[1, 0, 0], [1, 1, 0]],
        [[2, 0, 0], [2, 1, 0], [2, 2, 0]],
        [[3, 0, 0], [3, 1, 0], [3, 2, 0], [3, 3, 0]],
        [[4, 0, 0], [4, 1, 0], [4, 2, 0], [4, 3, 0], [4, 4, 0]]]
      );

      expect(zone.subFaces.map((face) => [face.a, face.b, face.c])).to.eql([[3, 1, 2],
        [3, 4, 2],
        [6, 3, 4],
        [6, 7, 4],
        [7, 4, 5],
        [7, 8, 5],
        [10, 6, 7],
        [10, 11, 7],
        [11, 7, 8],
        [11, 12, 8],
        [12, 8, 9],
        [12, 13, 9]])
    });
  });

});
