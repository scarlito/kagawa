'use strict';

var test   = require('tap').test;
var kagawa = require('../index.js');


test('the type validation is run prior to any other', function(t) {
  t.plan(1);

  var schema = {
    prop: {
      minLength: 10,
      type: 'email'
    }
  };

  var errors = kagawa.run({prop: 'foobar.com'}, schema);
  t.ok(errors.length === 1 && errors[0].failed === 'type');
});