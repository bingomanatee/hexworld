/*global describe, it*/
'use strict';
const HexZone = require('./../lib/HexZone');
const expect = require('chai').expect;
const _ = require('lodash');
const THREE = require('three');

describe('HexZone', () => {

  describe('subdivide', () => {
    let zone;
    let subPoint2ArrayAsArrayOfPoints;
    let subFacesAsArrayOfIndexes;

    beforeEach(() => {
      const top = new THREE.Vector3(2, 3, 4);
      const left = new THREE.Vector3(6, 3, 4);
      const right = new THREE.Vector3(2, 7, 4);

      zone = new HexZone([top, left, right]);
      zone.subdivide(4);
      subPoint2ArrayAsArrayOfPoints = zone.subPoint2Array;
      _.each(subPoint2ArrayAsArrayOfPoints, (row, index) => {
        subPoint2ArrayAsArrayOfPoints[index] = row.map((v) => v.toArray());
      });

      subFacesAsArrayOfIndexes = zone.subFaces.map((face) => [face.a, face.b, face.c]);
    });

    it('should give subdivided points', () => {
      expect(subPoint2ArrayAsArrayOfPoints).to.eql(
        [ [ [ 2, 3, 4 ] ],
          [ [ 3, 3, 4 ], [ 2, 4, 4 ] ],
          [ [ 4, 3, 4 ], [ 3, 4, 4 ], [ 2, 5, 4 ] ],
          [ [ 5, 3, 4 ], [ 4, 4, 4 ], [ 3, 5, 4 ], [ 2, 6, 4 ] ],
          [ [ 6, 3, 4 ], [ 5, 4, 4 ], [ 4, 5, 4 ], [ 3, 6, 4 ], [ 2, 7, 4 ] ] ]
      );

      expect(subFacesAsArrayOfIndexes).to.eql(
        [ [ 0, 1, 2 ],
          [ 1, 3, 4 ],
          [ 2, 4, 5 ],
          [ 3, 6, 7 ],
          [ 4, 7, 8 ],
          [ 5, 8, 9 ],
          [ 6, 10, 11 ],
          [ 7, 11, 12 ],
          [ 8, 12, 13 ],
          [ 9, 13, 14 ] ]
      )
    });
  });

});
