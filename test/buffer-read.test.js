const Buffer = require('safe-buffer').Buffer
const varuint = require('varuint-bitcoin')
const assert = require('assert')

const {
  readSlice,
  readInt32,
  readUInt32,
  readUInt64,
  readVarInt,
  readVarSlice
} = require('../src/buffer-read')

describe('buffer-read utils', function () {
  describe('readSlice', function () {
    const buffer = Buffer.from('aabbcc', 'hex')
    const [res, bufferLeft] = readSlice(2)(buffer)
    it('should read a slice', function () {
      assert.equal(res.toString('hex'), 'aabb')
    })
    it('should return a reduced buffer', function () {
      assert.equal(bufferLeft.toString('hex'), 'cc')
    })
  })
  describe('readInt32', function () {
    const buffer = Buffer.from('02000000', 'hex')
    const [res, bufferLeft] = readInt32(buffer)
    it('should read a number', function () {
      assert.equal(res, 2)
    })
    it('should return a reduced buffer (empty)', function () {
      assert.equal(bufferLeft.toString('hex'), '')
    })
  })
  describe('readUInt32', function () {
    const buffer = Buffer.from('02000000aa', 'hex')
    const [res, bufferLeft] = readUInt32(buffer)
    it('should read an unsigned integer', function () {
      assert.equal(res, 2)
    })
    it('should return a reduced buffer (aa)', function () {
      assert.equal(bufferLeft.toString('hex'), 'aa')
    })
  })
  describe('readUInt64', function () {
    const buffer = Buffer.from('0200000001000000bb', 'hex')
    const [res, bufferLeft] = readUInt64(buffer)
    it('should read an unsigned integer', function () {
      assert.equal(res, 2 + (256 * 256 * 256 * 256))
    })
    it('should return a reduced buffer (bb)', function () {
      assert.equal(bufferLeft.toString('hex'), 'bb')
    })
  })
  describe('readVarInt', function () {
    const buffer = Buffer.alloc(3)
    varuint.encode(105, buffer, 0)
    const [res, bufferLeft] = readVarInt(buffer)
    it('should read a varint', function () {
      assert.equal(res, 105)
    })
    it('should return a reduced buffer (0000)', function () {
      assert.equal(bufferLeft.toString('hex'), '0000')
    })
  })
  describe('readVarSlice', function () {
    const buffer = Buffer.alloc(12)
    varuint.encode(5, buffer, 0)
    const [res, bufferLeft] = readVarSlice(buffer)
    it('should read a buffer of 5 bytes', function () {
      assert.equal(res.length, 5)
    })
    it('should return a reduced buffer of 7 bytes', function () {
      assert.equal(bufferLeft.length, (12 - 1 - 5))
    })
  })
})
