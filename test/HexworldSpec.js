/*global describe, it*/
'use strict';
const Hexworld = require('./../lib/Hexworld');
const expect = require('chai').expect;
const _ = require('lodash');

describe('Hexworld', () => {
  describe('.sphere_json', () => {
    describe('at resolution 0', () => {
      let hw = new Hexworld(100, 0);
      let data = hw.sphere_json(false)[0];

      it('should return an object', () => {
        expect(_.isObject(data)).to.be.true;
      });

      it('should return 20 faces', () => {
        expect(data).to.have.property('faces');
        expect(_.isArray(data.faces)).to.be.true;
        expect(data.faces.length).to.eql(20);
      });

      it('should return 12 vertices', () => {
        expect(data).to.have.property('vertices');
        expect(_.isArray(data.vertices)).to.be.true;
        expect(data.vertices.length).to.eql(12);
      });
    });
    describe('at resolution 1', () => {
      let hw = new Hexworld(100, 1);
      let data = hw.sphere_json()[0];

      it('should return an object', () => {
        expect(_.isObject(data)).to.be.true;
      });

      it('should return 80 faces', () => {
        expect(data).to.have.property('faces');
        expect(_.isArray(data.faces)).to.be.true;
        expect(data.faces.length).to.eql(80);
      });

      it('should return 42 vertices', () => {
        expect(data).to.have.property('vertices');
        expect(_.isArray(data.vertices)).to.be.true;
        expect(data.vertices.length).to.eql(42);
      });
    });
  });

  describe('subdivide', () => {
    let hw = new Hexworld(100, 0, 4);
    let zone0 = hw._zones[0];
  })
});
