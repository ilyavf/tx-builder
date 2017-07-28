'use strict'
const Buffer = require('safe-buffer').Buffer
const assert = require('assert')
const { decodeTx, readInput, readOutput, readInputs } = require('../src/tx-decoder')
const fixture = require('./fixture')

describe('Decode hex', function () {
  const txHex = fixture.hex
  const buffer = Buffer.from(txHex, 'hex')

  describe('readInput', function () {
    const offsetVersionAndVinLength = 4 + 1
    const [input, bufferLeft] = readInput(buffer.slice(offsetVersionAndVinLength))
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
      assert.ok(bufferLeft.length < buffer.length)
    })
  })

  describe('readOutput', function () {
    const offsetVout = fixture.offsetVout1
    const [output, bufferLeft] = readOutput(buffer.slice(offsetVout))
    it('should read value', function () {
      assert.equal(output.value, fixture.decoded.vout[0].value)
    })
    it('should read script', function () {
      assert.equal(output.script.toString('hex'), fixture.decoded.vout[0].script)
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
    const offsetVin = 153
    const [outputs, bufferLeft] = readInputs(readOutput)(buffer.slice(offsetVin))
    it('should read outputs length', function () {
      assert.equal(outputs.length, fixture.decoded.vout.length)
    })
    it('should read vout-1 value', function () {
      assert.equal(outputs[0].value, fixture.decoded.vout[0].value)
    })
    it('should read vout-1 script', function () {
      assert.equal(outputs[0].script.toString('hex'), fixture.decoded.vout[0].script)
    })
    it('should read vout-2 value', function () {
      assert.equal(outputs[1].value, fixture.decoded.vout[1].value)
    })
    it('should read vout-2 script', function () {
      assert.equal(outputs[1].script.toString('hex'), fixture.decoded.vout[1].script)
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
      assert.equal(decoded[0].vout[1].script.toString('hex'), fixture.decoded.vout[1].script)
    })
  })
})
