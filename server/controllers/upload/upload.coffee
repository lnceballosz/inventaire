CONFIG = require 'config'
__ = CONFIG.universalPath
_ = __.require 'builders', 'utils'
{ Promise } = __.require 'lib', 'promises'
parseForm = require './lib/parse_form'
error_ = __.require 'lib', 'error/error'
images_ = __.require 'lib', 'images'
{ objectStorage } = CONFIG
{ putImage } = require './put_image'

client = switch objectStorage
  when 'aws' then require './lib/aws_client'
  when 'swift' then require './lib/swift_client'
  when 'local' then require './lib/local_client'
  else throw new Error 'unknown object storage configuration'

exports.post = (req, res, next)->
  unless req.user? then return error_.unauthorizedApiAccess req, res

  parseForm req
  .then (formData)->
    { fields, files } = formData
    for key, file of files
      validateFile file
      file.id = key

    promises = _.values(files).map putImage

    Promise.all promises
    .then indexCollection

  .then _.Log('upload post res')
  .then res.json.bind(res)
  .catch error_.Handler(req, res)

validateFile = (file)->
  { type } = file
  unless type is 'image/jpeg'
    throw error_.new 'only jpeg are accepted', 400, type, file

indexCollection = (collection)->
  index = {}
  for data in collection
    { id, url } = data
    index[id] = url

  return index
