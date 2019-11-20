
const CONFIG = require('config')
const __ = CONFIG.universalPath
const _ = __.require('builders', 'utils')
const requests_ = __.require('lib', 'requests')
const qs = require('querystring')
const cache_ = __.require('lib', 'cache')
const { oneMonth } = __.require('lib', 'times')
const timespan = 3 * oneMonth

module.exports = (name, endpoint, getQuery) => id => {
  const key = `${name}:author-works-titles:${id}`
  return cache_.get({ key, fn: fetch.bind(null, endpoint, getQuery(id), id), timespan })
  .timeout(20000)
  .catch(err => {
    _.error(err, `${name} error fetching ${id}`)
    return []
  })
}

const fetch = (endpoint, query) => {
  const escapedQuery = qs.escape(query)
  const base = `${endpoint}?query=`
  const headers = { accept: 'application/sparql-results+json' }
  const url = base + escapedQuery

  return requests_.get({ url, headers })
  .then(res => res.results.bindings
  .map(result => ({
    title: (result.title != null ? result.title.value : undefined),
    url: (result.work != null ? result.work.value : undefined)
  })))
}
