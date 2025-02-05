// SPDX-FileCopyrightText:  2014  Maxime Lathuilière, Vincent Jumeaux
// SPDX-License-Identifier: AGPL-3.0-only

const CONFIG = require('config')
const _ = require('builders/utils')
const error_ = require('lib/error/error')
const db = require('db/level/get_sub_db')('timeouts', 'json')
const { serverMode } = CONFIG
const { baseBanTime, banTimeIncreaseFactor } = CONFIG.outgoingRequests
// Using port to keep instances data separated
// to avoid overriding data between instances
// TODO: share ban data among instances
const dbKey = CONFIG.port

const timeoutData = {}

const restoreTimeoutsData = () => {
  db.get(dbKey)
  .then(restoreNonExpiredBans)
  .catch(err => {
    if (err.name === 'NotFoundError') return _.warn('no timeouts data found')
    else _.error(err, 'timeouts init err')
  })
}

const restoreNonExpiredBans = data => {
  const now = Date.now()
  Object.keys(data).forEach(host => {
    const hostData = data[host]
    if (hostData.expire > now) timeoutData[host] = data[host]
  })
  if (Object.keys(timeoutData).length > 0) _.success(timeoutData, 'timeouts data restored')
}

const throwIfTemporarilyBanned = host => {
  const hostTimeoutData = timeoutData[host]
  if (hostTimeoutData != null && Date.now() < hostTimeoutData.expire) {
    throw error_.new(`temporary ban: ${host}`, 500, { host, timeoutData: hostTimeoutData })
  }
}

const resetBanData = host => {
  delete timeoutData[host]
  lazyBackup()
}

const declareTimeout = host => {
  let hostTimeoutData = timeoutData[host]

  if (hostTimeoutData) {
    // Prevent several simulateous requests to all multiply the ban time
    // while the service might actually only have been down for a short while
    if (Date.now() < hostTimeoutData.expire) return
    // This host persists to timeout: renew and increase ban time
    hostTimeoutData.banTime *= banTimeIncreaseFactor
  } else {
    hostTimeoutData = timeoutData[host] = { banTime: baseBanTime }
  }

  hostTimeoutData.expire = Date.now() + hostTimeoutData.banTime
  lazyBackup()
}

const backup = () => {
  db.put(dbKey, timeoutData)
  .then(() => _.success('timeouts data backup'))
  .catch(_.Error('timeouts data backup err'))
}

const lazyBackup = serverMode ? _.debounce(backup, 10 * 1000) : _.noop

if (serverMode) restoreTimeoutsData()

module.exports = { throwIfTemporarilyBanned, resetBanData, declareTimeout }
