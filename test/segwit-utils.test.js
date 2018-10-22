const assert = require('assert')
const fixture = require('./fixtures/tx-segwit-decoded')['P2WPKH-OFFICIAL-EX']
const {
  hashPrevouts,
  hashSequenceRaw,
  hashSequence,
  serializeOutputs,
  hashOutputs,
  inputValue,
  scriptCode,
  serializeWitnessV0
} = require('../src/segwit-utils')
const { EMPTY_BUFFER } = require('../src/compose-build')

describe('segwit-utils', function () {
  const txConfig = fixture.tx
  describe('hashPrevouts', function () {
    it('should calc prevouts hash', function () {
      const res = hashPrevouts({})(txConfig.vin)
      assert.equal(res.toString('hex').length, 64)
      assert.equal(res.toString('hex'), fixture.items.hashPrevouts)
    })
  })

  describe('hashSequenceRaw', function () {
    it('should serialize sequence of all inputs', function () {
      const res = hashSequenceRaw(txConfig.vin)
      assert.equal(res.toString('hex'), fixture.items.hashSequenceRaw)
    })
  })

  describe('hashSequence', function () {
    it('should calc hash of sequence of all inputs', function () {
      const res = hashSequence({})(txConfig.vin)
      assert.equal(res.toString('hex').length, 64)
      assert.equal(res.toString('hex'), fixture.items.hashSequence)
    })
  })

  describe('serializeOutputs', function () {
    it('should serialize outputs (amounts and scriptPubKey)', function () {
      const res = serializeOutputs(txConfig.vout)
      assert.equal(res.toString('hex'), fixture.items.serializedOutputs)
    })
  })

  describe('hashOutputs', function () {
    it('should hash outputs (sha256 of serialized vouts)', function () {
      const res = hashOutputs({})(txConfig.vout)
      assert.equal(res.toString('hex'), fixture.items.hashOutputs)
    })
  })

  describe('scriptCode', function () {
    it('should return scriptCode', function () {
      const res = scriptCode({})(txConfig.vin[1])
      assert.equal(res.toString('hex'), fixture.items.scriptCode)
    })
  })

  describe('inputValue', function () {
    it('should return buffer with input value', function () {
      const res = inputValue(txConfig.vin[1])
      assert.equal(res.toString('hex'), fixture.items.inputValue)
    })
  })

  describe('serializeWitnessV0', function () {
    it('should calc hash of sequence of all inputs', function () {
      const res = serializeWitnessV0({})(txConfig.vin[1])(txConfig, EMPTY_BUFFER)
      assert.equal(res.toString('hex'), fixture.items.hashPreimage)
    })
    // 01000000
    // 96b827c8483d4e9b96712b6713a7b68d6e8003a781feba36c31143470b4efd37
    // 52b0a642eea2fb7ae638c36f6252b6750293dbe574a806984b8e4d8548339a3b
    // ef51e1b804cc89d182d279655c3aa89e815b1b309fe287d9b2b55d57b90ec68a01000000

    // 00141d0f172a0ecb48aee1be1f2687d2963ae33f71a1
    // 0600000000000000

    // ffffffff
    // 863ef3e1a92afbfdb97f31ad0fc7683ee943e9abcf2501590ff8f6551f47e5e5
    // 11000000
    // 01000000
  })
})
