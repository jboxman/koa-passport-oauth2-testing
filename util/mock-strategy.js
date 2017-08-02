// https://github.com/marcosnils/passport-dev/blob/master/lib/strategy.js
const passport = require('passport-strategy');
const util = require('util');

// The reply from Github OAuth2
const user = require('../mockProfile');

function Strategy(name, cb) {
  if (!name || name.length === 0) { throw new TypeError('DevStrategy requires a Strategy name') ; }

  passport.Strategy.call(this);

  this.name = name;
  this._user = user;
  // Callback supplied to OAuth2 strategies handling verification
  this._cb = cb;
}

util.inherits(Strategy, passport.Strategy);

// Need 2 different users
Strategy.prototype.authenticate = function() {
  this._cb(null, null, this._user, (error, user) => {
    this.success(user);
  });
}

module.exports = {
  Strategy
};
