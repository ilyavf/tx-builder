const varuint = require('varuint-bitcoin')
const bitcoin = require('bitcoinjs-lib')
const assert = require('assert')
// const { hashTimelockContract } = require('tx-builder-equibit/src/script-builder')
const {
  bufferInt32,
  bufferUInt64,
  bufferVarInt,
  bufferVarSlice,
  bufferVarSliceBuffer,
  bufferVarArray,
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
  bufferTxid,
  bufferInputEmptyScript,
  makeBufferOutput,
  vinScript,
  voutScript,
  buildCoinbaseTx,
  coinbaseInput,
  coinbaseScript,
  signBuffer,
  isSegwit,
  addSegwitMarker,
  addSegwitData
} = require('../src/tx-builder')
const { prop } = require('../src/compose-build')
const { getTxId } = require('../src/tx-decoder')
const fixture = require('./fixtures/tx-hex-decoded')
const fixtureNode = require('./fixtures/hdnode')
const fixturesSha3 = require('./fixtures/tx-sha3')

const network = bitcoin.networks.testnet

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
  describe('bufferVarArray', function () {
    it('should create a variable length buffer from array of buffers', function () {
      const arr = [Buffer.from('0a', 'hex'), Buffer.from('0b', 'hex')]
      const expectedHex = '02010a010b'
      assert.equal(bufferVarArray(arr).toString('hex'), expectedHex)
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
  describe('bufferTxid', function () {
    it('should create a buffer with txid', function () {
      const txid = '2d7a9f0534ddac231ef1978bda388791c32321f7e14e18e7df3bbed261615f54'
      assert.equal(bufferTxid(txid).reverse().toString('hex'), txid)
    })
  })
  describe('makeBufferOutput', function () {
    it('should make a bufferOutput function', function () {
      const bufferOutput = makeBufferOutput(
        prop('address', voutScript({network: 'TESTNET'}))
      )
      const buffer = bufferOutput(fixture.tx.vout[0])
      assert.equal(buffer.toString('hex'), fixture.hexItems.vout1)
    })
  })
  describe('bufferOutput', function () {
    it('should build vout-1', function () {
      const buffer = bufferOutput({})(fixture.tx.vout[0])
      assert.equal(buffer.toString('hex'), fixture.hexItems.vout1)
    })
  })
  describe('bufferInputEmptyScript', function () {
    it('should return buffer of vin with empty script', function () {
      const buffer = bufferInputEmptyScript(fixture.tx.vin[0])
      assert.equal(buffer.toString('hex'), fixture.hexItems.vin1emptyScript)
    })
    it('should return buffer of vin with subscript', function () {
      // Requires publicKey to generate address (P2PKH).
      const keyPair = fixtureNode.keyPair
      const subscript = txCopySubscript(keyPair, null, { network })
      const vin = Object.assign({}, fixture.tx.vin[0], {script: subscript})
      const buffer = bufferInputEmptyScript(vin)
      assert.equal(buffer.toString('hex'), fixture.hexItems.vin1Subscript)
    })
  })
  describe('txCopySubscript', function () {
    it('should create a subscript for txCopy vin', function () {
      const keyPair = fixtureNode.keyPair
      const subscript = txCopySubscript(keyPair, null, { network })
      assert.equal(subscript.toString('hex'), fixture.hexItems.txCopySubscript)
    })
  })
  describe('buildTxCopy', function () {
    it('should return buffer of tx copy for scriptSig', function () {
      const keyPair = fixtureNode.keyPair
      const subscript = txCopySubscript(keyPair, null, { network })
      const txCopyWithScript = Object.assign({}, fixture.tx)
      txCopyWithScript.vin[0].script = subscript
      const buffer = buildTxCopy({})(txCopyWithScript)
      assert.equal(buffer.toString('hex'), fixture.hexItems.txCopyHex)
    })
  })
  describe('txCopyForHash', function () {
    const keyPair = fixtureNode.keyPair
    it('should prepare txCopy for hashing', function () {
      const txCopyBuffer = txCopyForHash(buildTxCopy({}), { network })(keyPair, fixture.tx, 0)
      assert.equal(txCopyBuffer.toString('hex'), fixture.hexItems.txCopyForHash)
    })
  })
  describe('vinScript', function () {
    const keyPair = fixtureNode.keyPair
    it('should create vin script', function () {
      // Requires both privateKey and publicKey.
      const script = vinScript(buildTxCopy({}), { network })(fixture.tx, 0)(keyPair)
      assert.equal(script.toString('hex'), fixture.decoded.vin[0].scriptSig.hex)
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
    it.skip('should create vin script with HTLC', function () {
      let hashTimelockContract
      const script = vinScript(buildTxCopy({}), { hashTimelockContract, network })(fixture.tx, 0)(keyPair, htlc)
      // console.log(`script: ${script.toString('hex')}`)
      assert.equal(script.toString('hex'), expectedScript)
    })
  })

  describe('vinScript HTLC expired timelock (REFUND transaction)', function () {
    const keyPair = fixtureNode.keyPair
    const secretHash = '7c4222070fe4f287b70f12561fe93e703153d34cbc35bc3210ddd4eed609b077'
    const htlc = {
      receiverAddr: 'n1nXTT79FU2bwHTLXQkydzfT7biCxW4ZqE',
      refundAddr: fixtureNode.address,
      secretHash,
      timelock: 144
    }
    const expectedScript = '473044022032650eefcb5ced3a6b2257386659668483354070f7468a0fc8ab53a9ba33166f0220084cf01b7ebd1a9dcbc6cdd7818e598b8240e8b56347b9ae69c4f5cb13d645b5012103a6afa2211fc96a4130e767da4a9e802f5e922a151c5cd6d4bffa80358dd1f9a300'
    it.skip('should create vin script with HTLC', function () {
      let hashTimelockContract
      const script = vinScript(buildTxCopy({}), { hashTimelockContract, network })(fixture.tx, 0)(keyPair, htlc)
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
      const buffer = bufferInput({})(fixture.tx)(txVin, 0)
      assert.equal(buffer.toString('hex'), fixture.hexItems.vin)
    })
  })
  describe('bufferInputs', function () {
    it('should process vins', function () {
      const keyPair = fixtureNode.keyPair
      const tx = Object.assign({}, fixture.tx)
      tx.vin[0].keyPair = keyPair
      const buffer = bufferInputs('vin', bufferInput({}))(tx)
      assert.equal(buffer.toString('hex'), '01' + fixture.hexItems.vin)
    })
  })
  describe('buildTx', function () {
    it('should build the whole transaction', function () {
      const buffer = buildTx(fixture.tx, {})
      assert.equal(buffer.toString('hex'), fixture.hex)
    })
  })
  describe('SHA3', function () {
    describe('SHA3 - signBuffer', function () {
      let ecPair
      const expectedSha256 = '30440220486203ea7e64d3ae6be581a0d12d34faad718221e4eb64df6550c6a82e19993002203df51050ce3ae2265f5b63812876f50d0b25e266f193f09705a14c5dc599b4ae01'
      const expectedSha3 = '304402204b6de45521a16576e6d09e986256a7b11614ac50cb916240050433f674fabe7a0220528ef243fe6af99aab67945cb26a0e2a0aed0e43d42909cf2a5271c40f121b0001'
      const bufferToSign = Buffer.from('123456')
      before(function () {
        ecPair = bitcoin.ECPair.fromWIF(fixturesSha3[0].privKey, bitcoin.networks.testnet)
      })
      it('should sign Buffer using SHA256', function () {
        const buffer = signBuffer(ecPair, {sha: 'SHA256'})(bufferToSign)
        assert.equal(buffer.toString('hex'), expectedSha256)
      })
      it('should sign Buffer using SHA3', function () {
        const buffer = signBuffer(ecPair, {sha: 'SHA3_256'})(bufferToSign)
        assert.equal(buffer.toString('hex'), expectedSha3)
      })
    })

    describe('SHA3 - buildTx', function () {
      let buffer
      before(function () {
        const ecPair = bitcoin.ECPair.fromWIF(fixturesSha3[0].privKey, bitcoin.networks.testnet)
        fixturesSha3[0].tx.vin.forEach(vin => { vin.keyPair = ecPair })
        buffer = buildTx(fixturesSha3[0].tx, {sha: 'SHA3_256'})
      })
      it('should build transaction using SHA3', function () {
        assert.equal(buffer.toString('hex'), fixturesSha3[0].hex)
      })
      it('should create TXID using SHA3', function () {
        assert.equal(getTxId({sha: 'SHA3_256'})(buffer), fixturesSha3[0].txid)
      })
    })
  })

  describe('SegWit related utils', function () {
    describe('isSegwit', function () {
      it('should detect if segwit transaction serialization is required', function () {
        assert.ok(isSegwit()({vin: [{}, {type: 'P2WPKH'}]}))
      })
      it('should detect if segwit transaction serialization is not required', function () {
        assert.ok(!isSegwit()({vin: [{type: 'P2PKH'}]}))
      })
    })

    describe('addSegwitMarker', function () {
      it('should add marker and flag bytes', function () {
        const expected = '0001'
        assert.equal(addSegwitMarker()({}).toString('hex'), expected)
      })
    })

    describe.skip('addSegwitData', function () {
      it('should create witnesses buffer from tx config', function () {
        const sig1 = Buffer.from('010203', 'hex')
        const sig2 = Buffer.from('0a0b0c', 'hex')
        const txConfig = {
          vin: [{scriptSig: sig1}, {scriptSig: sig2}]
        }
        const buffer = addSegwitData({})(txConfig.vin)
        const expected = '0203010203030a0b0c'
        assert.equal(buffer.toString('hex'), expected)
      })
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
