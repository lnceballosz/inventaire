// An endpoint to list entities edits made by a user
const __ = require('config').universalPath
const error_ = __.require('lib', 'error/error')
const sanitize = __.require('lib', 'sanitize/sanitize')
const responses_ = __.require('lib', 'responses')
const patches_ = require('./lib/patches')
const user_ = __.require('controllers', 'user/lib/user')
const { shouldBeAnonymized } = __.require('models', 'user')
const anonymizePatches = require('./lib/anonymize_patches')

const sanitization = {
  user: { optional: true },
  limit: { default: 100, max: 1000 },
  offset: { default: 0 }
}

module.exports = (req, res) => {
  sanitize(req, res, sanitization)
  .then(getContributions)
  .then(responses_.Send(res))
  .catch(error_.Handler(req, res))
}

const getContributions = async ({ userId, limit, offset, reqUserHasAdminAccess }) => {
  if (userId && !reqUserHasAdminAccess) {
    const user = await user_.byId(userId)
    if (shouldBeAnonymized(user)) {
      throw error_.new('non-public contributions', 403)
    }
  }

  let patchesPage
  if (userId != null) {
    patchesPage = await patches_.byUserId(userId, limit, offset)
  } else {
    patchesPage = await patches_.byDate(limit, offset)
  }

  if (!reqUserHasAdminAccess) await anonymizePatches(patchesPage.patches)

  return patchesPage
}
