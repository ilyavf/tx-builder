'use strict'
const Buffer = require('safe-buffer').Buffer
const assert = require('assert')
const { decodeTx, readHash, readInput, readOutput, readInputs, getTxId, createHash } = require('../src/tx-decoder')
const fixture = require('./fixtures/tx-hex-decoded')

describe('decoder', function () {
  const txHex = fixture.hex
  const buffer = Buffer.from(txHex, 'hex')

  describe('readHash', function () {
    const offset = 4 + 1
    const [txid, bufferLeft] = readHash(buffer.slice(offset))
    it('should read tx hash from buffer and reverse it', function () {
      assert.equal(txid, fixture.decoded.vin[0].txid)
      assert.ok(bufferLeft.length < buffer.length)
    })
  })

  describe('readInput', function () {
    const offsetVersionAndVinLength = 4 + 1
    const [input, bufferLeft] = readInput(buffer.slice(offsetVersionAndVinLength))
    it('should read txid', function () {
      assert.equal(input.txid.toString('hex'), fixture.decoded.vin[0].txid)
    })
    it('should read vout index', function () {
      assert.equal(input.vout, fixture.decoded.vin[0].vout)
    })
    it('should read scriptSig', function () {
      assert.equal(input.scriptSig.hex, fixture.decoded.vin[0].scriptSig.hex)
    })
    it('should read sequence', function () {
      assert.equal(input.sequence, fixture.decoded.vin[0].sequence)
    })
    it('should leave some buffer', function () {
      assert.ok(bufferLeft)
      assert.ok(bufferLeft.length < buffer.length)
    })
  })

  describe('readOutput', function () {
    const offsetVout = fixture.offsetVout1
    const [output, bufferLeft] = readOutput(buffer.slice(offsetVout))
    it('should read value', function () {
      assert.equal(output.value, fixture.decoded.vout[0].value)
    })
    it('should read scriptPubKey', function () {
      assert.equal(output.scriptPubKey.hex, fixture.decoded.vout[0].scriptPubKey.hex)
    })
    it('should leave some buffer', function () {
      assert.ok(bufferLeft)
      assert.ok(bufferLeft.length < buffer.length)
    })
  })

  describe('readInputs', function () {
    const offsetVin = 4
    const [inputs, bufferLeft] = readInputs(readInput)(buffer.slice(offsetVin))
    it('should read inputs length', function () {
      assert.equal(inputs.length, fixture.decoded.vin.length)
    })
    it('should read input sequence', function () {
      assert.equal(inputs[0].sequence, fixture.decoded.vin[0].sequence)
    })
    it('should leave some buffer', function () {
      assert.ok(bufferLeft)
    })
  })

  describe('readOutputs', function () {
    const offsetVin = 152
    const [outputs, bufferLeft] = readInputs(readOutput)(buffer.slice(offsetVin))
    it('should read outputs length', function () {
      assert.equal(outputs.length, fixture.decoded.vout.length)
    })
    it('should read vout-1 value', function () {
      assert.equal(outputs[0].value, fixture.decoded.vout[0].value)
    })
    it('should read vout-1 script', function () {
      assert.equal(outputs[0].scriptPubKey.hex, fixture.decoded.vout[0].scriptPubKey.hex)
    })
    it('should read vout-2 value', function () {
      assert.equal(outputs[1].value, fixture.decoded.vout[1].value)
    })
    it('should read vout-2 script', function () {
      assert.equal(outputs[1].scriptPubKey.hex, fixture.decoded.vout[1].scriptPubKey.hex)
    })
    it('should leave some buffer', function () {
      assert.ok(bufferLeft)
    })
  })

  describe('decodeTx', function () {
    it('should decode tx', function () {
      let decoded
      try {
        decoded = decodeTx(buffer)
      } catch (e) {
        console.log(e)
      }
      assert.equal(decoded[0].vin[0].sequence, fixture.decoded.vin[0].sequence)
      assert.equal(decoded[0].vout[1].scriptPubKey.toString('hex'), fixture.decoded.vout[1].scriptPubKey)
    })
  })

  describe('getTxId', function () {
    it('should get txid', function () {
      const txBuffer = Buffer.from(fixture.hex, 'hex')
      assert.equal(getTxId({})(txBuffer), fixture.decoded.txid)
    })
  })

  describe('createHash', function () {
    it('should create a hash for buffer data', function () {
      const buffer = Buffer.from('010203', 'hex')
      assert.equal(createHash({})(buffer).toString('hex'), '19c6197e2140b9d034fb20b9ac7bb753a41233caf1e1dafda7316a99cef41416')
    })
  })
})
