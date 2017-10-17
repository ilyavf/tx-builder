require('./buffer-read.test')
require('./tx-decode.test')
require('./tx-build.test')

const { hashFromBuffer, decoder, builder } = require('../index')
const assert = require('assert')
describe('Main export', function () {
  describe('hashFromBuffer', function () {
    it('should be a function', function () {
      assert.equal(typeof hashFromBuffer, 'function')
    })
  })
  describe('decoder', function () {
    it('should be an object', function () {
      assert.equal(typeof decoder, 'object')
    })
    it('should contein main method `decodeTx`', function () {
      assert.equal(typeof decoder.decodeTx, 'function')
    })
  })
  describe('builder', function () {
    it('should be an object', function () {
      assert.equal(typeof builder, 'object')
    })
    it('should contein main method `decodeTx`', function () {
      assert.equal(typeof builder.buildTx, 'function')
    })
  })
})
