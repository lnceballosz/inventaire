/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const __ = require('config').universalPath;
const _ = __.require('builders', 'utils');
const responses_ = __.require('lib', 'responses');
const error_ = __.require('lib', 'error/error');
const { Track } = __.require('lib', 'track');
const sanitize = __.require('lib', 'sanitize/sanitize');
const entities_ = require('./entities');
const moveToWikidata = require('./lib/move_to_wikidata');

const sanitization =
  {uri: {}};

module.exports = (req, res) => sanitize(req, res, sanitization)
.then(params => moveToWikidata(req.user, params.uri))
.then(responses_.Send(res))
.then(Track(req, ['entity', 'moveToWikidata']))
.catch(error_.Handler(req, res));
