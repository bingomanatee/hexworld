'use strict';
const views = require('co-views');
const Hexworld = require('./../lib/Hexworld');
const _ = require('lodash');
const scale = 12;
const render = views(__dirname + '/../views', {
  map: { html: 'swig' }
});

module.exports.home = function *home(ctx) {
  this.body = yield render('home', { 'foo' : 1});
};

module.exports.sphere = function *sphere(ctx) {
  let hw = new Hexworld(100, 1, scale);
  hw.zones.forEach((zone) => {
    const row = _.random(1, scale - 1);
    const column = _.random(1, row);

    const vertex = zone.vertexAt(row, column);
    zone.neighbors(vertex).forEach((vertex) => {
      vertex.export = vertex.clone().multiplyScalar(1.1);
    });
    vertex.export = vertex.clone().multiplyScalar(1.05);
  });
  this.body = hw.sphere_json().map((g)=> g.toJSON());
};
