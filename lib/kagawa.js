'use strict';

var _ = require('lodash');
var types = require('./validators').types;
var validators = require('./validators').validators;
var messages = require('./messages');

var regex = /%\{([a-z]+)\}/ig;


function run(obj, schema, options, cb) {
  if(_.isFunction(options)) {
    cb = options;
    options = {};
  }
  options = options || {};
  if (!schema.properties) {
    schema = {properties: schema};
  }
  var kagz = new Kagawa(obj, schema, options);
  if (cb) {
    try {
      kagz.run(cb);
    } catch (err) {
      cb(err);
    }
  } else return kagz.runSync();
}


function Kagawa(obj, schema, options) {
  this.done = {};
  this.errors = [];
  this.pending = [];
  this.safe = options.safe || true;
  this.schema = schema;
  this.source = obj;
}


Kagawa.prototype.absolutePath = function(required, current) {
  var reqs = required.split('.');
  var curs = current.split('.');
  var route = [];
  var s = this.schema;

  while (reqs.length) {
    var req = reqs.shift();
    var cur = curs.shift();

    if (s.each && cur && req === '$index') {
      s = s.each;
      route.push(cur);
    } else {
      route.push(req);
      if (cur && req !== cur) {
        curs.length = 0;
      }
      if (s.each) {
        s = s.each;
      } else {
        s = s.properties || {};
        if (s[req] !== undefined) {
          s = s[req];
        } else return null;
      }
    }
  }
  var path = route.join('.');
  return _.hasDeepValue(this.source, path) ? path : null;
};


Kagawa.prototype.error = function(path, val, rule, schema) {
  var _messages = schema.messages || {};
  var msg;
  var msgRule = rule === 'required' && !_messages.required && schema.type ? schema.type : rule;

  if(types[msgRule] && _messages.type) {
    msg = _messages.type;
  } else if (_messages[msgRule]) {
    msg = _messages[msgRule];
  } else {
    msg = schema.message || messages[msgRule] || 'invalid input';
  }
  msg = msg.replace(regex, function () { return schema[rule]; });
  this.errors.push({
    property: path,
    value: val,
    failed: types[rule] ? 'type' : rule,
    message: msg
  });
};


Kagawa.prototype.resolveProperty = function(path) {
  var i = -1;

  while (++i < this.pending.length) {
    var item = this.pending[i];
    var req = item.required;
    var index = req.indexOf(path);

    if (index !== -1) {
      if (this.done[path] === true) {
        req.splice(index, 1);
        if (req.length === 0) {
          this.validateProperty(item.path, item.prop, item.obj, item.schema, item.callback);
          this.pending.splice(i, 1);
        }
      } else {
        item.callback();
        this.pending.splice(i, 1);
      }
    }
  }
};


Kagawa.prototype.run = function(cb) {
  var self = this;
  self.validateObject(null, self.source, self.schema, function () {
    cb(null, self.errors);
  });
};


Kagawa.prototype.runSync = function() {
  this.validateObject(null, this.source, this.schema);
  return this.errors;
};


Kagawa.prototype.validateObject = function (path, obj, schema, cb) {
  var self  = this;
  var props = schema.properties;
  var count = Object.keys(props).length;

  _.forOwn(props, function (s, prop) {
    var _path = path === null ? prop : [path, prop].join('.');
    if(!_.isPlainObject(s)) {
      configError(path);
    }
    if (s.requireValid) {
      var raw = [].concat(s.requireValid);
      var req = [];
      raw.forEach(function (route) {
        var path = self.absolutePath(route, _path);
        path && req.push(path);
      });
      if (req.length) {
        var match = _.intersection(_.keys(self.done), req);
        if (match.length !== req.length) {
          return pending.push({
            required: req,
            path: _path,
            prop: prop,
            obj: obj,
            schema: s,
            callback: callback
          });
        } else {
          for (var i in req) {
            if (self.done[req[i]] === false)
              return callback(false);
          }
        }
      } else return complete();
    }
    self.validateProperty(_path, prop, obj, s, callback);

    function callback(ok) {
      self.done[_path] = ok;
      self.resolveProperty(_path);
      complete(ok);
    }
  });

  function complete(ok) {
    count -= 1;
    count === 0 && cb && cb(ok);
  }
};


