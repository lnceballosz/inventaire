/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const CONFIG = require('config');
const __ = CONFIG.universalPath;
const _ = __.require('builders', 'utils');
const { Promise } = __.require('lib', 'promises');
const { getAlreadyResolvedUris, someTermsMatch, resolveSeed } = require('./helpers');
const entities_ = require('../entities');
const getEntitiesList = require('../get_entities_list');
const getEntityByUri = require('../get_entity_by_uri');
const { getEntityNormalizedTerms } = require('../terms_normalization');

module.exports = function(worksSeeds, editionSeed){
  if (editionSeed.uri == null) { return Promise.resolve(worksSeeds); }

  return getEntityByUri({ uri: editionSeed.uri })
  .then(function(editionEntity){
    if (editionEntity == null) { return worksSeeds; }
    const worksUris = editionEntity.claims['wdt:P629'];
    return getEntitiesList(worksUris)
    .then(worksEntities => worksSeeds.map(resolveWork(worksEntities)));
  });
};

var resolveWork = worksEntities => (function(workSeed) {
  const workSeedTerms = getEntityNormalizedTerms(workSeed);
  const matchingWorks = worksEntities.filter(someTermsMatch(workSeedTerms));
  return resolveSeed(workSeed)(matchingWorks);
});
