/*global describe, it*/
'use strict';
const Hexworld = require('./../lib/Hexworld');
const expect = require('chai').expect;
const _ = require('lodash');

describe('Hexworld', () => {
  describe('.sphere_json', () => {
    let hw = new Hexworld(100, 2);
    let data = hw.sphere_json();
    it('should return an object', () => {
      expect(_.isObject(data)).to.be.true;
    });

    it('should return 42 faces', () => {
      expect(data).to.have.property('faces');
      expect(_.isArray(data.faces)).to.be.true;
      expect(data.faces.length).to.eql(42);
    });

    it('should return 80 points', () => {
      expect(data).to.have.property('points');
      expect(_.isArray(data.points)).to.be.true;
      expect(data.points.length).to.eql(80);
    });
  });
});
