/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const CONFIG = require('config');
const __ = CONFIG.universalPath;
const _ = __.require('builders', 'utils');
const items_ = __.require('controllers', 'items/lib/items');
const { getLastItems, formatData, embedUsersData, getHighlightedItems } = require('./last_books_helpers');

module.exports = function(user, limitDate = 0){
  const { _id:userId, position, lang } = user;

  if (position == null) { return formatData([], 'nearby', lang, []); }

  return items_.nearby(userId, 20, true)
  .spread(formatItems(limitDate, position, lang));
};

var formatItems = (limitDate, position, lang) => (function(users, items) {
  items = items.map(items_.serializeData);
  let lastItems = getLastItems(limitDate, items);
  const highlighted = getHighlightedItems(lastItems, 10);
  lastItems = embedUsersData(lastItems, users, position);
  return formatData(lastItems, 'nearby', lang, highlighted);
});
