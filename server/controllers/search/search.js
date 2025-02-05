const error_ = require('lib/error/error')
const responses_ = require('lib/responses')
const normalizeResult = require('./lib/normalize_result')
const { indexedTypes } = require('./lib/indexes')
const typeSearch = require('./lib/type_search')
const sanitize = require('lib/sanitize/sanitize')
const Group = require('models/group')

const sanitization = {
  search: {},
  lang: {},
  types: { allowlist: indexedTypes },
  limit: { default: 10, max: 100 },
  filter: {
    allowlist: [ 'wd', 'inv' ],
    optional: true
  },
  exact: {
    generic: 'boolean',
    optional: true,
    default: false
  },
}

module.exports = {
  get: (req, res) => {
    sanitize(req, res, sanitization)
    .then(params => {
      const { types, search, lang, limit, filter, exact, reqUserId } = params
      return typeSearch({ lang, types, search, limit, filter, exact })
      .then(results => {
        return results
        .filter(isSearchable(reqUserId))
        .map(normalizeResult(lang))
      })
      .then(results => results.slice(0, limit))
    })
    .then(responses_.Wrap(res, 'results'))
    .catch(error_.Handler(req, res))
  }
}

const isSearchable = reqUserId => result => {
  const source = result._source
  if (source.type === 'user') {
    return source.deleted !== true
  } else if (source.type === 'group') {
    if (source.searchable) return true
    if (reqUserId == null) return false
    // Only members should be allowed to find non-searchable groups in search
    return Group.userIsMember(reqUserId, source)
  } else {
    return true
  }
}
