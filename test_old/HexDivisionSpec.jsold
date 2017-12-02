/*global describe, it*/
'use strict';
const THREE = require('three');
const HexDivison = require('./../lib/HexDivision');
const Hexasphere = require('hexasphere.js');

const expect = require('chai').expect;
const _ = require('lodash');

const expectFloat = (n, n2, v = 0.01) => {
  expect(n).to.be.closeTo(n2, v);
};

const expectPoint = (p, x, y, z) => {
  if (_.isObject) {
    [x, y, z] = p.toArray();
  }
  expectFloat(p.x, x);
  expectFloat(p.y, y);
  expectFloat(p.z, z);
};

describe('HexDivision', () => {
  let div, div2;
  beforeEach(() => {

    let dummyWorld = {radius: 100};
    let sphere = new Hexasphere(100, 2);
    let sphere2 = new Hexasphere(200, 2);
    div = new HexDivison(dummyWorld, sphere.tiles[2], 4);
    div2 = new HexDivison(dummyWorld, sphere2.tiles[2], 4); // double the size
  });

  it('should return an object', () => {
    expect(_.isObject(div)).to.be.true;
  });

  describe('.divs', () => {
    it('should be 4', () => {
      expect(div.divs).to.eql(4);
    })
  });

  describe('.boundry', () => {
    it('should be expected values', () => {
      expectPoint(div.boundary[0], 54.8, -72, -27);
      expectPoint(div.boundary[1], 71.5, -61.7, 0);
      expectPoint(div.boundary[2], 54.8, -72, 27);
      expectPoint(div.boundary[3], 27.8, -88.7, 16.7);
      expectPoint(div.boundary[4], 27.8, -88.7, -16.7);
    });
  });

  describe('.center', () => {

    it('should be a Vector3', () => {
      expect(div.center instanceof THREE.Vector3).to.be.true;
    })
    it('should be the same as the tile center', () => {
      expect(div.center.distanceTo(div.tile.centerPoint)).to.eql(0);
    });
  });

  describe('.northPoint', () => {
    it('x', () => expect(div.northPoint.x).to.be.closeTo(54.792, 0.1));
    it('y', () => expect(div.northPoint.y).to.be.closeTo(-71.989, 0.1));
    it('z', () => expect(div.northPoint.z).to.be.closeTo(-26.967, 0.1));
  });

  describe('.northVector', () => {
    it('should return a vector', () => {
      expect(div.northVector instanceof THREE.Vector3).to.be.true;
    });

    it('should be the expected value', () => {
      expect(div.northVector.x).to.be.closeTo(0.554, 0.01);
      expect(div.northVector.y).to.be.closeTo(3.269, 0.01);
      expect(div.northVector.z).to.be.closeTo(-6.741, 0.01);
    });

    it('should change if the divs change', () => {
      div.divs = 8;
      expect(div.northVector.x).to.be.closeTo(0.277, 0.01);
      expect(div.northVector.y).to.be.closeTo(1.634, 0.01);
      expect(div.northVector.z).to.be.closeTo(-3.3708, 0.01);
    });

    it('should change for a larger world', () => {
      expect(div2.northVector.x).to.be.closeTo(1.10944, 0.01);
      expect(div2.northVector.y).to.be.closeTo(6.5380, 0.01);
      expect(div2.northVector.z).to.be.closeTo(-13.483, 0.01);
    });
  });

  describe('.westVector', () => {
    it('should return a vector', () => {
      expect(div.westVector instanceof THREE.Vector3).to.be.true;
    });

    it('should be the expected value', () => {
      expect(div.westVector.x).to.be.closeTo(4.7214, 0.01);
      expect(div.westVector.y).to.be.closeTo(5.84427, 0.01);
      expect(div.westVector.z).to.be.closeTo(0, 0.01);
    });

    it('should change if the divs change', () => {
      div.divs = 8;
      expect(div.westVector.x).to.be.closeTo(2.3607, 0.01);
      expect(div.westVector.y).to.be.closeTo(2.9221, 0.01);
      expect(div.westVector.z).to.be.closeTo(0, 0.01);
    });

    it('should change for a larger world', () => {
      expect(div2.westVector.x).to.be.closeTo(9.4429, 0.01);
      expect(div2.westVector.y).to.be.closeTo(11.6882, 0.01);
      expect(div2.westVector.z).to.be.closeTo(0, 0.01);
    });
  });

  it('should be about the same length', () => {
    expect(div.westVector.length() / div.northVector.length()).to.be.closeTo(1, 0.01);
  });

  describe('.tileSize', () => {
    it('should be around 30.05 at the initial settings', () => {
      expect(div.tileSize).to.be.closeTo(30.05, 0.01);
    });

    it('should be the same size if the divs change', () => {
      div.divs = 8;
      expect(div.tileSize).to.be.closeTo(30.05, 0.01);
    });

    it('should double if the radius doubles', () => {
      expect(div2.tileSize).to.be.closeTo(60.1, 0.01);
    });
  });

  describe('.validChildIndex', () => {
    it('should return true for origin', () => {
      expect(div.validChildIndex(0, 0)).to.be.true;
    });

    describe('should return true for the corners', () => {
      it('north', () => expect(div.validChildIndex(div.divs, 0)).to.be.true);
      it('south', () => expect(div.validChildIndex(-div.divs, 0)).to.be.true);
      it('west', () => expect(div.validChildIndex(0, div.divs)).to.be.true);
      it('east', () => expect(div.validChildIndex(0, -div.divs)).to.be.true);
    });
    describe('should return false past the corners', () => {
      it('north', () => expect(div.validChildIndex(div.divs + 1, 0)).to.be.false);
      it('south', () => expect(div.validChildIndex(-div.divs - 1, 0)).to.be.false);
      it('west', () => expect(div.validChildIndex(0, div.divs + 1)).to.be.false);
      it('east', () => expect(div.validChildIndex(0, -div.divs - 1)).to.be.false);
    });
  });

  describe('.children', () => {
    let subs ;
    beforeEach(() => subs = div.children())
    it('should produce the right range of children', () => {

      let childIds = _(subs)
        .map((child) => child.id)
        .sortBy((child) => child.value, (child) => child.west)
        .value();
      expect(childIds).to.eql(["node -4,0", "node -4,1", "node -4,2", "node -4,3", "node -4,4", "node -3,-1", "node -3,0", "node -3,1", "node -3,2", "node -3,3", "node -3,4", "node -2,-2", "node -2,-1", "node -2,0", "node -2,1", "node -2,2", "node -2,3", "node -2,4", "node -1,-3", "node -1,-2", "node -1,-1", "node -1,0", "node -1,1", "node -1,2", "node -1,3", "node -1,4", "node 0,-4", "node 0,-3", "node 0,-2", "node 0,-1", "node 0,0", "node 0,1", "node 0,2", "node 0,3", "node 0,4", "node 1,-4", "node 1,-3", "node 1,-2", "node 1,-1", "node 1,0", "node 1,1", "node 1,2", "node 1,3", "node 2,-4", "node 2,-3", "node 2,-2", "node 2,-1", "node 2,0", "node 2,1", "node 2,2", "node 3,-4", "node 3,-3", "node 3,-2", "node 3,-1", "node 3,0", "node 3,1", "node 4,-4", "node 4,-3", "node 4,-2", "node 4,-1", "node 4,0"]);
    });
    it('should have sensible subs', () => {
      let table = div.data();
      for (let sub of subs) {
        try {
          let center = sub.center.clone().round().toArray();
          table.push(['basis'].concat(sub.div.center.toArray()));
          table.push(['lerp', sub.northLerp, sub.southLerp]);
          if (sub.northLerp) {
            table.push(['lerping to north'].concat(sub.div.northPoint.clone().round().toArray()))
          }     if (sub.southLerp) {
            table.push(['lerping to south'].concat(sub.div.southPoint.clone().round().toArray()))
          }
          table.push(['sub '].concat(center));
        } catch (err) {
          console.log('error in centers: ', err.message);
          console.log('sub.div: ', sub.div);
          console.log('sub.div.world', sub.div.world);
        }
      }

      console.log('subdivisions:');
      console.log(table.toString());
    });
  });
});
