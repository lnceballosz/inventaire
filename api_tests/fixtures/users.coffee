CONFIG = require 'config'
__ = CONFIG.universalPath
_ = __.require 'builders', 'utils'
breq = require 'bluereq'
should = require 'should'
host = CONFIG.fullHost()
authEndpoint = host + '/api/auth'
faker = require 'faker'
{ makeUserAdmin } = __.require 'controllers', 'user/lib/user'
{ request } = require '../utils/request'

connect = (endpoint, userData)-> breq.post { url: endpoint, body: userData }
signup = (userData)-> connect "#{authEndpoint}?action=signup", userData
login = (userData)->
  connect "#{authEndpoint}?action=login", userData
  .catch (err)->
    if err.statusCode isnt 401 then throw err
    return signup userData

module.exports = API =
  signup: (email)->
    signup
      email: email
      username: API.createUsername()
      password: faker.internet.password()

  createUser: (username)->
    username = username or API.createUsername()
    userData =
      username: username
      password: username.padEnd 8, '_'
      email: "#{username}@adomain.org"

    # Try to login first if the username is given, as a user with this username
    # might still exist if the database wasn't reset since the last test session
    authPromise = if username? then login(userData) else signup(userData)

    authPromise
    .then parseCookie
    .then API.getUserWithCookie

  createAdminUser: ->
    API.createUser()
    .tap (user)-> makeUserAdmin user._id

  getUserWithCookie: (cookie)->
    request 'get', '/api/user', null, cookie
    .then (user)->
      user.cookie = cookie
      return user

  getRefreshedUser: (userPromise)->
    userPromise
    # Get the up-to-date user doc while keeping the cookie
    # set by api_tests/fixtures/users
    .then (user)-> API.getUserWithCookie user.cookie

  createUsername: ->
    # faker firstName generates alphabet-only strings
    faker.fake '{{name.firstName}}{{name.firstName}}'

parseCookie = (res)-> res.headers['set-cookie'].join ';'
