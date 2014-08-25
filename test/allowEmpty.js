'use strict';

var test   = require('tap').test;
var kagawa = require('../index.js');


test('it determines whether empty strings pass a type check', function(t) {
  t.plan(2);

  var errors, schema;
  schema = {
    prop: {
      type: 'string',
      allowEmpty: false
    }
  };

  errors = kagawa.run({prop: ''}, schema);
  t.ok(errors.length === 1
    , 'empty string not permitted');

  schema = {
    prop: {
      type: 'email',
      allowEmpty: true
    }
  };

  errors = kagawa.run({prop: ''}, schema);
  t.ok(!errors.length
    , 'empty string permitted');
});


test('it is false by default', function(t) {
  t.plan(1);

  var schema = {
    prop: {
      type: 'string'
    }
  };
  var errors = kagawa.run({prop: ''}, schema);
  t.ok(errors.length === 1 && errors[0].failed === 'allowEmpty');
});