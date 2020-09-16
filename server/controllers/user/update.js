const __ = require('config').universalPath
const _ = __.require('builders', 'utils')
const { attributes, validations, formatters } = __.require('models', 'user')
const { updatable, concurrencial, acceptNullValue } = attributes
const updateEmail = __.require('controllers', 'user/lib/update_email')
const db = __.require('couch', 'base')('users')
const availability_ = __.require('controllers', 'user/lib/availability')
const error_ = __.require('lib', 'error/error')
const responses_ = __.require('lib', 'responses')
const { basicUpdater } = __.require('lib', 'doc_updates')
const { Track } = __.require('lib', 'track')
const sanitize = __.require('lib', 'sanitize/sanitize')

const sanitization = {
  attribute: {},
  value: {
    canBeNull: true
  }
}

module.exports = (req, res) => {
  sanitize(req, res, sanitization)
  .then(updateUser(req.user))
  .then(responses_.Ok(res))
  .then(Track(req, [ 'user', 'update' ]))
  .catch(error_.Handler(req, res))
}

// This function update the document and should thus
// rather be in the User model, but async checks make it a bit hard
const updateUser = user => async params => {
  const { attribute } = params
  let { value } = params

  if (value == null && !acceptNullValue.includes(attribute)) {
    throw error_.newMissingBody('value')
  }

  // doesnt change anything for normal attribute
  // returns the root object for deep attributes such as settings
  const rootAttribute = attribute.split('.')[0]

  // support deep objects
  const currentValue = _.get(user, attribute)

  if (value === currentValue) {
    throw error_.new('already up-to-date', 400, { attribute, value })
  }

  if (attribute !== rootAttribute) {
    if (!validations.deepAttributesExistance(attribute)) {
      throw error_.newInvalid('attribute', attribute)
    }
  }

  if (formatters[attribute]) value = formatters[attribute](value)

  if (updatable.includes(rootAttribute)) {
    if (!_.get(validations, rootAttribute)(value)) {
      throw error_.newInvalid('value', value)
    }

    return updateAttribute(user, attribute, value)
  }

  if (concurrencial.includes(attribute)) {
    // Checks for validity and availability (+ reserve words for username)
    await availability_[attribute](value, currentValue)
    return updateAttribute(user, attribute, value)
  }

  throw error_.new('forbidden update', 403, { attribute, value })
}

const updateAttribute = (user, attribute, value) => {
  if (attribute === 'email') {
    return updateEmail(user, value)
  } else {
    return db.update(user._id, basicUpdater.bind(null, attribute, value))
  }
}
