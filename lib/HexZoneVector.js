const THREE = require('three');

class HexZoneVector extends THREE.Vector3 {

  constructor(x, y, z, zone, rowIndex, colIndex) {
    super(x, y, z);
    this.zone = zone;
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
  }

  get subdivisions () {
    return this.zone.subdivisions;
  }

  get point1offset() {
    return this.rowIndex;
  }

  get point2offset() {
    return this.subdivisions - this.rowIndex + this.colIndex;
  }

  get point3offset() {
    return this.subdivisions - this.colIndex
  }

  toString(isParent) {
    const vRound = this.clone().round();
    return `${isParent ? 'parent' : 'sub'} point ${isParent ? this.name : this.vertexIndex}: ${vRound.toArray().join(', ')} 
    >> row ${this.rowIndex}, col ${this.colIndex}
    >> of zone ${this.zone.index} 
    >> offsets ${this.offsets.join(',')}`;
  }
  get offsets() {
    return [
      this.point1offset,
      this.point2offset,
      this.point3offset
    ]
  }

}

module.exports = HexZoneVector;
