const _ = require('builders/utils')
const assert_ = require('lib/utils/assert_types')
const formatters = require('./formatters/formatters')
const filters = require('./filters')
const deindex = require('./deindex')
const { addToBatch, postBatch } = require('./bulk')
const { updateDelay } = require('config').elasticsearch
const bulkThrottleDelay = updateDelay / 2

let batch = []

module.exports = ({ indexBaseName, index }) => {
  assert_.string(indexBaseName)

  index = index || indexBaseName
  const format = formatters[indexBaseName]
  const shouldBeDeindexed = deindex[indexBaseName]
  const filter = filters[indexBaseName]

  assert_.function(format)
  assert_.function(shouldBeDeindexed)
  assert_.function(filter)

  return async doc => {
    if (!filter(doc)) return
    if (shouldBeDeindexed(doc)) {
      addToBatch(batch, 'delete', index, doc)
    } else {
      // Allow the format function to return undefined,
      // to be used as a filter for cases that couldn't be filtered-out
      // by the filter function above
      const formattedDoc = await format(doc)
      if (formattedDoc) addToBatch(batch, 'index', index, formattedDoc)
    }
    if (batch.length >= 1000) postAndReset(batch)
    else lazyPostAndReset()
  }
}

const postAndReset = () => {
  postBatch(batch)
  batch = []
}

const lazyPostAndReset = _.throttle(postAndReset, bulkThrottleDelay, { leading: false })
