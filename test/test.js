require('./buffer-read.test')
require('./tx-decode.test')
require('./tx-build.test')
require('./pow.test')

const { decoder, builder, hashFromBuffer, signBuffer } = require('../index')
const assert = require('assert')
describe('Main export', function () {
  describe('hashFromBuffer', function () {
    it('should be a function', function () {
      assert.equal(typeof hashFromBuffer, 'function')
    })
  })
  describe('signBuffer', function () {
    it('should be a function', function () {
      assert.equal(typeof signBuffer, 'function')
    })
  })
  describe('decoder', function () {
    it('should be an object', function () {
      assert.equal(typeof decoder, 'object')
    })
    it('should contain main method `decodeTx`', function () {
      assert.equal(typeof decoder.decodeTx, 'function')
    })
  })
  describe('builder', function () {
    it('should be an object', function () {
      assert.equal(typeof builder, 'object')
    })
    it('should contain main method `decodeTx`', function () {
      assert.equal(typeof builder.buildTx, 'function')
    })
  })
})
