'use strict';

var test   = require('tap').test;
var kagawa = require('../index.js');


test('property configuration is accepted for an array of primitives', function(t) {
  t.plan(1);

  var schema = {
    list: {
      each: {
        type: 'email'
      }
    }
  };
  var obj = {
    list: ['one', 'two', 'three']
  };

  var errors = kagawa.run(obj, schema);
  t.ok(errors.length === 2
    && errors[0].property === 'list.0'
    && errors[1].property === 'list.1');
});


test('schema can be passed for an array of objects', function(t) {
  t.plan(1);

  var schema = {
    list: {
      each: {
        properties: {
          foo: {
            type: 'email'
          }
        }
      }
    }
  };
  var obj = {
    list: [
      {foo: 'one'},
      {foo: 'two'}
    ]
  };

  var errors = kagawa.run(obj, schema);
  t.ok(errors.length === 2
    && errors[0].property === 'list.0.foo'
    && errors[1].property === 'list.1.foo');
});
