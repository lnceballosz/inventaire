CONFIG = require 'config'
__ = CONFIG.universalPath
_ = __.require 'builders', 'utils'
error_ = __.require 'lib', 'error/error'
groups_ = require './lib/groups'

module.exports = (req, res)->
  { name, searchable, description, position } = req.body
  unless name? then return error_.bundle res, 'missing group name', 400

  groups_.create
    name: name
    description: description or ''
    # convert from String to Boolean with true as default value
    searchable: searchable isnt 'false'
    # position can be either at latLng array or null (without position)
    position: position?.map(parseFloat) or null
    creatorId: req.user._id
  .then res.json.bind(res)
  .catch error_.Handler(res)
