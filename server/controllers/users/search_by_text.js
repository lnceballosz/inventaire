const _ = require('builders/utils')
const error_ = require('lib/error/error')
const responses_ = require('lib/responses')
const { buildSearcher } = require('lib/elasticsearch')
const queryBuilder = require('controllers/search/lib/social_query_builder')

module.exports = (req, res) => {
  const { query } = req
  const search = query.search && query.search.trim()

  if (!_.isNonEmptyString(search)) {
    return error_.bundleInvalid(req, res, 'search', search)
  }

  return searchByText({ search })
  .then(responses_.Wrap(res, 'users'))
  .catch(error_.Handler(req, res))
}

const searchByText = buildSearcher({
  dbBaseName: 'users',
  queryBuilder
})
