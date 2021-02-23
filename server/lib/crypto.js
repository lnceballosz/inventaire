const pw = require('./password_hashing')
const error_ = require('lib/error/error')
const crypto = require('crypto')
const { promisify } = require('util')
const generateKeyPair = promisify(crypto.generateKeyPair)

exports.passwords = {
  hash: async password => {
    if (password == null) throw error_.new('missing password', 400)
    return pw.hash(password)
  },

  verify: async (hash, password, tokenDaysToLive) => {
    if (hash == null) throw error_.new('missing hash', 400)

    if (tokenDaysToLive != null && pw.expired(hash, tokenDaysToLive)) {
      throw error_.new('token expired', 401)
    }

    if (password == null) throw error_.new('missing password', 400)

    return pw.verify(hash, password)
  }
}

const createHexHash = algo => input => {
  return crypto.createHash(algo)
  .update(input)
  .digest('hex')
}

exports.sha1 = createHexHash('sha1')
exports.md5 = createHexHash('md5')

exports.getRandomBytesBuffer = length => crypto.randomBytes(length)

exports.keyPair = {
  generateKeyPair: async () => {
    // from https://github.com/dariusk/express-activitypub/blob/master/routes/admin.js#L50
    return generateKeyPair('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })
  }
}
