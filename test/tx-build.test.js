const varuint = require('varuint-bitcoin')
const bitcoin = require('bitcoinjs-lib')
const assert = require('assert')
const {
  bufferInt32,
  bufferUInt64,
  bufferVarInt,
  bufferVarSlice,
  bufferVarSliceBuffer,
  mapConcatBuffers
} = require('../src/buffer-build')
const {
  buildTx,
  buildTxCopy,
  txCopyForHash,
  txCopySubscript,
  bufferInput,
  bufferInputs,
  bufferOutput,
  bufferHash,
  bufferInputEmptyScript,
  makeBufferOutput,
  vinScript,
  voutScript,
  buildCoinbaseTx,
  coinbaseInput,
  coinbaseScript
} = require('../src/tx-builder')
const { prop } = require('../src/compose-build')
const fixture = require('./fixtures/tx-hex-decoded')
const fixtureNode = require('./fixtures/hdnode')

describe('buffer-build utils', function () {
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
    it('should create a variable length buffer from hex', function () {
      const hex = '2d7a9f05'
      const buffer = bufferVarSlice('hex')(hex)
      assert.equal(buffer.toString('hex'), '04' + hex)
    })
    it('should create a variable length buffer from ascii', function () {
      const ascii = '{a:123}'
      const buffer = bufferVarSlice('ascii')(ascii)
      assert.equal(buffer.toString(), '\u0007' + ascii)
    })
  })
  describe('bufferVarSliceBuffer', function () {
    it('should create a variable length buffer from buffer value', function () {
      const hex = '2d7a9f05'
      const expectedBuffer = bufferVarSlice('hex')(hex)
      const bufferValue = Buffer.from(hex, 'hex')
      const buffer = bufferVarSliceBuffer(bufferValue)
      assert.equal(buffer.toString('hex'), expectedBuffer.toString('hex'))
    })
  })
  describe('mapConcatBuffers', function () {
    it('should concat buffers', function () {
      const fn = a => Buffer.from((a * 5) + '')
      const arr = [1, 2, 3]
      const expected = '033531303135'
      assert.equal(mapConcatBuffers(fn)(arr).toString('hex'), expected)
    })
  })
})

