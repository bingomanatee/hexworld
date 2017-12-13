const HexWorld = require('./lib/Hexworld');

const world =  new HexWorld(100, 1, 6);

const zone = world.zones[0];

const corner = zone.corners[1];

const neighbors = zone.neighbors(corner);

for (let n of neighbors) {
  console.log('neighbor: ', zone.vertexToString(n));
}

const peers = zone.peers(corner);
console.log('peers: ');

for (let n of peers) {
  console.log('peer: ', zone.vertexToString(n));
}

zone.vertexes2dArray.forEach((row, rowIndex) => {
  console.log('========== row ' + rowIndex);
  rowString = row.map((v) => {
   return `(${v.offsets.join(',')})`
  })
  console.log(rowString.join('   '));
});
