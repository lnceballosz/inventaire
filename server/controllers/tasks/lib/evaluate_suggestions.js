/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const __ = require('config').universalPath;
const _ = __.require('builders', 'utils');
const automerge = require('./automerge');
const { getEntityNormalizedTerms } = __.require('controllers', 'entities/lib/terms_normalization');

module.exports = (suspect, workLabels) => (function(suggestions) {
  const suspectTerms = getEntityNormalizedTerms(suspect);
  // Do not automerge if author name is in work title
  // as it confuses occurences finding on WP pages
  if (authorNameInWorkTitles(suspectTerms, workLabels)) { return suggestions; }
  const sourcedSuggestions = findSourced(suggestions);
  if (sourcedSuggestions.length === 0) { return suggestions; }
  if (sourcedSuggestions.length > 1) { return sourcedSuggestions; }
  return automerge(suspect.uri, sourcedSuggestions[0]);
});

var authorNameInWorkTitles = function(authorTerms, workLabels){
  for (let authorLabel of authorTerms) {
    for (let workLabel of workLabels) {
      if (workLabel.match(authorLabel)) { return true; }
    }
  }
  return false;
};

var findSourced = suggestions => suggestions.filter(sug => sug.occurrences.length > 0);
