const _ = require('builders/utils')
require('should')
const { getUser, getReservedUser, customAuthReq } = require('apiTests/utils/utils')
const { makeFriends } = require('apiTests/utils/relations')
const { getNotifications } = require('apiTests/utils/notifications')

describe('notifications:update status', () => {
  it('should update a notification', async () => {
    const user = await getUser()
    const friend = await getReservedUser()
    await makeFriends(user, friend)
    const notifications = await getNotifications({ user, type: 'friendAcceptedRequest', subject: friend._id })
    notifications.length.should.equal(1)
    notifications[0].status.should.equal('unread')
    await customAuthReq(user, 'post', '/api/notifications', {
      times: _.map(notifications, 'time')
    })
    const updatedNotifications = await getNotifications({ user, type: 'friendAcceptedRequest', subject: friend._id })
    updatedNotifications.length.should.equal(1)
    updatedNotifications[0].status.should.equal('read')
  })
})
