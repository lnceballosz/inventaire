__ = require('config').universalPath
_ = __.require 'builders', 'utils'
items_ = __.require 'controllers', 'items/lib/items'
error_ = __.require 'lib', 'error/error'
{ Track } = __.require 'lib', 'track'
snapshotEntityData = require './lib/snapshot/snapshot_entity_data'

module.exports = (req, res, next)->
  { body:item } = req

  _.log item, 'item create'

  { entity:entityUri } = item
  unless entityUri? then return error_.bundleMissingBody req, res, 'entity'

  unless _.isEntityUri entityUri
    return error_.bundleInvalid req, res, 'entity', entityUri

  reqUserId = req.user._id
  itemId = item._id

  snapshotEntityData item, entityUri
  .then items_.create.bind(null, reqUserId)
  .then (item)-> res.status(201).json item
  .tap Track(req, ['item', 'creation'])
  .catch error_.Handler(req, res)
