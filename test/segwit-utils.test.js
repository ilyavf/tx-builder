const assert = require('assert')
const fixture = require('./fixtures/tx-segwit-decoded')['P2WPKH-OFFICIAL-EX']
const {
  hashPrevouts,
  hashSequenceRaw,
  hashSequence,
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

  describe('serializeWitnessV0', function () {
    it('should calc hash of sequence of all inputs', function () {
      const res = serializeWitnessV0({})(txConfig.vin)(txConfig)
      assert.ok(res.toString('hex'))
      assert.equal(res.toString('hex'), fixture.items.witnessV0)
    })
  })
})
