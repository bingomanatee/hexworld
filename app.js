'use strict';
// const messages = require('./controllers/messages');
const hwCtrl = require('./controllers/hwCtrl');

const compress = require('koa-compress');
const logger = require('koa-logger');
const serve = require('koa-static');
const route = require('koa-route');
const koa = require('koa');
const path = require('path');
const app = module.exports = koa();
const PORT = 3333;
// Logger
app.use(logger());

app.use(route.get('/', hwCtrl.home));
app.use(route.get('/hw/sphere', hwCtrl.sphere));
/*
app.use(route.get('/messages', messages.list));
app.use(route.get('/messages/:id', messages.fetch));
app.use(route.post('/messages', messages.create));
app.use(route.get('/async', messages.delay));
app.use(route.get('/promise', messages.promise)); */

// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// Compress
app.use(compress());

if (!module.parent) {
  app.listen(PORT);
  console.log('listening on port ' + PORT);
}
