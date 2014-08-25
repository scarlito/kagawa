'use strict';

var kagawa = require('../index');
var schema = {
  email: {
    type: 'array',
    minItems: 3,
    each: { type: 'email' },
    filter: function(val) {
      return val !== '';
    }
  }
};
var data = {
  email: [
    '',
    'bar@foo.com',
    'foo@bar.com'
  ]
};

var errors = kagawa.run(data, schema);

console.log(errors);