const assert = require('assert')
const typeforce = require('typeforce')
const types = require('../src/types')

describe('types', function () {
  describe('Address', function () {
    it('should validate a good address', function () {
      const addr = 'mm2zdwmiVBR7ipNiN3tr4CCu6sS5tFwKna'
      assert.ok(typeforce(types.Address, addr))
    })
    it('should invalidate an incorrect address', function () {
      const addr = '123'
      try {
        typeforce(types.Address, addr)
        assert.ok(false, 'should reject instead')
      } catch (err) {
        assert.equal(err.message, 'Expected Address, got String "123"')
      }
    })
    it('should validate bech32 address', function () {
      const addr = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx'
      assert.ok(typeforce(types.Address, addr))
    })
    it('should invalidate bad bech32 address', function () {
      const addr = 'tb1222qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx'
      try {
        typeforce(types.Address, addr)
        assert.ok(false, 'should reject instead')
      } catch (err) {
        assert.equal(err.message, 'Expected Address, got String "tb1222qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"')
      }
    })
  })
  describe('FunctionType', function () {
    it('should validate a function', function () {
      const func = function () {}
      assert.ok(typeforce(types.FunctionType, func))
    })
    it('should invalidate a non-function', function () {
      const func = '123'
      try {
        typeforce(types.FunctionType, func)
        assert.ok(false, 'should reject instead')
      } catch (err) {
        assert.equal(err.message, 'Expected FunctionType, got String "123"')
      }
    })
  })
  describe('TxVin', function () {
    it('should validate vin', function () {
      const vin = {
        txid: 'a3661cde89a5690f8aaffce8fb4371f78dda08b1f44b886798bb928d9e348aa5',
        vout: 1
      }
      assert.ok(typeforce(types.TxVin, vin))
    })
    it('should invalidate incorrect vin', function () {
      const vin = {vout: 1}
      try {
        typeforce(types.TxVin, vin)
        assert.ok(false, 'should reject instead')
      } catch (err) {
        assert.equal(err.message, 'Expected property "txid" of type String, got undefined')
      }
    })
  })
})
