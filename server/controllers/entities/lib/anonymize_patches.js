const __ = require('config').universalPath
const _ = __.require('builders', 'utils')
const { _id: anonymizedId } = __.require('db', 'couch/hard_coded_documents').users.anonymized
const user_ = __.require('controllers', 'user/lib/user')
const { shouldBeAnonymized } = __.require('models', 'user')

module.exports = async patches => {
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
    if (shouldBeAnonymized(user)) {
      anonymizedUserIdsByUserIds[user._id] = anonymizedId
    } else {
      anonymizedUserIdsByUserIds[user._id] = user._id
    }
  }
  return anonymizedUserIdsByUserIds
}
