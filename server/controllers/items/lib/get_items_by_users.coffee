__ = require('config').universalPath
_ = __.require 'builders', 'utils'
items_ = __.require 'controllers', 'items/lib/items'
user_ = __.require 'controllers', 'user/lib/user'
promises_ = __.require 'lib', 'promises'
{ addUsersData } = require './queries_commons'

module.exports = (reqUserId, includeUsersDocs)-> (usersIds)->
  getRelations reqUserId, usersIds
  .then fetchRelationsItems(reqUserId)
  .then (items)->
    if includeUsersDocs then return addUsersData(reqUserId)(items)
    else return items

getRelations = (reqUserId, usersIds)->
  # All users are considered public users when the request isn't authentified
  unless reqUserId? then return promises_.resolve { public: usersIds }

  relations = {}
  if reqUserId in usersIds
    relations.user = reqUserId
    usersIds = _.without usersIds, reqUserId

  if usersIds.length is 0 then return promises_.resolve relations

  user_.getRelationsStatuses reqUserId, usersIds
  .spread (friends, coGroupMembers, publik)->
    relations.network = friends.concat coGroupMembers
    relations.public = publik
    return relations

fetchRelationsItems = (reqUserId)-> (relations)->
  itemsPromises = {}
  { user, network, public:publik } = relations
  # Includes ownerSafe attributes
  if user? then itemsPromises.user = items_.byOwner user
  # Exclude ownerSafe attributes
  if network?
    itemsPromises.network = items_.networkListings network, reqUserId
  if publik?
    itemsPromises.public = items_.publicListings publik, reqUserId

  return promises_.props itemsPromises
