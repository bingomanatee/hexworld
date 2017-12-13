const THREE = require('three');

class HexZoneVector extends THREE.Vector3 {

  constructor(x, y, z, zone = null, rowIndex = null, colIndex = null, vertexIndex = null) {
    super(x, y, z);
    this.zone = zone;
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
    this.vertexIndex = vertexIndex;
  }

  get name () {
    return `${this.zone.name}-v.${this.vertexIndex}`;
  }

  get divisions () {
    return this.zone.divisions;
  }

  get point1offset() {
    return this.rowIndex;
  }

  get point2offset() {
    return this.divisions - this.rowIndex + this.colIndex;
  }

  get point3offset() {
    return this.divisions - this.colIndex
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
