/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const CONFIG = require('config');
const __ = CONFIG.universalPath;
const _ = __.require('builders', 'utils');
const should = require('should');
const { nonAuthReq, undesiredRes } = require('../utils/utils');
const endpoint = '/api/auth?action=signup';
const randomString = __.require('lib', './utils/random_string');

describe('auth:signup', function() {
  it('should reject requests without username', function(done){
    nonAuthReq('post', endpoint, {})
    .then(undesiredRes(done))
    .catch(function(err){
      err.body.status_verbose.should.equal('missing parameter in body: username');
      return done();}).catch(done);

  });

  it('should reject requests without email', function(done){
    nonAuthReq('post', endpoint, { username: randomString(4) })
    .then(undesiredRes(done))
    .catch(function(err){
      err.body.status_verbose.should.equal('missing parameter in body: email');
      return done();}).catch(done);

  });

  it('should reject requests without password', function(done){
    nonAuthReq('post', endpoint, {
      username: randomString(4),
      email: `bla${randomString(4)}@foo.bar`
    }).then(undesiredRes(done))
    .catch(function(err){
      err.body.status_verbose.should.equal('missing parameter in body: password');
      return done();}).catch(done);

  });

  return it('should create a user', function(done){
    nonAuthReq('post', endpoint, {
      username: randomString(4),
      email: `bla${randomString(4)}@foo.bar`,
      password: randomString(8)
    }).then(function(res){
      res.ok.should.be.true();
      return done();}).catch(done);

  });
});
