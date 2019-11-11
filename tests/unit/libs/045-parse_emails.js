/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const CONFIG = require('config');
const __ = CONFIG.universalPath;
const _ = __.require('builders', 'utils');

const should = require('should');
const parseEmails = __.require('controllers', 'invitations/lib/parse_emails');

describe('parse emails', function() {
  it('should be a function', function(done){
    parseEmails.should.be.a.Function();
    return done();
  });

  it('should take a string email list and return an array of strings', function(done){
    const emails = 'a@bla.org,b@bla.org, "Bob Example" <bob@example.com>';
    parseEmails(emails).should.be.an.Array();
    parseEmails(emails)[0].should.equal('a@bla.org');
    parseEmails(emails)[1].should.equal('b@bla.org');
    parseEmails(emails)[2].should.equal('bob@example.com');
    return done();
  });

  it('should return emails lowercased', function(done){
    parseEmails('BLAbla@bla.org').should.be.an.Array();
    parseEmails('BLAbla@bla.org')[0].should.equal('blabla@bla.org');
    return done();
  });

  it('should accept emails separated by a comma', function(done){
    const emails = 'a@bla.org, b@bla.org, c@bla.org';
    parseEmails(emails)[0].should.equal('a@bla.org');
    parseEmails(emails)[1].should.equal('b@bla.org');
    parseEmails(emails)[2].should.equal('c@bla.org');
    return done();
  });

  it('should accept emails separated by a newline break', function(done){
    const emails = "a@bla.org\nb@bla.org;\nc@bla.org\n";
    parseEmails(emails)[0].should.equal('a@bla.org');
    parseEmails(emails)[1].should.equal('b@bla.org');
    parseEmails(emails)[2].should.equal('c@bla.org');
    return done();
  });

  it('should accept emails separated by a semi-colon', function(done){
    const emails = 'a@bla.org;b@bla.org; c@bla.org';
    parseEmails(emails)[0].should.equal('a@bla.org');
    parseEmails(emails)[1].should.equal('b@bla.org');
    parseEmails(emails)[2].should.equal('c@bla.org');
    return done();
  });

  return it('should reject invalid emails', function(done){
    ((() => parseEmails(';;;;;'))).should.throw();
    ((() => parseEmails(';a;b;z;da;@azd'))).should.throw();
    ((() => parseEmails(';a;b;z;da;bla@azd.fr'))).should.throw();
    return done();
  });
});
