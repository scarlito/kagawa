'use strict';

var test   = require('tap').test;
var kagawa = require('../index.js');


test('validation is not performed when value is undefined', function(t) {
  t.plan(3);

  var errors, schema;
  schema = {
    prop: {
      type: 'email',
      required: false
    }
  };

  errors = kagawa.run({}, schema);
  t.ok(!errors.length
    , 'validation not performed on undefined value');
  errors = kagawa.run({prop: ''}, schema);
  t.ok(errors.length === 1
    , 'validation performed as normal when value is defined')

  schema = {
    prop: {
      type: 'email',
      required: true
    }
  };

  errors = kagawa.run({}, schema);
  t.ok(errors.length === 1 && errors[0].failed === 'required'
    , 'error added when required value is undefined');
});


test('it is applied by default', function(t) {
  t.plan(1);

  var schema = {
    prop: {
      type: 'string'
    }
  };

  var errors = kagawa.run({}, schema);
  t.ok(errors.length === 1 && errors[0].failed === 'required');
});


test('a property used only as namespace ignores required validation ', function(t) {
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

  var errors = kagawa.run({}, schema);
  t.ok(errors.length === 1 && errors[0].property === 'foo.bar')
});