Kagawa.prototype.validateProperty = function(path, prop, obj, schema, cb) {
  var self = this;
  var valid = true;
  var deepValid = true;
  var waitingFor = 1;
  var namespace = !!schema.properties;
  var validations = _.keys(_.omit(schema, [
    'allowEmpty',
    'each',
    'filter',
    'message',
    'messages',
    'properties',
    'required',
    'requireValid',
    'type',
    'validate'
  ]));
  var val = obj[prop];

  if (namespace) {
    queueAsync(1);
    self.validateObject(path, val || {}, schema, complete);
  }

  if(val === undefined) {
    if(schema.required !== false && !namespace) {
      self.error(path, val, 'required', schema);
    }
    return complete(false);
  }

  if (schema.filter) {
    var fn = schema.filter;
    if (_.isFunction('function')) {
      configError(path, 'filter must be a function');
    }
    val = _.isArray(val) ? val.filter(fn) : fn(val);
    obj[prop] = val;
  }

  var type = val instanceof Array ? 'array' : typeof val;

  if (schema.type) {
    var t = schema.type;
    if (!_.has(types, t)) {
      configError(path, "'" + t + "' is not a recognised type");
    }
    if(type === 'string') {
      var ae = schema.allowEmpty || false;
      if (ae === false && val === '') {
        self.error(path, val, 'allowEmpty', schema);
      } else if (val !== '') {
        validations.unshift(t);
      }
    } else validations.unshift(t);
  }

  while (validations.length) {
    var rule = validations.shift();
    if (!_.has(validators, rule)) {
      configError(path, "validator '" + rule + "' is not recognised");
    }
    var args = schema[rule];
    if(args !== undefined && !_.isRegExp(args)) {
      var str = JSON.stringify(args);

      str = str.replace(regex, function (a, v) {
        return _.getDeepValue(self.source, v);
      });
      args = JSON.parse(str);
    }
    try {
      valid = validators[rule].apply(null, [val].concat(args !== undefined ? args : []));
    } catch (e) {
      valid = false;
    }
    if (!valid) {
      self.error(path, val, rule, schema);
      return complete(valid);
    }
  }

  if (schema.validate) {
    queueAsync(1);
    var v = schema.validate;
    if (!_.isPlainObject(v)) {
      v = { validate: v };
    }
    var stack = _.keys(v);
    (function next() {
      var rule = stack.shift();
      if (!rule || !valid) {
        return complete(valid);
      }
      var fn = v[rule];
      if (!_.isFunction(fn)) {
        configError(path, rule + ' must be a function');
      }
      if (fn.length > 1) {
        fn(val, function (err, ok) {
          if (err) throw err;
          valid = ok;
          !valid && self.error(path, val, rule, schema);
          next();
        });
      } else {
        valid = fn(val);
        !valid && self.error(path, val, rule, schema);
        next();
      }
    })();
  }

  if (schema.each) {
    var count = val.length;
    var e = schema.each;
    queueAsync(count);
    for (var i = 0; i < count; ++i) {
      var _path = [path, i].join('.');
      if (e.properties) {
        self.validateObject(_path, val[i], e, complete);
      } else {
        self.validateProperty(_path, i, val, e, complete);
      }
    }
  }

  function complete(ok) {
    if (!ok) deepValid = false;
    waitingFor -= 1;
    waitingFor === 0 && cb(deepValid);
  }

  function queueAsync(count) {
    waitingFor += count;
  }

  complete(true);
};


function configError(path, message) {
  var msg = 'Configuration error for \'' + path + '\'';
  if(message) {
    msg += ': ' + message;
  }
  throw new Error(msg);
}

_.mixin({
  getDeepValue: function getDeepValue(obj, path) {
    if(!_.hasDeepValue(obj, path)) {
      return undefined;
    } else {
      var props = path.split('.');
      return _.reduce(props, function(obj, prop){
        return obj[prop];
      }, obj);
    }
  },
  hasDeepValue: function hasDeepValue(obj, path) {
    var props = path.split('.');

    while (props.length) {
      var prop = props.shift();
      if (obj[prop] && obj[prop] !== undefined) {
        obj = obj[prop];
      } else return false;
    }
    return true;
  }
});

module.exports.run = run;
module.exports.messages = messages;