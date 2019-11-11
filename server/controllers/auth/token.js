/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const CONFIG = require('config');
const __ = CONFIG.universalPath;
const _ = __.require('builders', 'utils');
const ActionsControllers = __.require('lib', 'actions_controllers');
const user_ = __.require('controllers', 'user/lib/user');
const sanitize = __.require('lib', 'sanitize/sanitize');
const error_ = __.require('lib', 'error/error');
const passport_ = __.require('lib', 'passport/passport');
const promises_ = __.require('lib', 'promises');
const setLoggedInCookie = require('./lib/set_logged_in_cookie');

const sanitization = {
  email: {},
  token: { length: user_.tokenLength }
};

const confirmEmailValidity = (req, res) => sanitize(req, res, sanitization)
.then(params => user_.confirmEmailValidity(params.email, params.token))
.then(redirectValidEmail.bind(null, res, true))
.catch(redirectValidEmail.bind(null, res, false));

var redirectValidEmail = function(res, bool, resp){
  if (!bool) { _.error(resp, 'email validation failed'); }
  return res.redirect(`/?validEmail=${bool}`);
};

// reset password =
//    => start a session with email/token instead of username/pw
//    => redirect to the reset-password page
const allowPasswordReset = (req, res) => sanitize(req, res, sanitization)
.then(() => passport_.authenticate.resetPassword(req, res, Redirect(res)))
// Only handling sanitization rejected errors,
// passport_.authenticate, deals with its own errors
.catch(error_.Handler(req, res));

var Redirect = res => (function() {
  setLoggedInCookie(res);
  return res.redirect('/login/reset-password');
});

module.exports = {
  get: ActionsControllers({
    public: {
      'validation-email': confirmEmailValidity,
      'reset-password': allowPasswordReset
    }
  })
};