describe('builder', function () {
  describe('bufferHash', function () {
    it('should create a buffer with txid', function () {
      const txid = '2d7a9f0534ddac231ef1978bda388791c32321f7e14e18e7df3bbed261615f54'
      assert.equal(bufferHash(txid).reverse().toString('hex'), txid)
    })
  })
  describe('makeBufferOutput', function () {
    it('should make a bufferOutput function', function () {
      const bufferOutput = makeBufferOutput(
        prop('address', voutScript(bitcoin.networks.testnet))
      )
      const buffer = bufferOutput(fixture.tx.vout[0])
      assert.equal(buffer.toString('hex'), fixture.hexItems.vout1)
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
    it('should return buffer of vin with subscript', function () {
      const keyPair = fixtureNode.keyPair
      const subscript = txCopySubscript(keyPair)
      const vin = Object.assign({}, fixture.tx.vin[0], {script: subscript})
      const buffer = bufferInputEmptyScript(vin)
      assert.equal(buffer.toString('hex'), fixture.hexItems.vin1Subscript)
    })
  })
  describe('txCopySubscript', function () {
    it('should create a subscript for txCopy vin', function () {
      const keyPair = fixtureNode.keyPair
      const subscript = txCopySubscript(keyPair)
      assert.equal(subscript.toString('hex'), fixture.hexItems.txCopySubscript)
    })
  })
  describe('buildTxCopy', function () {
    it('should return buffer of tx copy for scriptSig', function () {
      const keyPair = fixtureNode.keyPair
      const subscript = txCopySubscript(keyPair)
      const txCopyWithScript = Object.assign({}, fixture.tx)
      txCopyWithScript.vin[0].script = subscript
      const buffer = buildTxCopy(txCopyWithScript)
      assert.equal(buffer.toString('hex'), fixture.hexItems.txCopyHex)
    })
  })
  describe('txCopyForHash', function () {
    const keyPair = fixtureNode.keyPair
    it('should prepare txCopy for hashing', function () {
      const txCopyBuffer = txCopyForHash(buildTxCopy)(keyPair, fixture.tx, 0)
      assert.equal(txCopyBuffer.toString('hex'), fixture.hexItems.txCopyForHash)
    })
  })
  describe('vinScript', function () {
    const keyPair = fixtureNode.keyPair
    it('should create vin script', function () {
      const script = vinScript(buildTxCopy)(fixture.tx, 0)(keyPair)
      assert.equal(script.toString('hex'), fixture.decoded.vin[0].scriptSig)
    })
  })

  describe('vinScript HTLC', function () {
    const keyPair = fixtureNode.keyPair
    const secret = '56c44dc6ac176bb534679a8e4b6979b1'
    const htlc = {
      secret,
      refundAddr: 'mm2zdwmiVBR7ipNiN3tr4CCu6sS5tFwKna',
      timelock: 144
    }
    const expectedScript = '47304402202fc3de1b21a557a25bf4b2e3dd99d3e17edf4548cdc0b23ffa3a2c636688191302204adbffa92dca8119c0dd566fe75f9763031c7f605003c443da7209c9f92a128a012103a6afa2211fc96a4130e767da4a9e802f5e922a151c5cd6d4bffa80358dd1f9a31056c44dc6ac176bb534679a8e4b6979b151'
    it('should create vin script with HTLC', function () {
      const script = vinScript(buildTxCopy)(fixture.tx, 0)(keyPair, htlc)
      // console.log(`script: ${script.toString('hex')}`)
      assert.equal(script.toString('hex'), expectedScript)
    })
  })

  describe('vinScript HTLC expired timelock', function () {
    const keyPair = fixtureNode.keyPair
    const secretHash = '7c4222070fe4f287b70f12561fe93e703153d34cbc35bc3210ddd4eed609b077'
    const htlc = {
      secretHash,
      refundAddr: 'mm2zdwmiVBR7ipNiN3tr4CCu6sS5tFwKna',
      timelock: 144
    }
    const expectedScript = '47304402202fc3de1b21a557a25bf4b2e3dd99d3e17edf4548cdc0b23ffa3a2c636688191302204adbffa92dca8119c0dd566fe75f9763031c7f605003c443da7209c9f92a128a012103a6afa2211fc96a4130e767da4a9e802f5e922a151c5cd6d4bffa80358dd1f9a300'
    it('should create vin script with HTLC', function () {
      const script = vinScript(buildTxCopy)(fixture.tx, 0)(keyPair, htlc)
      // console.log(`script: ${script.toString('hex')}`)
      assert.equal(script.toString('hex'), expectedScript)
    })
  })

  describe('bufferInput', function () {
    const keyPair = fixtureNode.keyPair
    it('should build vin', function () {
      const txVin = Object.assign({}, fixture.tx.vin[0], {
        keyPair
      })
      const buffer = bufferInput(fixture.tx)(txVin, 0)
      assert.equal(buffer.toString('hex'), fixture.hexItems.vin)
    })
  })
  describe('bufferInputs', function () {
    it('should process vins', function () {
      const keyPair = fixtureNode.keyPair
      const tx = Object.assign({}, fixture.tx)
      tx.vin[0].keyPair = keyPair
      const buffer = bufferInputs('vin', bufferInput)(tx)
      assert.equal(buffer.toString('hex'), '01' + fixture.hexItems.vin)
    })
  })
  describe('buildTx', function () {
    it('should build the whole transaction', function () {
      const buffer = buildTx(fixture.tx)
      assert.equal(buffer.toString('hex'), fixture.hex)
    })
  })
})

describe('buildCoinbaseTx', function () {
  const tx = {
    version: 1,
    locktime: 0,
    vin: [{
      blockHeight: 40500
    }],
    vout: [{
      value: 12.5 + 0.02 * 100000000,
      address: 'mricWicq8AV5d46cYWPApESirBXcB42h57'
    }]
  }
  it('should build coinbase script', function () {
    const script = coinbaseScript(40500).toString('hex')
    // console.log(`script = ${script}`)
    assert.ok(script)
  })
  it('should build coinbase input', function () {
    const vin = coinbaseInput({ blockHeight: 40500 }).toString('hex')
    // console.log(`vin = ${vin}`)
    assert.ok(vin)
  })
  it('should build a coinbase tx', function () {
    const coinbaseHex = buildCoinbaseTx(tx).toString('hex')
    // console.log(`coinbaseHex = ${coinbaseHex}`)
    assert.ok(coinbaseHex)
  })
})
