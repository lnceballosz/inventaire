const __ = require('config').universalPath
const { 'wdt:P31': invP31Values } = __.require('controllers', 'entities/lib/properties/allowed_values_per_type_per_property')
const { getSingularTypes } = __.require('lib', 'wikidata/aliases')
const invEntitiesTypes = getSingularTypes(Object.keys(invP31Values))

module.exports = {
  allowedValues: {
    type: [ 'deduplicate' ],
    entitiesType: invEntitiesTypes,
    state: [ undefined, 'merged', 'dismissed' ],
  },

  updatable: [
    'state',
    'relationScore',
    'reporters',
  ]
}
