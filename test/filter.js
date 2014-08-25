'use strict';

var test   = require('tap').test;
var kagawa = require('../index.js');


test('it removes values from a source array', function(t) {
  t.plan(1);

  var schema = {
    prop: {
      filter: function(val) {
        return val % 2 > 0;
      }
    }
  };
  var obj = { prop: [1, 2, 3, 4] };

  kagawa.run(obj, schema);
  t.deepEqual(obj.prop, [1, 3]);
});


test('it transforms a non-array value', function(t) {
  t.plan(1);

  var schema = {
    prop: {
      filter: function(val) {
        return val + ' world';
      }
    }
  };
  var obj = { prop: 'hello' };

  kagawa.run(obj, schema);
  t.equal(obj.prop, 'hello world');
});


test('it is performed before validation', function(t) {
  t.plan(1);

  var schema = {
    prop: {
      type: 'email',
      filter: function(val) {
        return val + ' world';
      }
    }
  };
  var obj = { prop: 'hello' };
  var errors = kagawa.run(obj, schema);

  t.ok(errors[0].value === 'hello world');
});


test('it throws an error for a non-function', function(t) {
  t.plan(1);

  var schema = {
    prop: {
      filter: true
    }
  };

  try {
    kagawa.run({prop: ''}, schema);
  } catch(e) {
    t.ok(e);
  }
});