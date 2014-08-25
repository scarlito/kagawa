'use strict';

var test   = require('tap').test;
var kagawa = require('../index.js');
var messages = kagawa.messages;


test('errors exist as an array of objects', function(t) {
  t.plan(1);

  var obj = { email: 'foobar.com'};
  var schema = {
    email: {
      type: 'email',
      message: 'Error!'
    }
  };

  var errors = kagawa.run(obj, schema);
  t.deepEqual(errors[0], {
    property: 'email',
    value: 'foobar.com',
    failed: 'type',
    message: 'Error!'
  });
});