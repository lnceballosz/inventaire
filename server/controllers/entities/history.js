// An endpoint to get entities history as snapshots and diffs
const __ = require('config').universalPath
const error_ = __.require('lib', 'error/error')
const responses_ = __.require('lib', 'responses')
const patches_ = require('./lib/patches')
const sanitize = __.require('lib', 'sanitize/sanitize')
const { hasAdminAccess } = __.require('lib', 'user_access_levels')
const anonymizePatches = require('./lib/anonymize_patches')

const sanitization = {
  id: {}
}

module.exports = (req, res) => {
  sanitize(req, res, sanitization)
  .then(async ({ id }) => {
    const patches = await patches_.getWithSnapshots(id)
    if (!hasAdminAccess(req.user)) await anonymizePatches(patches)
    return patches
  })
  .then(responses_.Wrap(res, 'patches'))
  .catch(error_.Handler(req, res))
}
