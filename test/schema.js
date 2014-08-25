'use strict';

var test   = require('tap').test;
var kagawa = require('../index.js');


test('nested schema can be passed via the properties property', function(t) {
  t.plan(1);

  var schema = {
    foo: {
      properties: {
        bar: {
          type: 'email'
        }
      }
    }
  };
  var obj = {
    foo: {
      bar: 'foo bar'
    }
  };

  var errors = kagawa.run(obj, schema);
  t.ok(errors.length === 1 && errors[0].value === 'foo bar');
});


test('an error is thrown for an invalid configuration', function(t) {
  t.plan(1);

  var schema = {
    foo: {
      properties: {
        bar: true
      }
    }
  };
  var obj = {
    foo: {
      bar: ''
    }
  };

  try {
    kagawa.run(obj, schema);
  } catch(e) {
    t.ok(e);
  }
});