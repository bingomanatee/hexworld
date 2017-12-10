"use strict";
/*global describe, it*/
const expect = require('chai').expect;
const _ = require('lodash');

const binarySearch = require('../binary');

describe('binary', () => {
  let value, candidates;

  beforeEach(() => {
    candidates = [1, 2, 4, 8];
  });

  it('should find the lower bound for a low value', () => {
    value = 0;
    expect(binarySearch(value, candidates).indexes).to.eql([null, 0]);
  });

  it('should find the upper bound for a high value', () => {
    value = 10;
    expect(binarySearch(value, candidates).indexes).to.eql([3, null]);
  });

  it('should find the span around a number not in the set', () => {
    value = 3;
    expect(binarySearch(value, candidates).indexes).to.eql([1, 2]);
  });


  it('should find the  a number in the set', () => {
    value = 4;
    expect(binarySearch(value, candidates).indexes).to.eql([2]);
  });

});
