/*global describe, it*/
'use strict';
const HexZone = require('./../lib/HexZone');
const expect = require('chai').expect;
const _ = require('lodash');
const THREE = require('three');

describe('HexZone', () => {

  describe('subdivide', () => {
    const top = new THREE.Vector3(0, 0, 0);
    const left = new THREE.Vector3(4, 0, 0);
    const right = new THREE.Vector3(0, 4, 0);

    let zone = new HexZone([top, left, right]);

    it('should give subdivided points', () => {j
      zone.subdivide(4);
      let subPoints = zone.subPoints;
      _.each(subPoints, (row, index) => {
        subPoints[index] = row.map((v) => v.toArray())
      });

      expect(subPoints).toEql([[[0, 0, 0]],
        [[1, 0, 0], [1, 1, 0]],
        [[2, 0, 0], [2, 1, 0], [2, 2, 0]],
        [[3, 0, 0], [3, 1, 0], [3, 2, 0], [3, 3, 0]],
        [[4, 0, 0], [4, 1, 0], [4, 2, 0], [4, 3, 0], [4, 4, 0]]]
      );
    });
  });

});
