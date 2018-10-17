const assert = require('assert')
const fixture = require('./fixtures/tx-segwit-decoded')['P2WPKH-OFFICIAL-EX']
const {
  hashPrevouts,
  hashSequenceRaw,
  hashSequence,
  serializeOutputs,
  hashOutputs,
  serializeWitnessV0
} = require('../src/segwit-utils')

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
  describe.skip('serializeWitnessV0', function () {
    it('should calc hash of sequence of all inputs', function () {
      const res = serializeWitnessV0({})(txConfig.vin[1])(txConfig)
      assert.ok(res.toString('hex'))
      assert.equal(res.toString('hex'), fixture.items.witnessV0)
    })
  })
})
