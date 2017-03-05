__ = require('config').universalPath
_ = __.require 'builders', 'utils'
user_ = __.require 'controllers', 'user/lib/user'
items_ = __.require 'controllers', 'items/lib/items'
comments_ = __.require 'controllers', 'comments/lib/comments'
error_ = __.require 'lib', 'error/error'
{ Track } = __.require 'lib', 'track'

module.exports =
  get: (req, res, next)->
    { item } = req.query
    reqUserId = req.user?._id

    items_.byId item
    .then comments_.verifyRightToWriteOrReadComment.bind(null, reqUserId)
    .then comments_.byItemId.bind(null, item)
    .then res.json.bind(res)
    .catch error_.Handler(req, res)

  # create
  post: (req, res, next)->
    unless req.user? then return error_.unauthorizedApiAccess req, res
    { item, message } = req.body
    reqUserId = req.user._id

    unless item? then return error_.bundle req, res, 'missing item id', 400
    unless message? then return error_.bundle req, res, 'missing message', 400

    _.log [item, message], 'item, message'

    items_.byId item
    .then _.partial(comments_.verifyRightToWriteOrReadComment, reqUserId)
    .then _.partial(comments_.addItemComment, reqUserId, message)
    .then res.json.bind(res)
    .then Track(req, ['item', 'comment'])
    .catch error_.Handler(req, res)

  # update
  put: (req, res, next)->
    unless req.user? then return error_.unauthorizedApiAccess req, res
    { id, message } = req.body
    reqUserId = req.user._id

    unless id? then return error_.bundle req, res, 'missing comment id', 400
    unless message? then return error_.bundle req, res, 'missing message id', 400

    _.log [id, message], 'comment id, message'

    comments_.byId id
    .then _.partial(comments_.verifyEditRight, reqUserId)
    .then _.partial(comments_.update, message)
    .then res.json.bind(res)
    .catch error_.Handler(req, res)

  delete: (req, res, next)->
    unless req.user? then return error_.unauthorizedApiAccess req, res
    { id } = req.query
    reqUserId = req.user._id

    comments_.byId id
    .then (comment)->
      items_.byId(comment.item)
      .then _.partial(comments_.verifyDeleteRight, reqUserId, comment)
    .then comments_.delete
    .then _.Ok(res)
    .catch error_.Handler(req, res)
