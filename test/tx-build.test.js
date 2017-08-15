const varuint = require('varuint-bitcoin')
const assert = require('assert')
const {
  bufferInt32,
  bufferUInt64,
  bufferVarInt,
  bufferVarSlice
} = require('../src/buffer-build')
const {
  buildTx,
  buildTxCopy,
  bufferInput,
  bufferOutput,
  bufferHash,
  bufferInputEmptyScript
} = require('../src/tx-builder')
const fixture = require('./fixture')
const fixtureNode = require('./fixtures/hdnode')

describe('buffer-write utils', function () {
  describe('bufferInt32', function () {
    const buffer = bufferInt32(25)
    it('should create a buffer with 32bit integer', function () {
      assert.equal(buffer.readInt32LE(0), 25)
    })
  })
  describe('bufferUInt32', function () {
    const buffer = bufferInt32(123)
    it('should create a buffer with unsigned 32bit integer', function () {
      assert.equal(buffer.readUInt32LE(0), 123)
    })
  })
  describe('bufferUInt64', function () {
    it('should create a buffer with unsigned 64bit integer', function () {
      const num = 456
      const buffer = bufferUInt64(num)
      const a = buffer.readUInt32LE(0)
      let b = buffer.readUInt32LE(4)
      b *= 0x100000000
      assert.equal(a + b, num)
    })
  })
  describe('bufferVarInt', function () {
    const num = 253
    const buffer = bufferVarInt(num)
    it('should create a buffer with varint', function () {
      const value = varuint.decode(buffer, 0)
      const length = varuint.decode.bytes
      assert.equal(value, num)
      assert.equal(length, 3)
    })
  })
  describe('bufferVarSlice', function () {
    const hex = '2d7a9f05'
    const buffer = bufferVarSlice(hex)
    it('should create a variable length buffer', function () {
      assert.equal(buffer.toString('hex'), '04' + hex)
    })
  })
})

describe('tx-build', function () {
  describe('bufferHash', function () {
    it('should create a buffer with hash', function () {
      const hash = '2d7a9f0534ddac231ef1978bda388791c32321f7e14e18e7df3bbed261615f54'
      assert.equal(bufferHash(hash).reverse().toString('hex'), hash)
    })
  })
  describe('bufferOutput', function () {
    it('should build vout-1', function () {
      const buffer = bufferOutput(fixture.tx.vout[0])
      assert.equal(buffer.toString('hex'), fixture.hexItems.vout1)
    })
  })
  describe('bufferInputEmptyScript', function () {
    it('should return buffer of vin with empty script', function () {
      const buffer = bufferInputEmptyScript(fixture.tx.vin[0])
      assert.equal(buffer.toString('hex'), fixture.hexItems.vin1emptyScript)
    })
  })
  describe('buildTxCopy', function () {
    it('should return buffer of tx copy for scriptSig', function () {
      const buffer = buildTxCopy(fixture.tx)
      assert.equal(buffer.toString('hex'), fixture.hexItems.txCopy)
    })
  })
  describe('bufferInput', function () {
    const keyPair = fixtureNode.keyPair
    it('should build vin', function () {
      const txVin = Object.assign({}, fixture.tx.vin[0], {
        keyPair
      })
      const buffer = bufferInput(fixture.tx)(txVin)
      assert.equal(buffer.toString('hex'), fixture.hexItems.vin)
    })
  })
  // describe('bufferInputs', function () {
  //   it('should process vins', function () {
  //     const buffer = bufferInputs('vin', {
  //       vin: []
  //     })
  //     assert.equal(buffer.toString('hex'), fixture.hexItems.vout1)
  //   })
  // })
  // describe('buildTx', function () {
  //   it('should build the whole transaction', function () {
  //     const buffer = buildTx(fixture.decoded)
  //     assert.equal(buffer.toString('hex'), fixture.hex)
  //   })
  // })
})
