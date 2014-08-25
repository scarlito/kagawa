'use strict';

var kagawa = require('../index');
var User = {
  findOne: function(val, cb) {
    var user = val === 'user@exists.com' ? true : null;
    setTimeout(function() {
      cb(null, user);
    }, 0);
  }
};

var schema = {
  email: {
    type: 'email',
    validate: function(val, done) {
      User.findOne(val, function(err, found) {
        done(null, !found);
      });
    },
    messages: {
      validate: 'A user already exists with this email address'
    }
  },
  password: {
    type: 'string',
    minLength: 8,
    message: 'Please provide a password of at least 8 characters'
  },
  passwordConfirmation: {
    requireValid: 'password',
    type: 'string',
    matches: '%{password}',
    message: 'Password confirmation must match your password'
  }
};

var data = {
  email: 'user@exists.com',
  password: 'password',
  passwordConfirmation: 'mismatch'
};

kagawa.run(data, schema, function(err, errors) {
  console.log(errors);
});