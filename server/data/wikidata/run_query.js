/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const __ = require('config').universalPath;
const _ = __.require('builders', 'utils');
const cache_ = __.require('lib', 'cache');
const error_ = __.require('lib', 'error/error');
const requests_ = __.require('lib', 'requests');
const wdk = require('wikidata-sdk');
const makeSparqlRequest = require('./make_sparql_request');

const queries = require('./queries/queries');
const possibleQueries = Object.keys(queries);

// Params:
// - query: the name of the query to use from './queries/queries'
// - refresh
// - custom parameters: see the query file
module.exports = function(params){
  let k, value;
  let { query:queryName, refresh, dry } = params;

  // Converting from kebab case to snake case
  params.query = (queryName = queryName.replace(/-/g, '_'));
  if (!possibleQueries.includes(queryName)) {
    return error_.reject('unknown query', 400, params);
  }

  const { parameters } = queries[queryName];

  // Every type of query should specify which parameters it needs
  // with keys matching parametersTests keys
  for (k of parameters) {
    value = params[k];
    if ((parametersTests[k] != null) && !parametersTests[k](value)) {
      return error_.rejectInvalid(k, params);
    }
  }

  // Building the cache key
  let key = `wdQuery:${queryName}`;
  for (k of parameters) {
    value = params[k];
    // Known case: resolve_external_ids expects an array of [ property, value ] pairs
    if (!_.isString(value)) { value = JSON.stringify(value); }
    key += `:${value}`;
  }

  const fn = runQuery.bind(null, params, key);
  return cache_.get({ key, fn, refresh, dry, dryFallbackValue: [] });
};

var parametersTests = {
  qid: wdk.isItemId,
  pid: wdk.isPropertyId
};

var runQuery = function(params, key){
  const { query: queryName } = params;
  const { query: queryBuilder } = queries[queryName];
  const sparql = queryBuilder(params);

  return makeSparqlRequest(sparql)
  .catch(_.ErrorRethrow(key));
};
