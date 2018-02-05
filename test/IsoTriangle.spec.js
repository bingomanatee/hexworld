/*global describe, it*/
'use strict';
const expect = require('chai').expect;
const _ = require('lodash');
const THREE = require('three');
const IsoTriangleEdge = require('./../lib/IsoTriangle/IsoTriangleEdge');

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
  });

  describe('.localNeighbors', () => {
    beforeEach(() => {
      triangle.divide(4);
    });

    it('should get the local neighbors of a corner', () => {
      expect(triangle.divider.localNeighborIndexes(0, 0)).to.eql([3, 4]);
      expect(triangle.divider.localNeighborIndexes(4, 4)).to.eql([14, 11]);
      expect(triangle.divider.localNeighborIndexes(4, 0)).to.eql([12, 8]);
    });

    it('should get the local neighbors of a central point', () => {
      expect(triangle.divider.localNeighborIndexes(2, 1)).to.eql([9, 10, 7, 5, 3, 4]);
    });

    it('should get the local neighbors of an edge point', () => {
      expect(triangle.divider.localNeighborIndexes(2, 2)).to.eql([10, 11, 6, 4]);
    });
  });

  describe('edges', () => {
    beforeEach(() => {
      triangle.divide(4);
    });

    it('should produce the pointString', () => {
      console.log('pointString: -----------');
      console.log(triangle.divider.pointsString);
    });

    it('root-row', () => {
      expect(triangle.divider.edges.get(IsoTriangleEdge.EDGE_ROOT_ROW).pointIndexes)
        .to.eql([0, 3, 5, 8, 1]);
    });

    it('root-col', () => {
      expect(triangle.divider.edges.get(IsoTriangleEdge.EDGE_ROOT_COL).pointIndexes)
        .to.eql([0, 4, 7, 11, 2]);
    });

    it('roow-col', () => {
      expect(triangle.divider.edges.get(IsoTriangleEdge.EDGE_ROW_COL).pointIndexes)
        .to.eql([1, 12, 13, 14, 2]);
    });

    it('edge identity root-row', () => {
      expect(triangle.divider.edges.get(IsoTriangleEdge.EDGE_ROOT_ROW).edgeIdentity).to.eql(IsoTriangleEdge.EDGE_ROOT_ROW);
    });

    it('edge identity root-col', () => {
      expect(triangle.divider.edges.get(IsoTriangleEdge.EDGE_ROOT_COL).edgeIdentity).to.eql(IsoTriangleEdge.EDGE_ROOT_COL);
    });

    it('edge identity row-col', () => {
      expect(triangle.divider.edges.get(IsoTriangleEdge.EDGE_ROW_COL).edgeIdentity).to.eql(IsoTriangleEdge.EDGE_ROW_COL);
    });

    describe('.pointEdges', () => {
      describe('(at corners)', () => {
        it('should find two edges at top corner', () => {
          expect(triangle.divider.rcEdges(0, 0).map((edge) => edge.edgeIdentity)).to.eql([
            "EDGE_ROOT_ROW",
            "EDGE_ROOT_COL"
          ]);
        });

        it('should find two edges at row corner', () => {
          expect(triangle.divider.rcEdges(4, 0).map((edge) => edge.edgeIdentity)).to.eql([
            "EDGE_ROOT_ROW",
            "EDGE_ROW_COL"
          ]);
        });

        it('should find two edges at col corner', () => {
          expect(triangle.divider.rcEdges(4, 4).map((edge) => edge.edgeIdentity)).to.eql([
            "EDGE_ROOT_COL",
            "EDGE_ROW_COL"
          ]);
        });
      });

      describe('(at edges)', () => {
        it('should find edge at row', () => {
          expect(triangle.divider.rcEdges(1, 0).map((edge) => edge.edgeIdentity)).to.eql([
            "EDGE_ROOT_ROW"
          ]);
        });
        it('should find edge at col', () => {
          expect(triangle.divider.rcEdges(1, 1).map((edge) => edge.edgeIdentity)).to.eql([
            "EDGE_ROOT_COL"
          ]);
        });
      });
    });
  });
});
