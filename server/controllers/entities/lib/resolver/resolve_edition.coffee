CONFIG = require 'config'
__ = CONFIG.universalPath
_ = __.require 'builders', 'utils'
entities_ = require '../entities'
getInvEntityCanonicalUri = require '../get_inv_entity_canonical_uri'

module.exports = (entry)->
  { isbn } = entry.edition

  # Resolve directly on the database to avoid making undersired requests to dataseed
  entities_.byIsbn isbn
  .then addEditionUri(entry)
  .then -> entry

addEditionUri = (entry)-> (edition)->
  if edition?
    editionUri = getInvEntityCanonicalUri edition
    entry.edition.uri = editionUri
