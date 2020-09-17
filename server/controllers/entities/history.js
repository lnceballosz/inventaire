// An endpoint to get entities history as snapshots and diffs
const __ = require('config').universalPath
const _ = __.require('builders', 'utils')
const error_ = __.require('lib', 'error/error')
const responses_ = __.require('lib', 'responses')
const patches_ = require('./lib/patches')
const sanitize = __.require('lib', 'sanitize/sanitize')
const { hasAdminAccess } = __.require('lib', 'user_access_levels')
const { _id: anonymizedId } = __.require('db', 'couch/hard_coded_documents').users.anonymized
const user_ = __.require('controllers', 'user/lib/user')

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

const anonymizePatches = async patches => {
  const usersIds = _.uniq(_.map(patches, 'user'))
  const users = await user_.byIds(usersIds)
  const anonymizedUserIdsByUserIds = buildAnonymizedUserIdsMap(users)
  patches.forEach(patch => {
    patch.user = anonymizedUserIdsByUserIds[patch.user]
  })
}

const buildAnonymizedUserIdsMap = users => {
  const anonymizedUserIdsByUserIds = {}
  for (const user of users) {
    const userSetting = _.get(user, 'settings.contributions.anonymize')
    if (userSetting === false) {
      anonymizedUserIdsByUserIds[user._id] = user._id
    } else {
      anonymizedUserIdsByUserIds[user._id] = anonymizedId
    }
  }
  return anonymizedUserIdsByUserIds
}
