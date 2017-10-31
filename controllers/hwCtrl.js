'use strict';
const views = require('co-views');
const Hexworld = require('./../lib/Hexworld');

const render = views(__dirname + '/../views', {
  map: { html: 'swig' }
});

module.exports.home = function *home(ctx) {
  this.body = yield render('home', { 'foo' : 1});
};

module.exports.sphere = function *sphere(ctx) {
  let hw = new Hexworld(100);
  this.body = hw.sphere_json()
};
