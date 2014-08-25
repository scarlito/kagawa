'use strict';

var test   = require('tap').test;
var kagawa = require('../index.js');


test('runs only when its assigned property is valid', function(t) {
  t.plan(2);

  var errors;
  var schema = {
    foo: {
      type: 'email'
    },
    bar: {
      requireValid: 'foo',
      type: 'email'
    }
  };
  var obj = {
    foo: 'foobar.com',
    bar: 'bar'
  };

  errors = kagawa.run(obj, schema);
  t.ok(errors.length === 1 && errors[0].property === 'foo'
    , 'dependent property not validated');

  obj.foo = 'foo@bar.com';
  errors = kagawa.run(obj, schema);
  t.ok(errors.length === 1 && errors[0].property === 'bar'
    , 'dependent property validated');
});


test('accepts an array of validation properties', function(t) {
  t.plan(2);

  var errors;
  var schema = {
    foo: {
      type: 'email'
    },
    foobar: {
      type: 'email'
    },
    bar: {
      requireValid: ['foo', 'foobar'],
      type: 'email'
    }
  };
  var obj = {
    foo: 'foo@bar.com',
    foobar: 'foobar.com',
    bar: 'bar'
  };

  errors = kagawa.run(obj, schema);
  t.ok(errors.length === 1 && errors[0].property === 'foobar'
    , 'dependent property not validated unless all required properties are valid');

  obj.foobar = 'foo@bar.com';
  errors = kagawa.run(obj, schema);
  t.ok(errors.length === 1 && errors[0].property === 'bar'
    , 'dependent property validated when all required properties valid');
});


test('nested properties are supported', function(t) {
  t.plan(2);

  var errors;
  var schema = {
    foo: {
      properties: {
        bar: {
          type: 'email'
        }
      }
    },
    bar: {
      requireValid: 'foo.bar',
      type: 'email'
    }
  };
  var obj = {
    foo: {
      bar: 'foobar'
    }
  };

  errors = kagawa.run(obj, schema);
  t.ok(errors.length === 1 && errors[0].property === 'foo.bar'
    , 'dependent property not validated');

  obj.foo.bar = 'foo@bar.com';
  errors = kagawa.run(obj, schema);
  t.ok(errors.length === 1 && errors[0].property === 'bar'
    , 'dependent property validated');
});


test('array properties are supported', function(t) {
  t.plan(2);

  var errors;
  var schema = {
    foo: {
      each: {
        properties: {
          foo: {
            type: 'email'
          }
        }
      }
    },
    bar: {
      requireValid: 'foo.0.foo',
      type: 'email'
    }
  };
  var obj = {
    foo: [
      {foo: 'foobar'}
    ],
    bar: 'bar'
  };

  errors = kagawa.run(obj, schema);
  t.ok(errors.length === 1 && errors[0].property === 'foo.0.foo'
    , 'dependent property not validated');


  obj.foo[0].foo = 'foo@bar.com';
  errors = kagawa.run(obj, schema);
  t.ok(errors.length === 1 && errors[0].property === 'bar'
    , 'dependent property not validated');


  test('descendant properties are accepted using a $ prefix', function(t) {
    t.plan(2);

    var errors;
    var schema = {
      foo: {
        each: {
          properties: {
            foo: {
              type: 'email'
            },
            bar: {
              requireValid: 'foo.$index.foo',
              type: 'email'
            }
          }
        }
      }
    };
    var obj = {
      foo: [
        { foo: 'foobar.com', bar: 'bar'}
      ]
    };

    errors = kagawa.run(obj, schema);
    t.ok(errors.length === 1 && errors[0].property === 'foo.0.foo'
      , 'dependent property not validated');

    obj.foo[0].foo = 'foo@bar.com';
    errors = kagawa.run(obj, schema);
    t.ok(errors.length === 1 && errors[0].property === 'foo.0.bar'
      , 'dependent property validated');
  });
});


test('deep validity is respected', function(t) {
  t.plan(2);

  var errors;
  var schema = {
    foo: {
      each: {
        properties: {
          foo: {
            type: 'email'
          }
        }
      }
    },
    bar: {
      requireValid: 'foo',
      minLength: 10
    }
  };
  var obj = {
    foo: [
      { foo: 'foo' }
    ],
    bar: 'bar'
  };

  errors = kagawa.run(obj, schema);
  t.ok(errors.length === 1 && errors[0].property === 'foo.0.foo'
    , 'dependent property not validated');

  obj.foo[0].foo = 'foo@bar.com';
  errors = kagawa.run(obj, schema);
  t.ok(errors.length === 1 && errors[0].property === 'bar'
    , 'dependent property validated');
});