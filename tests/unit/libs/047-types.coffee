CONFIG = require 'config'
__ = CONFIG.universalPath
_ = __.require 'builders', 'utils'
require 'should'

describe 'types utils', ->
  describe 'typeOf', ->
    it 'should return the right type', (done)->
      _.typeOf('hello').should.equal 'string'
      _.typeOf([ 'hello' ]).should.equal 'array'
      _.typeOf({ hel:'lo' }).should.equal 'object'
      _.typeOf(83110).should.equal 'number'
      _.typeOf(null).should.equal 'null'
      _.typeOf().should.equal 'undefined'
      _.typeOf(false).should.equal 'boolean'
      _.typeOf(Number('boudu')).should.equal 'NaN'
      done()

  describe 'assertType', ->
    describe 'string', ->
      it 'should throw on false string', (done)->
        (-> _.assertType([ 'im an array' ], 'string')).should.throw()
        (-> _.assertType(1252154125123, 'string')).should.throw()
        (-> _.assertType({ whoami: 'im an object' }, 'string')).should.throw()
        done()

      it 'should not throw on true string', (done)->
        (-> _.assertType('im am a string', 'string')).should.not.throw()
        done()

    describe 'number', ->
      it 'should throw on false number', (done)->
        (-> _.assertType([ 'im an array' ], 'number')).should.throw()
        (-> _.assertType('im am a string', 'number')).should.throw()
        (-> _.assertType( { whoami: 'im an object' }, 'number')).should.throw()
        done()

      it 'should not throw on true number', (done)->
        (-> _.assertType(1252154125123, 'number')).should.not.throw()
        done()

    describe 'array', ->
      it 'should throw on false array', (done)->
        (-> _.assertType('im am a string', 'array')).should.throw()
        (-> _.assertType(1252154125123, 'array')).should.throw()
        (-> _.assertType( { whoami: 'im an object' }, 'array')).should.throw()
        done()

      it 'should not throw on true array', (done)->
        (-> _.assertType(['im an array'], 'array')).should.not.throw()
        done()

    describe 'object', ->
      it 'should throw on false object', (done)->
        (-> _.assertType('im am a string', 'object')).should.throw()
        (-> _.assertType(1252154125123, 'object')).should.throw()
        (-> _.assertType(['im an array'], 'object')).should.throw()
        done()

      it 'should not throw on true object', (done)->
        (-> _.assertType({ whoami: 'im an object' }, 'object')).should.not.throw()
        done()

    describe 'null', ->
      it 'should throw on false null', (done)->
        (-> _.assertType('im am a string', 'null')).should.throw()
        done()

      it 'should not throw on true null', (done)->
        array = []
        (-> _.assertType(null, 'null')).should.not.throw()
        done()

    describe 'undefined', ->
      it 'should throw on false undefined', (done)->
        (-> _.assertType('im am a string', 'undefined')).should.throw()
        done()

      it 'should not throw on true undefined', (done)->
        array = []
        (-> _.assertType(undefined, 'undefined')).should.not.throw()
        done()

    describe 'general', ->
      it 'should return the passed object', (done)->
        array = [ 'im an array' ]
        _.assertType(array, 'array').should.equal array
        obj = { 'im': 'an array' }
        _.assertType(obj, 'object').should.equal obj
        done()

      it 'should accept piped types', (done)->
        (-> _.assertType(1252154, 'number|null')).should.not.throw()
        (-> _.assertType(null, 'number|null')).should.not.throw()
        (-> _.assertType('what?', 'number|null')).should.throw()
        (-> _.assertType('what?', 'string|null')).should.not.throw()
        done()

      it 'should throw when none of the piped types is true', (done)->
        (-> _.assertType('what?', 'number|null')).should.throw()
        (-> _.assertType(123, 'array|string')).should.throw()
        done()

  describe 'assertTypes', ->
    it 'should handle multi arguments type', (done)->
      obj = { whoami: 'im an object' }
      (-> _.assertTypes([ obj ], [ 'object' ])).should.not.throw()
      (-> _.assertTypes([ obj, 2, 125 ], [ 'object', 'number', 'number' ])).should.not.throw()
      done()

    it 'should throw when an argument is of the wrong type', (done)->
      obj = { whoami: 'im an object' }
      args = [ obj, 1, 2, 125 ]
      (-> _.assertTypes(args, [ 'object', 'number', 'string', 'number' ])).should.throw()
      (-> _.assertTypes([ obj, 1, 'hello', 125], ['object', 'array', 'string', 'number'])).should.throw()
      done()

    it 'should throw when not enough arguments are passed', (done)->
      args = [ 'bla', 1 ]
      types = [ 'string', 'number', 'array' ]
      (-> _.assertTypes(args, types)).should.throw()
      done()

    it 'should throw when too many arguments are passed', (done)->
      args = [ 'a', 'b', 'c' ]
      types = [ 'string', 'string' ]
      (-> _.assertTypes(args, types)).should.throw()
      done()

    it 'accepts a common type for all the args as a string', (done)->
      (-> _.assertTypes([], 'numbers...')).should.not.throw()
      (-> _.assertTypes([ 123 ], 'numbers...')).should.not.throw()
      (-> _.assertTypes([ 1, 2, 3, 41235115 ], 'numbers...')).should.not.throw()
      (-> _.assertTypes([ 1, 2, 3, 41235115, 'bobby'], 'numbers...')).should.throw()
      done()

    it "only accepts the 's...' interface", (done)->
      (-> _.assertTypes([ 1, 2, 3, 41235115 ], 'numbers')).should.throw()
      done()

    it "should accept piped 's...' types", (done)->
      (-> _.assertTypes([ 1, 2, 'yo', 41235115 ], 'strings...|numbers...')).should.not.throw()
      (-> _.assertTypes([ 1, 2, 'yo', [], 41235115 ], 'strings...|numbers...')).should.throw()
      done()

  describe 'forceArray', (done)->
    it 'should return an array for an array', (done)->
      a = _.forceArray [ 1, 2, 3, { zo: 'hello' }, null ]
      a.should.be.an.Array()
      a.length.should.equal 5
      done()

    it 'should return an array for a string', (done)->
      a = _.forceArray 'yolo'
      a.should.be.an.Array()
      a.length.should.equal 1
      done()

    it 'should return an array for a number', (done)->
      a = _.forceArray 125
      a.should.be.an.Array()
      a.length.should.equal 1
      b = _.forceArray -12612125
      b.should.be.an.Array()
      b.length.should.equal 1
      done()

    it 'should return an array for an object', (done)->
      a = _.forceArray { bon: 'jour' }
      a.should.be.an.Array()
      a.length.should.equal 1
      done()

    it 'should return an empty array for null', (done)->
      a = _.forceArray null
      a.should.be.an.Array()
      a.length.should.equal 0
      done()

    it 'should return an empty array for undefined', (done)->
      a = _.forceArray null
      a.should.be.an.Array()
      a.length.should.equal 0
      done()

    it 'should return an empty array for an empty input', (done)->
      a = _.forceArray()
      a.should.be.an.Array()
      a.length.should.equal 0
      done()

    it 'should return an empty array for an empty string', (done)->
      a = _.forceArray ''
      a.should.be.an.Array()
      a.length.should.equal 0
      done()