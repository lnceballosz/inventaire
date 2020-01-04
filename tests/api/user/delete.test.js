const should = require('should')
const { getReservedUser, customAuthReq } = require('../utils/utils')
const { getRefreshedUser } = require('../fixtures/users')

describe('user:delete', () => {
  it('should delete the user', async () => {
    const user = await getReservedUser()
    const res = await customAuthReq(user, 'delete', '/api/user')
    res.ok.should.be.true()
    const deletedUser = await getRefreshedUser(user)
    deletedUser._id.should.equal(user._id)
    const previousRevInteger = parseInt(user._rev.split('-')[0])
    parseInt(deletedUser._rev.split('-')[0]).should.equal(previousRevInteger + 1)
    deletedUser.username.should.equal(user.username)
    should(deletedUser.password).not.be.ok()
    should(deletedUser.email).not.be.ok()
    should(deletedUser.settings).not.be.ok()
    should(deletedUser.readToken).not.be.ok()
    should(deletedUser.picture).not.be.ok()
    should(deletedUser.snapshot).not.be.ok()
  })
})