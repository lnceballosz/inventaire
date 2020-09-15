// An endpoint to get entities history as snapshots and diffs
const __ = require('config').universalPath
const error_ = __.require('lib', 'error/error')
const responses_ = __.require('lib', 'responses')
const patches_ = require('./lib/patches')
const sanitize = __.require('lib', 'sanitize/sanitize')
const { hasAdminAccess } = __.require('lib', 'user_access_levels')
const { _id: anonymizedId } = __.require('db', 'couch/hard_coded_documents').users.anonymized

const sanitization = {
  id: {}
}

module.exports = (req, res) => {
  sanitize(req, res, sanitization)
  .then(async ({ id }) => {
    const patches = await patches_.getWithSnapshots(id)
    if (!hasAdminAccess(req.user)) patches.forEach(anonymizePatch)
    return patches
  })
  .then(responses_.Wrap(res, 'patches'))
  .catch(error_.Handler(req, res))
}

const anonymizePatch = patch => { patch.user = anonymizedId }
