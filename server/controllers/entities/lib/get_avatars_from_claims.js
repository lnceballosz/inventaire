/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('lodash');

const avatarData = (platform, id) => ({
  url: `https://avatars.io/${platform}/${id}`,

  credits: {
    text: _.capitalize(platform) + ' profil picture',
    url: `https://${platform}.com/${id}`
  }
});

const platforms = {
  'wdt:P2002': 'twitter',
  'wdt:P2003': 'instagram',
  'wdt:P2013': 'facebook'
};

const platformsProperties = Object.keys(platforms);

const aggregateAvatars = claims => (function(array, property) {
  const websiteUserId = claims[property] != null ? claims[property][0] : undefined;
  if (websiteUserId) {
    const platform = platforms[property];
    array.push(avatarData(platform, websiteUserId));
  }
  return array;
});

const getAvatarsFromClaims = claims => platformsProperties.reduce(aggregateAvatars(claims), []);

module.exports = {
  getAvatarsDataFromClaims: getAvatarsFromClaims,
  getAvatarsUrlsFromClaims(claims){
    return getAvatarsFromClaims(claims)
    .map(_.property('url'));
  }
};
