/*global describe, it*/
'use strict';
const expect = require('chai').expect;
const _ = require('lodash');
const THREE = require('three');
const IsoRoot = require('./../lib/IsoRoot');
const stringify = require('csv-stringify/lib/sync');
const fs = require('fs');

describe('IsoRoot', () => {
  let root;

  beforeEach(() => {
    root = new IsoRoot(1);
  });

  it('should create 20 shapes', () => {
    expect(root.shapes.length).to.eql(20);
  });

  it('.divide', () => {
    root.divide(4);
    expect(root.shapes[0].divisions).to.eql(4);
  });

  it('(child).edgePeers', () => {
    const shape3 = root.shapes[3];
    const edgePeers = shape3.edgePeers().map((peer) => peer.cornerParentPointIndexes);
    expect(edgePeers).to.eql([[3, 4, 2], [5, 0, 2], [4, 9, 5]])
  });

  it('.pointData', () => {
    root.divide(3);
    const upVector = new THREE.Vector3(0, 0, 1);
    root.setPointData('lat', (point) => {
      return Math.round(360 * (upVector.angleTo(point) - Math.PI ) / (2 * Math.PI));
    });

    const data = [];
    root.eachPoint((point, index, shape) => {
      data.push([shape.identity.join('-'), index, point.x, point.y, point.z,
        shape.getPointData('lat', index)])
    }, true);

    const csv = stringify(data, {header: true, columns: 'id,index,x,y,z,lat'.split(',')});
    const savedData = fs.readFileSync(__dirname + '/pointData.csv').toString();
    expect(csv).to.eql(savedData);
  });
});
