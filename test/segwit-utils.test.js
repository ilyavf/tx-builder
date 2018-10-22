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
  serializeWitnessV0,
  hashForWitnessV0
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
  })

  describe('hashForWitnessV0', function () {
    it('should hash WitnessV0', function () {
      const res = hashForWitnessV0({})(txConfig.vin[1])(txConfig, EMPTY_BUFFER)
      assert.equal(res.toString('hex'), fixture.items.sigHash)
    })
  })
})
