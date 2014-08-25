'use strict';

var _ = require('lodash');
var validator = require('validator');

var types = {
  array:        _.isArray,
  boolean:      _.isBoolean,
  date:         _.isDate,
  number:       _.isNumber,
  object:       _.isPlainObject,
  regex:        _.isRegExp,
  string:       _.isString,
  alpha:        validator.isAlpha,
  alphanumeric: validator.isAlphanumeric,
  creditcard:   validator.isCreditCard,
  email:        validator.isEmail,
  float:        validator.isFloat,
  integer:      validator.isInt,
  hexadecimal:  validator.hexadecimal,
  hexColor:     validator.isHexColor,
  ip:           validator.isIP,
  ipv4:         validator.isIPv4,
  ipv6:         validator.isIPv6,
  numeric:      validator.isNumeric,
  ukPostcode:   function(str) { return /^(([gG][iI][rR] {0,}0[aA]{2})|((([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y]?[0-9][0-9]?)|(([a-pr-uwyzA-PR-UWYZ][0-9][a-hjkstuwA-HJKSTUW])|([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y][0-9][abehmnprv-yABEHMNPRV-Y]))) {0,}[0-9][abd-hjlnp-uw-zABD-HJLNP-UW-Z]{2}))$/.test(str); },
  ukTelephone:  function(str) { return /^\(?(?:(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?\(?(?:0\)?[\s-]?\(?)?|0)(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}|\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4}|\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3})|\d{5}\)?[\s-]?\d{4,5}|8(?:00[\s-]?11[\s-]?11|45[\s-]?46[\s-]?4\d))(?:(?:[\s-]?(?:x|ext\.?\s?|\#)\d+)?)$/.test(str); },
  url:          validator.isURL,
  uuid:         validator.isUUID
};


var other = {
  after:        validator.isAfter,
  before:       validator.isBefore,
  divisibleBy:  validator.divisibleBy,
  in:           validator.isIn,
  min:          min,
  minItems:     function(arr, min) { return arr.length >= min; },
  minLength:    function(str, min) { return validator.isLength(str, min); },
  maxLength:    function(str, max) { return validator.isLength(str, 0, max); },
  max:          max,
  maxItems:     function(arr, max) { return arr.length <= max; },
  uniqueItems:  arrayUnique,
  contains:     validator.contains,
  matches:      validator.matches
};
function arrayUnique(arr) {
  var vals = [];
  for(var i = 0; i < arr.length; ++i) {
    var val = JSON.stringify(arr[i]);
    if(_.indexOf(vals, val) !== -1)
      return false;
    else vals.push(val);
  }
  return true;
}

function max(val, max) {
  var number = parseFloat(val);
  return isNaN(number) || number <= max;
}

function min(val, min) {
  var number = parseFloat(val);
  return isNaN(number) || number >= min;
}

module.exports.types = types;
module.exports.validators = _.assign(other, types);