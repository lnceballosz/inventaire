/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Comment, validations;
const CONFIG = require('config');
const __ = CONFIG.universalPath;
const error_ = __.require('lib', 'error/error');

module.exports = (Comment = {});

Comment.validations = (validations = require('./validations/comment'));

Comment.createTransactionComment = function(userId, message, transactionId){
  validations.pass('transactionId', transactionId);
  return createComment(userId, message, 'transaction', transactionId);
};

var createComment = function(userId, message, key, value){
  validations.pass('userId', userId);
  validations.pass('message', message);

  const comment = {
    user: userId,
    message,
    created: Date.now()
  };

  // the key identifies the object to which the comment is attached
  comment[key] = value;

  return comment;
};
