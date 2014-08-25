'use strict';

var test   = require('tap').test;
var kagawa = require('../index.js');


test('returns validation errors when run synchronously', function(t) {
  t.plan(1);

  var schema = {
    foo: {
      type: 'email'
    }
  };

  var errors = kagawa.run({foo: ''}, schema);
  t.ok(errors.length === 1, 'errors returned');
});


test('passes validation errors to a callback when run asynchronously', function(t) {
  t.plan(1);

  var schema = {
    foo: {
      type: 'email'
    }
  };

  kagawa.run({foo: ''}, schema, function(err, errors) {
    t.ok(errors.length === 1, 'validation errors passed to callback');
  });
});


test('thrown errors are passed to the callback when run asynchronously', function(t) {
  t.plan(1);

  var schema = {
    foo: true
  };

  kagawa.run({foo: ''}, schema, function(err, errors) {
    t.ok(err !== null, 'thrown errors passed to callback');
  });
});