'use strict'
const Buffer = require('safe-buffer').Buffer
const assert = require('assert')
const { readInt32 } = require('../src/buffer-utils')
const { decodeTx, readInput, readOutput } = require('../src/tx-decoder')
const fixture = require('./fixture')

describe('Decode hex', function () {
  const txHex = fixture.hex
  const buffer = Buffer.from(txHex, 'hex')

  describe('readInt32', function () {
    it('should read version', function () {
      const [ver, bufferLeft] = readInt32(buffer)
      assert.equal(ver, fixture.decoded.version)
      assert.ok(bufferLeft)
    })
  })

  describe('readInput', function () {
    const offsetVersionAndVinLength = 4 + 1
    const [input, bufferLeft] = readInput(buffer.slice( offsetVersionAndVinLength ))
    it('should read hash', function () {
      assert.equal(input.hash.toString('hex'), fixture.decoded.vin[0].hash)
    })
    it('should read index', function () {
      assert.equal(input.index, fixture.decoded.vin[0].index)
    })
    it('should read script', function () {
      assert.equal(input.script.toString('hex'), fixture.decoded.vin[0].script)
    })
    it('should read sequence', function () {
      assert.equal(input.sequence, fixture.decoded.vin[0].sequence)
    })
    it('should leave some buffer', function () {
      assert.ok(bufferLeft)
    })
  })

  describe('readOutput', function () {
    const offsetVout = fixture.offsetVout1
    const [output, bufferLeft] = readOutput(buffer.slice( offsetVout ))
    it('should read value', function () {
      assert.equal(output.value, fixture.decoded.vout[0].value)
    })
    it('should read script', function () {
      assert.equal(output.script.toString('hex'), fixture.decoded.vout[0].script)
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
      // console.log(decoded)
      // console.log(decoded[0].vin)
      assert.ok(decoded)
    })
  })
})
