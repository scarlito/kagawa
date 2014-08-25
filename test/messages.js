'use strict';

var test   = require('tap').test;
var kagawa = require('../index.js');
var validators = require('../lib/validators').validators;
var messages = kagawa.messages;


test('default error messages', function(t) {
  t.plan(1);

  var obj = { email: 'foobar.com'};
  var schema = {
    email: {
      type: 'email'
    }
  };

  var errors = kagawa.run(obj, schema);
  t.ok(errors[0].message == messages.email, 'validator error message used');
});


test('an error message is parsed with the validator expectation', function(t) {
  t.plan(1);

  var obj = { email: 'foo@bar.com'};
  var schema = {
    email: {
      maxLength: 10,
      message: 'The length should be at least %{characters}'
    }
  };

  var errors = kagawa.run(obj, schema);
  t.ok(errors[0].message == 'The length should be at least 10'
    , '%{} is parsed and replaced with the validator argument');
});


test('messages defined on the property', function(t) {
  t.plan(3);

  var obj, errors, schema = {
    email: {
      type: 'email',
      minLength: 10,
      validate: function() { return false; },
      message: 'property error',
      messages: {
        minLength: 'specific error',
        validate:  'validate error'
      }
    }
  };

  obj = { email: 'foobar.com'};
  errors = kagawa.run(obj, schema);
  t.ok(errors[0].message == 'property error', 'general message used');

  obj = { email: 'f@b.com'};
  errors = kagawa.run(obj, schema);
  t.ok(errors[0].message == 'specific error', 'individual message used');

  obj = { email: 'foo@bar.com'};
  errors = kagawa.run(obj, schema);
  t.ok(errors[0].message == 'validate error', 'validate function uses individual message');
});


test('a default messages exists for each validator', function(t) {
  ['validate'].concat(Object.keys(validators)).forEach(function(key) {
    if(messages[key] === undefined)
      throw new Error(key + ' does not have a default error message');
  });
  t.end();
});