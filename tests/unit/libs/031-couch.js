/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const CONFIG = require('config');
const __ = CONFIG.universalPath;
const _ = __.require('builders', 'utils');

const should = require('should');

const couch_ = __.require('lib', 'couch');

describe('couch_', function() {
  it('env', function(done){
    couch_.should.be.an.Object();
    return done();
  });

  return describe('joinOrderedIds', () => it('should return ordered id', function(done){
    const id1 = couch_.joinOrderedIds('azerty', 'qwerty');
    id1.should.equal('azerty:qwerty');
    const id2 = couch_.joinOrderedIds('qwerty', 'azerty');
    id2.should.equal('azerty:qwerty');
    const id3 = couch_.joinOrderedIds('qwerty', '15hello');
    id3.should.equal('15hello:qwerty');
    return done();
  }));
});
