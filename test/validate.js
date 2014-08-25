'use strict';

var test   = require('tap').test;
var kagawa = require('../index.js');


test('a validate function is run after regular validations', function(t) {
  t.plan(2);

  var errors;
  var obj = {};
  var schema = {
    prop: {
      type: 'email',
      validate: function(){ return false; }
    }
  };

  obj.prop = 'foo';
  errors = kagawa.run(obj, schema);
  t.ok(errors.length === 1 && errors[0].failed === 'type'
   , 'validate ignored when regular validation fails');

  obj.prop = 'foo@bar.com';
  errors = kagawa.run(obj, schema);
  t.ok(errors.length === 1 && errors[0].failed === 'validate'
    , 'validate function called when regular validation passes');
});


test('a synchronous function returns a boolean value according to its validity', function(t) {
  t.plan(2);

  var errors;
  var schema = {
    prop: {}
  };

  schema.prop.validate = function(){ return false; };
  errors = kagawa.run({prop: ''}, schema);
  t.ok(errors.length === 1, 'errors added');

  schema.prop.validate = function() { return true; };
  errors = kagawa.run({prop: ''}, schema);
  t.ok(!errors.length, 'no errors added');
});


test('an asynchronous function passes its validity to a callback', function(t) {
  t.plan(2);

  var errors;
  var schema = {
    prop: {}
  };

  schema.prop.validate = function(val, cb){ cb(null, false); };
  errors = kagawa.run({prop: ''}, schema);
  t.ok(errors.length === 1, 'errors added');

  schema.prop.validate = function(val, cb){ cb(null, true); };
  errors = kagawa.run({prop: ''}, schema);
  t.ok(!errors.length, 'no errors added');
});


test('a validate object accepts multiple functions', function(t) {
  t.plan(2);

  var called;
  var valid = function(val, cb){
    ++called;
    cb(null, true);
  };
  var schema = {
    prop: {
      validate: { a: valid, b: valid }
    }
  };

  called = 0;
  kagawa.run({prop: ''}, schema);
  t.ok(called === 2, 'all functions are called when valid');

  called = 0;
  schema.prop.validate.a = function(val, cb){
    ++called;
    cb(null, false);
  };
  kagawa.run({prop: 'foo'}, schema);
  t.ok(called === 1, 'validate is abandoned when previous function is invalid');
});


test('an error is thrown for an invalid configuration', function(t) {
  t.plan(2);

  var schema;
  schema = {
    prop: {
      validate: []
    }
  };
  try {
    kagawa.run({prop: ''}, schema);
  } catch(e) {
    t.ok(e, 'error thrown from single assignment');
  }

  schema = {
    prop: {
      validate: {
        a: {}
      }
    }
  };
  try {
    kagawa.run({prop: ''}, schema);
  } catch(e) {
    t.ok(e, 'error thrown for object assignment');
  }
});