'use strict';

var kagawa = require('../index');

var schema = {
  prop: {
    in: ['one', 'two', 'three']
  }
};
var obj = {
  prop: 'ones'
};

var errors = kagawa.run(obj, schema);

console.log(errors);