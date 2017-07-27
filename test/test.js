'use strict'
const Buffer = require('safe-buffer').Buffer
const assert = require('assert')
const { readInt32 } = require('../src/buffer-utils')
const { decodeTx, readInput } = require('../src/tx-decoder')
const fixture = require('./fixture')

describe('Decode hex', function () {
  const txHex = fixture.hex
  const buffer = Buffer.from(txHex, 'hex')

  describe('readInt32', function () {
    it('should read version', function () {
      const [ver, bufferLeft] = readInt32(buffer)
      assert.equal(ver, 1)
      assert.ok(bufferLeft)
    })
  })

  describe('readInput', function () {
    const offsetVersionAndVinLength = 4 + 1
    const [input, bufferLeft] = readInput(buffer.slice( offsetVersionAndVinLength ))
    it('should read hash', function () {
      assert.equal(input.hash.toString('hex'), fixture.decoded.hash)
    })
    it('should read index', function () {
      assert.equal(input.index, 1)
    })
    it('should read script', function () {
      assert.equal(input.script.toString('hex'), fixture.decoded.script)
    })
    it('should read sequence', function () {
      assert.equal(input.sequence, fixture.decoded.sequence)
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
