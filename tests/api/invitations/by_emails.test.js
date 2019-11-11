/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const CONFIG = require('config');
const __ = CONFIG.universalPath;
const _ = __.require('builders', 'utils');
const should = require('should');
const { authReq, authReqB, authReqC, undesiredErr, undesiredRes } = require('../utils/utils');
const { groupPromise, getGroup } = require('../fixtures/groups');
const { signup } = require('../fixtures/users');
const randomString = __.require('lib', './utils/random_string');
const randomEmail = () => 'a' + randomString(4).toLowerCase() + '@foo.org';

// Do not re-test what test/libs/045-parse_emails unit tests already test

describe('invitations:by-emails', function() {
  describe('friends', function() {
    it('should accept an email as a string', function(done){
      authReq('post', '/api/invitations?action=by-emails',
        {emails: 'a@foo.org'})
      .then(function(res){
        res.emails[0].should.equal('a@foo.org');
        return done();}).catch(undesiredErr(done));

    });

    it('should accept several emails as a string', function(done){
      authReq('post', '/api/invitations?action=by-emails',
        {emails: 'a@foo.org,b@foo.org'})
      .then(function(res){
        res.emails[0].should.equal('a@foo.org');
        res.emails[1].should.equal('b@foo.org');
        return done();}).catch(undesiredErr(done));

    });

    it('should accept several emails as an array', function(done){
      authReq('post', '/api/invitations?action=by-emails',
        {emails: [ 'a@foo.org', 'b@foo.org' ]})
      .then(function(res){
        res.emails[0].should.equal('a@foo.org');
        res.emails[1].should.equal('b@foo.org');
        return done();}).catch(undesiredErr(done));

    });

    it('should reject missing emails', function(done){
      authReq('post', '/api/invitations?action=by-emails', {})
      .then(undesiredRes(done))
      .catch(function(err){
        err.body.status_verbose.should.equal('missing parameter in body: emails');
        return done();
      });

    });

    it('should reject invalid message', function(done){
      authReq('post', '/api/invitations?action=by-emails', {
        emails: 'a@foo.org',
        message: []
      })
      .then(undesiredRes(done))
      .catch(function(err){
        err.statusCode.should.equal(400);
        err.body.status_verbose.should.match(/invalid message:/);
        return done();}).catch(undesiredErr(done));

    });

    return it('should trigger an friend request on signup', function(done){
      const email = randomEmail();

      const invite = () => authReq('post', '/api/invitations?action=by-emails', { emails: email });

      invite()
      .then(() => signup(email))
      .then(() => authReq('get', '/api/relations'))
      .then(relations => invite()
      .then(function(res){
        res.users[0].email.should.equal(email);
        (relations.userRequested.includes(res.users[0]._id)).should.be.true();
        return done();
      })).catch(undesiredErr(done));

    });
  });

  return describe('groups', function() {
    it('should reject invalid group ids', function(done){
      authReq('post', '/api/invitations?action=by-emails', {
        emails: 'a@foo.org',
        group: 'abc'
      }).then(undesiredRes(done))
      .catch(function(err){
        err.statusCode.should.equal(400);
        err.body.status_verbose.should.equal('invalid group id: abc');
        return done();}).catch(undesiredErr(done));

    });

    it('should accept valid group ids', function(done){
      groupPromise
      .then(group => authReq('post', '/api/invitations?action=by-emails', {
        emails: 'a@foo.org',
        group: group._id
      }).then(function(res){
        res.emails[0].should.equal('a@foo.org');
        return done();
      })).catch(undesiredErr(done));

    });

    it('should accept non-user admin requests to invite to a group', function(done){
      groupPromise
      .then(group => // User B is a member (see ../fixtures/groups.coffee)
      authReqB('post', '/api/invitations?action=by-emails', {
        emails: 'a@foo.org',
        group: group._id
      })).then(function(res){
        res.emails[0].should.equal('a@foo.org');
        return done();}).catch(undesiredErr(done));

    });

    it('should reject non-member requests to invite to a group', function(done){
      groupPromise
      .then(group => // User C isnt a member
      authReqC('post', '/api/invitations?action=by-emails', {
        emails: 'a@foo.org',
        group: group._id
      })).catch(function(err){
        err.statusCode.should.equal(403);
        err.body.status_verbose.should.equal("user isn't a group member");
        return done();}).catch(undesiredErr(done));

    });

    return it('should trigger an invite on signup', function(done){
      const email = randomEmail();
      groupPromise
      .then(function(group){
        const invite = () => authReq('post', '/api/invitations?action=by-emails', {
          emails: email,
          group: group._id
        }
        );

        return invite()
        .then(() => signup(email))
        .then(() => getGroup(group._id))
        .then(function(updatedGroup){
          const prevInvitedCount = group.invited.length;
          const invitedCount = updatedGroup.invited.length;
          invitedCount.should.equal(prevInvitedCount + 1);
          const lastUserId = _.last(updatedGroup.invited).user;
          return invite()
          .then(function(res){
            res.users[0].email.should.equal(email);
            res.users[0]._id.should.equal(lastUserId);
            return done();
          });
        });}).catch(undesiredErr(done));

    });
  });
});
