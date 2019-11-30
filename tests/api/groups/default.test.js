const CONFIG = require('config')
const __ = CONFIG.universalPath
const _ = __.require('builders', 'utils')
const should = require('should')
const { authReq, nonAuthReq, undesiredErr, undesiredRes } = require('../utils/utils')
const { groupPromise } = require('../fixtures/groups')
const endpoint = '/api/groups?action'

describe('groups:get:default', () => {
  it('should reject unauthentified user', done => {
    groupPromise
    .then(group => {
      nonAuthReq('get', endpoint)
      .then(undesiredRes(done))
      .catch(err => {
        err.body.status_verbose.should.equal('unauthorized api access')
        done()
      })
    })
    .catch(undesiredErr(done))
  })

  it('should get all user groups', done => {
    groupPromise
    .then(group => {
      authReq('get', endpoint)
      .get('groups')
      .then(res => {
        res.should.be.an.Array()
        const groupsIds = _.map(res, '_id')
        should(groupsIds.includes(group._id)).be.true()
        done()
      })
      .catch(undesiredErr(done))
    })
  })
})
