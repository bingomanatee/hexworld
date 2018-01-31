const THREE = require('three');
const _ = require('lodash');

const Shape = require('./Shape');

class IsoTriangle extends Shape {

  get rootIndex () { return 0; }
  get rowPointIndex() { return 1;}
  get colPointIndex() { return 2;}

  get rootPoint () {
    return this.getPoint(this.rootIndex);
  }

  get rowPoint () {
    return this.getPoint(this.rowPointIndex);
  }

  get colPoint () {
    return this.getPoint(this.colPointIndex);
  }
}

module.exports = IsoTriangle;
