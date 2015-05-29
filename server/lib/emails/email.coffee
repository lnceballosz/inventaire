CONFIG = require 'config'
__ = CONFIG.root
_ = __.require 'builders', 'utils'
qs = require 'querystring'

host = CONFIG.fullPublicHost()
i18n = require './i18n/i18n'
base =
  from: 'Inventaire.io <hello@inventaire.io>'

module.exports =
  validationEmail: (user, token)->
    {username, email, language} = user
    return _.extend {}, base,
      to: email
      subject: i18n language, 'email_confirmation_subject'
      template: 'validation_email'
      context:
        lang: user.language
        user: user
        href: buildTokenUrl 'validation-email', email, token

  resetPassword: (user, token)->
    {username, email, language} = user
    return _.extend {}, base,
      to: email
      subject: i18n language, 'reset_password_subject'
      template: 'reset_password'
      context:
        lang: user.language
        user: user
        href: buildTokenUrl 'reset-password', email, token


  friendAcceptedRequest: (options)->
    [user1, user2] = validateOptions options

    return _.extend {}, base,
      to: user1.email
      subject: i18n(user1.language, "friend_accepted_request_subject", user2)
      template: 'friend_accepted_request'
      context:
        user: user1
        lang: user1.language
        friend: user2
        host: host

  friendshipRequest: (options)->
    [user1, user2] = validateOptions options

    return _.extend {}, base,
      to: user1.email
      subject: i18n(user1.language, "friendship_request_subject", user2)
      template: 'friendship_request'
      context:
        user: user1
        lang: user1.language
        otherUser: user2
        host: host

  feedback: (subject, message, user, unknownUser)->
    return _.extend {}, base,
      to: base.from
      replyTo: user.email
      subject: "[feedback] #{subject}"
      template: 'feedback'
      context:
        subject: subject
        message: message
        user: user
        unknownUser: unknownUser


validateOptions = (options)->
  {user1, user2} = options
  _.types [user1, user2], 'objects...'
  unless user1.email? then throw new Error "missing user1 email"
  unless user2.username? then throw new Error "missing user2 username"
  return [user1, user2]

buildTokenUrl = (action, email, token)->
  _.buildPath "#{host}/api/auth/public/token",
    action: action
    email: email
    token: token
