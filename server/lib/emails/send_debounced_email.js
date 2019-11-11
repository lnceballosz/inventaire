/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const CONFIG = require('config');
const __ = CONFIG.universalPath;
const _ = __.require('builders', 'utils');

const transporter_ = require('./transporter');
const email_ = require('./email');
const sendTransactionEmail = require('./send_transaction_email');
const helpers_ = require('./helpers');
const promises_ = __.require('lib', 'promises');

module.exports = {
  transactionUpdate(transactionId){
    return sendTransactionEmail(transactionId)
    .then(transporter_.sendMail)
    .catch(helpers_.catchDisabledEmails)
    .catch(promises_.catchSkip('send_transaction_email'))
    .catch(_.Error('transactionUpdate'));
  }
};
