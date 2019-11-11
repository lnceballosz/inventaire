/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// A module to put the basis of an edition entity based on the results
// from dataseed. It tries to find the associated works and authors
// from Wikidata and Inventaire search (using searchWorkEntityByTitleAndAuthors)
// but if it fails to find the corresponding entities, it creates new ones.
// It assumes that any seed arriving here found no match to its ISBN

const CONFIG = require('config');
const __ = CONFIG.universalPath;
const _ = __.require('builders', 'utils');
const promises_ = __.require('lib', 'promises');
const error_ = __.require('lib', 'error/error');
const createInvEntity = require('../create_inv_entity');
// It is simpler to use a consistent, recognizable mocked user id
// than to put exceptions everywhere
const seedUserId = __.require('couch', 'hard_coded_documents').users.seed._id;
const workEntitiesCache = require('./work_entity_search_deduplicating_cache');

// Working around the circular dependencies
let searchWorkEntityByTitleAndAuthors = null;
let findAuthorFromWorksLabels = null;
const lateRequire = function() {
  searchWorkEntityByTitleAndAuthors = require('./search_work_entity_by_title_and_authors');
  return findAuthorFromWorksLabels = __.require('controllers', 'entities/lib/find_author_from_works_labels');
};
setTimeout(lateRequire, 0);

// seed attributes:
// MUST have: title

module.exports = function(seed){
  let { title, authors } = seed;
  if (!_.isNonEmptyString(title)) {
    return error_.reject('missing title', 400, title);
  }

  title = title.trim();

  if (!_.isArray(authors)) {
    return error_.reject('missing authors', 400, authors);
  }

  authors = authors.map(_.trim);

  // unless a lang is explicitly passed, deduce it from the the ISBN groupLang
  const lang = seed.lang || seed.groupLang || 'en';

  return searchWorkEntityByTitleAndAuthors(seed)
  .then(function(workEntity){
    let workPromise;
    if (workEntity != null) {
      _.log(seed, `scaffolding from existing work entity: ${workEntity.uri}`);
      workPromise = promises_.resolve(workEntity);
      workEntitiesCache.set(seed, workPromise);
      return workEntity;
    }

    return findAuthorsFromWorksTitleOrCreate(title, authors, lang)
    .then(function(authorsUris){
      _.log(seed, 'scaffolding work from scratch');
      workPromise = createWorkEntity(title, lang, authorsUris);
      workEntitiesCache.set(seed, workPromise);
      return workPromise;
    });
  });
};

var findAuthorsFromWorksTitleOrCreate = (title, authorsNames, lang) => promises_.all(authorsNames.map(findAuthorFromWorkTitleOrCreate(title, lang)));

// Returns a URI in any case, either from an existing entity or a newly created one
var findAuthorFromWorkTitleOrCreate = (title, lang) => authorName => findAuthorFromWorksLabels(authorName, [ title ], [ lang ])
.then(function(uri){
  if (uri != null) {
    return uri;
  } else {
    return createAuthorEntity(authorName, lang)
    .then(authorDoc => `inv:${authorDoc._id}`);
  }
});

var createAuthorEntity = function(authorName, lang){
  const labels = {};
  labels[lang] = authorName;
  const claims =
    {'wdt:P31': [ 'wd:Q5' ]};

  return createInvEntity({ labels, claims, userId: seedUserId })
  .then(_.Log('created author entity'))
  .catch(_.ErrorRethrow('createAuthorEntity err'));
};

var createWorkEntity = function(title, lang, authorsUris){
  const labels = {};
  if (_.isNonEmptyString(title)) { labels[lang] = title; }
  const claims = {
    'wdt:P31': [ 'wd:Q571' ],
    'wdt:P50': authorsUris
  };

  return createInvEntity({ labels, claims, userId: seedUserId })
  .then(_.Log('created work entity'))
  .catch(_.ErrorRethrow('createWorkEntity err'));
};
