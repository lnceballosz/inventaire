// SPDX-FileCopyrightText:  2014  Maxime Lathuilière, Vincent Jumeaux
// SPDX-License-Identifier: AGPL-3.0-only

const CONFIG = require('config')
const _ = require('builders/utils')
const requests_ = require('lib/requests')
const error_ = require('lib/error/error')
const { host: elasticHost } = CONFIG.elasticsearch

const buildSearcher = params => {
  let { index, dbBaseName, queryBuilder } = params
  if (!index) index = CONFIG.db.name(dbBaseName)

  const url = `${elasticHost}/${index}/_search`

  return params => {
    const body = queryBuilder(params)

    return requests_.post(url, { body })
    .then(parseResponse)
    .catch(formatError)
    .catch(_.ErrorRethrow(`${index} search err`))
  }
}

const getHits = ({ hits, _shards }) => {
  if (_shards.failures) {
    const failure = _shards.failures[0]
    throw error_.new(failure.reason.reason, 500, failure)
  } else {
    return hits.hits
  }
}

const parseResponse = res => getHits(res).map(parseHit)

// Reshape the error object to be fully displayed when logged by _.warn
const formatError = err => {
  // Directly rethrow errors that aren't from Elasticsearch
  // like ECONNREFUSED errors
  if (err.body == null) throw err

  err.body.error.root_cause = err.body.error.root_cause[0]
  err.body = err.body.error

  // If Elasticsearch answers with a 404,
  // it's the expected Elasticsearch index is missing
  if (err.statusCode === 404) {
    err.statusCode = 500
    if (err.body.root_cause) {
      err.message += `: ${err.body.root_cause.reason}`
      err.context = err.body.root_cause
    }
  }

  throw err
}

const parseHit = hit => {
  const { _source: data, _id, _score } = hit
  data._id = _id
  data._score = _score
  return data
}

module.exports = { buildSearcher, getHits, parseResponse, formatError }
