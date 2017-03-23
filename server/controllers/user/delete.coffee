__ = require('config').universalPath
_ = __.require 'builders', 'utils'
error_ = __.require 'lib', 'error/error'
promises_ = __.require 'lib', 'promises'
user_ = __.require 'controllers', 'user/lib/user'
relations_ = __.require 'controllers', 'relations/lib/queries'
comments_ = __.require 'controllers', 'comments/lib/comments'
deleteUserItems = __.require 'controllers', 'items/lib/delete_user_items'
groups_ = __.require 'controllers', 'groups/lib/groups'
notifs_ = __.require 'lib', 'notifications'
{ Track } = __.require 'lib', 'track'

module.exports = (req, res)->
  unless req.user? then return error_.unauthorizedApiAccess req, res
  reqUserId = req.user._id

  _.warn req.user, 'deleting user'

  user_.softDeleteById reqUserId
  .then cleanEverything.bind(null, reqUserId)
  # triggering track before logging out
  # to get access to req.user before it's cleared
  .tap Track(req, ['user', 'delete'])
  .then logout.bind(null, req)
  .then _.OkWarning(res, 'we will miss you :(')
  .catch error_.Handler(req, res)

# what should happen to old:
# commentaries => deleted (the user will expect it to clean her online presence )
# transactions => kept: those are private and remain useful for the other user

cleanEverything = (reqUserId)->
  promises_.all [
    relations_.deleteUserRelations reqUserId
    deleteUserItems reqUserId
    groups_.leaveAllGroups reqUserId
    notifs_.deleteAllByUserId reqUserId
  ]
  .then ->
    # should be run after to avoid conflicts with items comments deletion
    comments_.deleteItemsCommentsByUserId reqUserId

logout = (req)->
  _.warn req.session, 'session before logout'
  req.logout()
