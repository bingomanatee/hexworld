/*global describe, it*/
'use strict';
const superagent = require('supertest');
const app = require('../app');
const request = superagent(app.listen());

describe('Routes', () => {
  describe('GET /', () => {
    it('should return 200', done => {
      request
        .get('/')
        .expect(200, done);
    });
  });
  describe('GET /hw/sphere', () => {
    it('should return 200', done => {
      request
        .get('/hw/sphere')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });
});
