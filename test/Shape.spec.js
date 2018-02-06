/*global describe, it*/
'use strict';
const Shape = require('./../lib/Shape');
const expect = require('chai').expect;
const _ = require('lodash');
const THREE = require('three');

describe('Shape', () => {

  describe('.constructor', () => {
    let parent, child;
    const parentIndexes = [2, 1];

    beforeEach(() => {
      parent = new Shape();
      parent.putPoint(0, 1, 0);
      parent.putPoint(1, 0, 1);
      parent.putPoint(0, 0, 1);
      child = new Shape(parent, 0, parentIndexes);
    });

    it('should reflect parent\'s points', () => {
      let firstPoint = child.getPoint(0);
      expect(firstPoint.x).to.equal(0);
      expect(firstPoint.y).to.equal(0);
      expect(firstPoint.z).to.equal(1);
    });

    it('should have the same pointIndexes as passed in', () => {
      expect(child.parentPointIndexes).to.eql(parentIndexes);
    });

  });

  describe('.putPoint', () => {
    let shape;

    beforeEach(() => {
      shape = new Shape();
    });

    it('should put a point without an index', () => {
      shape.putPoint(3, 4, 5);
      let firstPoint = shape.getPoint(0);
      expect(firstPoint.x).to.equal(3);
      expect(firstPoint.y).to.equal(4);
      expect(firstPoint.z).to.equal(5);
    });

    it('should put a point with an index', () => {
      shape.putPoint(3, 4, 5, 2);
      let pointAt2 = shape.getPoint(2);
      expect(pointAt2.x).to.equal(3);
      expect(pointAt2.y).to.equal(4);
      expect(pointAt2.z).to.equal(5);
    });
  });

  describe('.putVector', () => {
    let shape;

    beforeEach(() => {
      shape = new Shape();
    });

    it('should put a point without an index', () => {
      shape.putVector(new THREE.Vector3(3, 4, 5));
      let firstPoint = shape.getPoint(0);
      expect(firstPoint.x).to.equal(3);
      expect(firstPoint.y).to.equal(4);
      expect(firstPoint.z).to.equal(5);
    });

    it('should put a point without an index', () => {
      shape.putVector(new THREE.Vector3(3, 4, 5), 2);
      let pointAt2 = shape.getPoint(2);
      expect(pointAt2.x).to.equal(3);
      expect(pointAt2.y).to.equal(4);
      expect(pointAt2.z).to.equal(5);
    });
  });

});
