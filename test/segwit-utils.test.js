const assert = require('assert')
const fixture = require('./fixtures/tx-segwit-decoded')['P2WPKH-OFFICIAL-EX']
const {
  hashPrevouts,
  hashSequenceRaw,
  hashSequence
  // hashOutputs
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
})
