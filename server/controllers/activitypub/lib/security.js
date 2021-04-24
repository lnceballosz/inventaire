const error_ = require('lib/error/error')
const requests_ = require('lib/requests')
const crypto = require('crypto')

const API = module.exports = {
  sign: async ({ method, keyUrl, privateKey, endpoint, hostname, date }) => {
    const signer = crypto.createSign('rsa-sha256')
    const stringToSign = API.buildSignatureString({ method, hostname, endpoint, date })
    signer.update(stringToSign)
    signer.end()
    const signature = signer.sign(privateKey)
    const signatureB64 = signature.toString('base64')
    // headers must respect signature string keys order
    // ie. (request-target) host date
    // see Section 2.3 of https://tools.ietf.org/html/draft-cavage-http-signatures-08
    const headers = '(request-target) host date'
    return `keyId="${keyUrl}",headers="${headers}",signature="${signatureB64}"`
  },

  buildSignatureString: ({ method, hostname, endpoint, date }) => {
    // 'method' must be lowercased
    // 'date' should be a UTC string
    return `(request-target): ${method} ${endpoint}\nhost: ${hostname}\ndate: ${date}`
  },

  verifySignature: async req => {
    const { hostname, method, path: endpoint, headers } = req
    const { date, signature } = headers
    if (!(signature)) throw error_.new('no signature header', 500, headers)
    const { keyId, signature: signatureString } = parseSignature(signature)
    const publicKey = await fetchActorPublicKey(keyId)
    const verifier = crypto.createVerify('rsa-sha256')
    const signedString = API.buildSignatureString({ method: method.toLowerCase(), hostname, endpoint, date })

    verifier.update(signedString)
    if (!(verifier.verify(publicKey, signatureString, 'base64'))) {
      throw error_.new('signature verification failed', 500, { publicKey })
    }
    // TODO: verify date
  }
}

const fetchActorPublicKey = async keyId => {
  const { publicKey } = await requests_.get(keyId)
  if (publicKey === undefined || publicKey.length === 0) {
    throw error_.new('invalid publicKey found', 500)
  }
  // TODO: handle timeout
  return publicKey
}

const parseSignature = signature => {
  const signatureParts = signature.split('",')
  const signatureObj = {}
  for (const part of signatureParts) {
    // trailing =" for signature key
    let [ key, value ] = part.split('="')
    if (key === 'signature') value += '='
    signatureObj[key] = removeTrailingQuote(value)
  }
  return signatureObj
}

const removeTrailingQuote = line => line.replace(/"$/, '')
