'use strict';

var test = require('tap').test;
var format = require('util').format;
var validator = require('../index').validator;
var validators = require('../lib/validators').validators;


test('min', function(t) {
  check({
    validator: 'min',
    args: [3],
    valid: [3, '3'],
    invalid: [2, '2']
  });
  t.end();
});


test('max', function(t) {
  check({
    validator: 'max',
    args: [3],
    valid: [3, '3'],
    invalid: [4, '4']
  });
  t.end();
});


test('maxLength', function(t) {
  check({
    validator: 'maxLength',
    args: [1],
    valid: 'x',
    invalid: 'xx'
  });
  t.end();
});


test('minLength', function(t) {
  check({
    validator: 'minLength',
    args: [1],
    valid: 'x',
    invalid: ''
  });
  t.end();
});


test('ukPostcode', function(t) {
  check({
    validator: 'ukPostcode',
    valid: [
      'W12 7QH',
      'W127QH',
      'w12 7qh',
      'D9 4LL',
      'SW19 9PL'
    ],
    invalid: [
      '123 456',
      'SW19',
      '01234 56789 01234 56789'
    ]
  });
  t.end();
});


test('minItems', function(t) {
  check({
    validator: 'minItems',
    args: [3],
    valid: [[1, 2, 3]],
    invalid: [[1, 2]]
  });
  t.end();
});


test('maxItems', function(t) {
  check({
    validator: 'maxItems',
    args: [3],
    valid: [[1, 2, 3]],
    invalid: [[1, 2, 3, 4]]
  });
  t.end();
});


test('ukTelephone', function(t) {
  check({
    validator: 'ukTelephone',
    valid: [
      '01234 567890',
      '(01234) 567890',
      '0800-444-3999',
      '+44 1234 56789'
    ],
    invalid: [
      '01234 x56789',
      '0123 5678',
      '01234 56789 01234 56789'
    ]
  });
  t.end();
});


test('uniqueItems', function(t) {
  check({
    validator: 'uniqueItems',
    valid: [
      [0, '0'],
      [0, 1, 2],
      ['0', '1', '2'],
      [{foo: 'bar'}, {foo: 'barr'}],
      [{foo: { foo: 'bar'}}, {foo: {foo: 'barr'}}]
    ],
    invalid: [
      [0, 1, 1],
      ['0', '1', '1'],
      [{foo: 'bar'}, {foo: 'bar'}],
      [{foo: { foo: 'bar'}}, {foo: {foo: 'bar'}}]
    ]
  });
  t.end();
});


function check(options) {
  var args = options.args || [];
  if (options.valid) {
    [].concat(options.valid).forEach(function (valid) {
      if (!validators[options.validator].apply(validator, [valid].concat(args))) {
        var warning = format(
          'validator.%s(%s) failed but should have passed',
          options.validator, args.join(', ')
        );
        throw new Error(warning);
      }
    });
  }
  if (options.invalid) {
    [].concat(options.invalid).forEach(function (invalid) {
      if (validators[options.validator].apply(validator, [invalid].concat(args))) {
        var warning = format(
          'validator.%s(%s) passed but should have failed',
          options.validator, args.join(', ')
        );
        throw new Error(warning);
      }
    });
  }
}