const CONFIG = require('config')
const __ = require('config').universalPath
const error_ = __.require('lib', 'error/error')
const user_ = __.require('controllers', 'user/lib/user')
const couch_ = __.require('lib', 'couch')

const host = CONFIG.fullPublicHost()

module.exports = async reqUsername => {
  const user = await user_.byUsername(reqUsername)
  .then(couch_.firstDoc)
  if (!user) throw error_.new('unknown actor', 404, reqUsername)
  const { picture, username } = user
  const actorUrl = `${host}/api/activitypub?action=actor&name=${username}`
  const actor = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1'
    ],
    type: 'Person',
    id: actorUrl,
    name: username
  }
  await addKeyPair(actor, user, actorUrl)
  addIcon(actor, picture)
  return actor
}

const addKeyPair = async (actor, user, actorUrl) => {
  let { publicKey } = user
  if (!publicKey) {
    publicKey = await user_.createKeyPair(user).publicKey
  }
  actor.publicKey = {
    // "#" is an identifier in order to host the key in a same document as the actor URL document
    id: `${actorUrl}#main-key`,
    owner: actorUrl, // must be actor.id
    publicKeyPem: publicKey
  }
}

const addIcon = (actor, picture) => {
  if (!picture) return
  const userPictureUrl = `${host}${picture}`
  actor.icon = {
    mediaType: 'image/jpeg',
    type: 'Image',
    url: userPictureUrl
  }
}
