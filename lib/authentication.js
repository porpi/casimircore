'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')

var error_message = ['Not authorized', 401]

module.exports = function (secret, cb) {
  return {
    verify_token: function (req, res, next) {
      var token = (req.body && req.body.token) ||
        (req.query && req.query.token) ||
        (req.headers && req.headers['x-access-token']) ||
        (req.params && req.params.token) ||
        (req.cookies && req.cookies.token)
      if (!token) return next()
      try {
        var decoded = jwt.decode(token, secret)
        if (decoded.exp <= Date.now()) return next()
        return cb(token, decoded, error_message, req, res, next)
      } catch (err) {
        return next()
      }
    },

    verify_specific_user_token: function (allowedUsers) {
      return function (req, res, next) {
        var user = req.user
        if (allowedUsers.indexOf(user.Username) === -1) req.user = null
        return next()
      }
    },

    check_access: function (req, res, next) {
      if (!req.user) return next(error_message)
      else return next()
    },

    issue_token: function (settings) {
      var token_params = {
        iss: settings.iss || 'guest',
        exp: moment().add(settings.expiration_time || 3600000, 'milliseconds').valueOf(),
        type: settings.type || 'session_token'
      }
      if (settings.data) token_params.data = settings.data
      var token = jwt.encode(token_params, secret)
      return token
    }
  }
}