/*global describe, it*/
'use strict';
const expect = require('chai').expect;
const _ = require('lodash');
const THREE = require('three');

const IsoTriangle = require('./../lib/IsoTriangle');
const Shape = require('./../lib/Shape');

describe('IsoTriangle', () => {
  let root, triangle;

  beforeEach(() => {
    root = new Shape();
    root.putPoint(0, 0, 10);
    root.putPoint(10, 0, 0);
    root.putPoint(10, 0, 10);
    triangle = new IsoTriangle(root, 0, [0, 1, 2]);
  });

  it('.rootPoint', () => {
    expect(triangle.rootPoint.x).to.eql(0);
    expect(triangle.rootPoint.y).to.eql(0);
    expect(triangle.rootPoint.z).to.eql(10);
  });

  it('.rowPoint', () => {
    expect(triangle.rowPoint.x).to.eql(10);
    expect(triangle.rowPoint.y).to.eql(0);
    expect(triangle.rowPoint.z).to.eql(0);
  });

  it('.colPoint', () => {
    expect(triangle.colPoint.x).to.eql(10);
    expect(triangle.colPoint.y).to.eql(0);
    expect(triangle.colPoint.z).to.eql(10);
  });

  describe('divide', () => {
    beforeEach(() => {
      triangle.divide(2);
    });

    it('should have the right points', () => {
      const points = triangle.points.map((point) => point.toArray());
      expect(points).to.eql([[0, 0, 10],
        [10, 0, 0],
        [10, 0, 10],
        [5, 0, 5],
        [5, 0, 10],
        [10, 0, 5]]);
    });

    it('should have the right shapes', () => {
      const ppi = triangle.shapes.map((s) => s.parentPointIndexes);
      expect(ppi).to.eql([
        [0, 3, 4],
        [3, 1, 5],
        [3, 5, 4],
        [4, 5, 2]])
    });
  })

});
