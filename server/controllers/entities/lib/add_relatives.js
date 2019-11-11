/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Enrich ../by_uris results with entities related to the directly
// requested entities, following those entities claims

const __ = require('config').universalPath;
const _ = __.require('builders', 'utils');
const getEntitiesByUris = require('./get_entities_by_uris');

module.exports = function(relatives, refresh){
  if (relatives == null) { return _.identity; }

  var addRelatives = function(results){
    const { entities } = results;

    const additionalEntitiesUris = getAdditionalEntitiesUris(entities, relatives);

    if (additionalEntitiesUris.length === 0) { return results; }

    return getEntitiesByUris({ uris: additionalEntitiesUris, refresh })
    // Recursively add relatives, so that an edition could be sent
    // with its works, and its works authors and series
    .then(addRelatives)
    .then(function(additionalResults){
      // We only need to extend entities, as those additional URIs
      // should already be the canonical URIs (no redirection needed)
      // and all URIs should resolve to an existing entity
      _.extend(results.entities, additionalResults.entities);
      return results;
    });
  };

  return addRelatives;
};

var getAdditionalEntitiesUris = (entities, relatives) => _(entities)
.values()
.map(getEntityRelativesUris(relatives))
.flattenDeep()
.uniq()
.value();

var getEntityRelativesUris = relatives => entity => _.values(_.pick(entity.claims, relatives));
