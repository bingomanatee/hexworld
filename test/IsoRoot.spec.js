/*global describe, it*/
'use strict';
const expect = require('chai').expect;
const _ = require('lodash');
const THREE = require('three');
const IsoRoot = require('./../lib/IsoRoot');

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
});
