const __ = require('config').universalPath
const error_ = __.require('lib', 'error/error')
const actor = __.require('controllers', 'activitypub/lib/actor')
const sanitize = __.require('lib', 'sanitize/sanitize')

const sanitization = {
  name: {}
}

module.exports = async (req, res) => {
  sanitize(req, res, sanitization)
  .then(params => {
    const { name } = params
    return actor(name)
  })
  .then(res.json.bind(res))
  .catch(error_.Handler(req, res))
}
