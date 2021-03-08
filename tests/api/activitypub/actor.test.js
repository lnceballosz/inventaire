const CONFIG = require('config')
const __ = CONFIG.universalPath
require('should')
const { createUser, createUsername, createUserWithPrivateKey } = require('../fixtures/users')
const { signedReq } = require('../utils/utils')
const { startActivityPubServer } = require('../utils/activity_pub')
const { rawRequest } = require('../utils/request')
const { shouldNotBeCalled, rethrowShouldNotBeCalledErrors } = __.require('apiTests', 'utils/utils')
const { wait } = __.require('lib', 'promises')

const host = CONFIG.fullHost()
const endpoint = '/api/activitypub'
const query = username => `${endpoint}?action=actor&name=${username}`

describe('activitypub:actor', () => {
  it('should reject unsigned request', async () => {
    try {
      const receiverUsername = createUsername()
      await rawRequest('get', query(receiverUsername), {
        headers: {
          'content-type': 'application/activity+json'
        }
      })
      .then(shouldNotBeCalled)
    } catch (err) {
      rethrowShouldNotBeCalledErrors(err)
      const parsedBody = JSON.parse(err.body
      )
      parsedBody.status.should.equal(500)
      parsedBody.status_verbose.should.equal('no signature header')
    }
  })

  it('should reject when fetching an invalid publicKey', async () => {
    try {
      const emetterUser = await createUserWithPrivateKey()
      delete emetterUser.publicKey
      const { receiverActorUrl, emetterActorUrl } = await startServerWithEmetterUser(emetterUser)
      wait(50)
      await signedReq('get', endpoint, receiverActorUrl, emetterActorUrl, emetterUser.privateKey)
      .then(shouldNotBeCalled)
    } catch (err) {
      rethrowShouldNotBeCalledErrors(err)
      const parsedBody = JSON.parse(err.body
      )
      parsedBody.status.should.equal(500)
      parsedBody.status_verbose.should.equal('invalid publicKey found')
    }
  })

  it('should reject when key verification fails', async () => {
    try {
      const emetterUser = await createUserWithPrivateKey()
      const anotherUser = await createUserWithPrivateKey()
      emetterUser.privateKey = anotherUser.privateKey
      const { receiverActorUrl, emetterActorUrl } = await startServerWithEmetterUser(emetterUser)
      await signedReq('get', endpoint, receiverActorUrl, emetterActorUrl, emetterUser.privateKey)
      .then(shouldNotBeCalled)
    } catch (err) {
      rethrowShouldNotBeCalledErrors(err)
      const parsedBody = JSON.parse(err.body
      )
      parsedBody.status.should.equal(500)
      parsedBody.status_verbose.should.equal('signature verification failed')
    }
  })

  it('should reject unknown actor', async () => {
    try {
      const emetterUser = await createUserWithPrivateKey()
      const { emetterActorUrl } = await startServerWithEmetterUser(emetterUser)
      const imaginaryReceiverUsername = createUsername()
      const receiverActorUrl = `${host}${query(imaginaryReceiverUsername)}`
      await signedReq('get', endpoint, receiverActorUrl, emetterActorUrl, emetterUser.privateKey)
      .then(shouldNotBeCalled)
    } catch (err) {
      rethrowShouldNotBeCalledErrors(err)
      const parsedBody = JSON.parse(err.body
      )
      parsedBody.status_verbose.should.equal('unknown actor')
      parsedBody.status.should.equal(404)
    }
  })

  it('should return a json ld file', async () => {
    const emetterUser = await createUserWithPrivateKey()
    const { receiverActorUrl, emetterActorUrl } = await startServerWithEmetterUser(emetterUser)
    const res = await signedReq('get', endpoint, receiverActorUrl, emetterActorUrl, emetterUser.privateKey)
    const body = JSON.parse(res.body)
    body['@context'].should.an.Array()
    body.type.should.equal('Person')
    body.id.should.equal(receiverActorUrl)
    body.publicKey.should.be.an.Object()
    body.publicKey.owner.should.equal(receiverActorUrl)
  })
})

const startServerWithEmetterUser = async emetterUser => {
  const { origin } = await startActivityPubServer(emetterUser)
  const receiverUsername = createUsername()
  const receiverActorUrl = `${host}${query(receiverUsername)}`
  await createUser({ username: receiverUsername })
  const emetterActorUrl = `${origin}${query(emetterUser.username)}`
  wait(50)
  return { receiverActorUrl, emetterActorUrl }
}
