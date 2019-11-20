
const __ = require('config').universalPath
const { oneMinute } = __.require('lib', 'times')

const attemptsLimit = 10
const periodMinutes = 5

let fails = {}
const flushFails = () => { fails = {} }

setInterval(flushFails, periodMinutes * oneMinute)

module.exports = {
  _fails: () => fails,
  _flushFails: flushFails,
  recordFail: (username, label) => {
    if (!fails[username]) { fails[username] = 0 }
    return ++fails[username]
  },

  tooMany: username => {
    return (fails[username] != null) && (fails[username] >= attemptsLimit)
  }
}
