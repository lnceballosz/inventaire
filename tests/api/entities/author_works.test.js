/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const CONFIG = require('config');
const __ = CONFIG.universalPath;
const _ = __.require('builders', 'utils');
const should = require('should');
const { nonAuthReq, undesiredErr } = require('../utils/utils');
const { createWorkWithAuthor } = require('../fixtures/entities');
const workWithAuthorPromise = createWorkWithAuthor();

describe('entities:author-works', () => it('should get an authors works', function(done){
  workWithAuthorPromise
  .then(function(work){
    const authorUri = work.claims['wdt:P50'][0];
    return nonAuthReq('get', `/api/entities?action=author-works&uri=${authorUri}`)
    .then(function(res){
      res.series.should.be.an.Array();
      res.works.should.be.an.Array();
      res.articles.should.be.an.Array();
      res.works[0].should.be.an.Object();
      res.works[0].uri.should.equal(`inv:${work._id}`);
      return done();
    });}).catch(undesiredErr(done));

}));
