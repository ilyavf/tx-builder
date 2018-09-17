/**
 * Main article: https://bitcoincore.org/en/segwit_wallet_dev/
 * Tool to check tx: http://n.bitcoin.ninja/checktx
 *
 * P2SH-P2WPKH
 *   - A P2SH-P2WPKH address is comparable to Bitcoin’s original single-signature P2PKH address (address with prefix 1).
 *   - Like any other P2SH address, P2SH-P2WPKH address has prefix 3.
 *
 * To create a P2SH-P2WPKH address:
 *   1. Calculate the RIPEMD160 of the SHA256 of a public key (keyhash). Despite the keyhash formula is same as P2PKH, reuse of keyhash should be avoided for better privacy and prevention of accidental use of uncompressed key
 *   2. The P2SH redeemScript is always 22 bytes. It starts with a OP_0, followed by a canonical push of the keyhash (i.e. 0x0014{20-byte keyhash})
 *   3. Same as any other P2SH, the scriptPubKey is OP_HASH160 hash160(redeemScript) OP_EQUAL, and the address is the corresponding P2SH address with prefix 3.
 */

const Buffer = require('safe-buffer').Buffer
const bitcoin = require('bitcoinjs-lib')
const assert = require('assert')
const fixturesSegwit = require('./fixtures/tx-sha3')
const createP2shP2wpkhAddress = require('../src/segwit').createP2shP2wpkhAddress()
const { buildTx } = require('../src/tx-builder')
const { decodeTx, getTxId } = require('../src/tx-decoder')
const decodeFixtures = require('./fixtures/tx-segwit-decoded')

describe('SegWit', function () {
  describe.skip('Create P2SH-P2WPKH address', function () {
    const expected = ''
    before(function () {
      // const ecPair = bitcoin.ECPair.fromWIF(fixturesSegwit[0].privKey, bitcoin.networks.testnet)
      // fixturesSegwit[0].tx.vin.forEach(vin => { vin.keyPair = ecPair })
      // buffer = buildTx(fixturesSegwit[0].tx, {sha: 'SHA256'})
    })
    it('should create P2SH-P2WSH address', function () {
      const segwitAddress = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx'
      const p2sh = createP2shP2wpkhAddress(segwitAddress, bitcoin.networks.testnet)
      assert.equal(p2sh, expected)
    })
  })
  describe('P2WPKH', function () {
    describe.skip('- decode', function () {
      let decoded
      const hex = decodeFixtures.P2WPKH.hex
      const buffer = Buffer.from(hex, 'hex')
      const expected = {}
      const expectedTxId = ''
      before(function () {
        decoded = decodeTx(buffer, {sha: 'SHA256'})
      })
      it('should build transaction with SegWit P2WPKH output', function () {
        assert.equal(decoded, expected)
      })
      it('should calculate txid', function () {
        assert.equal(getTxId(hex), expectedTxId)
      })
    })
    describe.skip('- build', function () {
      let buffer
      before(function () {
        const ecPair = bitcoin.ECPair.fromWIF(fixturesSegwit[0].privKey, bitcoin.networks.testnet)
        // fixturesSegwit[0].tx.vin.forEach(vin => { vin.keyPair = ecPair })
        const txConfig = {
          version: 2,
          locktime: 101,
          vin: [{
            txid: '0252e23e5efbab816e2c7515246a470f7bdffdc373a9cf885180818697e7a119',
            vout: 0,
            keyPair: ecPair,
            type: 'P2WPKH',
            script: '',
            sequence: 4294967294
          }],
          vout: [{
            value: 1310255.22221466 * 100000000,
            address: 'mxZs8wiVXSD6myyRhLuLauyh8X8GFmbaLK',
            type: 'P2WPKH'
          }, {
            value: 2.5 * 100000000,
            address: 'mgyFAKifcUPfmkY25LfLb8ckaNMP8JuvBL',
            type: 'P2WPKH'
          }]
        }
        buffer = buildTx(txConfig, {sha: 'SHA256'})
      })
      it('should build transaction with SegWit P2WPKH output', function () {
        assert.equal(buffer.toString('hex'), fixturesSegwit[0].hex)
      })
    })
    describe('- build segwit', function () {
      // Grabbed the value from manual-segwit.js decoding the built tx:
      const expectedSig = '473044022026dac9599e56b1038e5e77726dfed8dae0943708eb23bb0815ef28a08b35e644022025129a134cad83cf9eaf1ef9a1a8cb3a5f25be103dd9833e6fd06785a75c2b8d012103183de65f25cfbc5c371781dc212b46bca8db2de96d9076eef0a8c98ce0fd271e'
      const scriptLen = 106 * 2 // 0x6a=106 bytes (= 212 chars)
      // Just making sure the signature length is correct:
      assert.equal(expectedSig.length, scriptLen)
      const privKey = 'cUtqnMnPdFJeg6fXknCH5XcHNqNz9amAYXDAD6S1XYehUiaVqJs3'
      let txConfig, ecPair, buffer, hex
      before(function () {
        ecPair = bitcoin.ECPair.fromWIF(privKey, bitcoin.networks.testnet)
        txConfig = {
          version: 1,
          locktime: 0,  // 4 bytes (8 hex chars)
          vin: [{
            txid: '0252e23e5efbab816e2c7515246a470f7bdffdc373a9cf885180818697e7a119',
            vout: 0,
            keyPair: ecPair,
            type: 'P2WPKH',
            script: '',
            sequence: 4294967294
          }],
          vout: [{
            value: 0.5 * 100000000,
            address: 'mxZs8wiVXSD6myyRhLuLauyh8X8GFmbaLK',
            type: 'P2WPKH'
          }]
        }
        buffer = buildTx(txConfig, {sha: 'SHA256'})
        hex = buffer.toString('hex')
      })
      it('should add witness signature to the end of tx hex', function () {
        assert.equal(hex.substr(-(scriptLen + 8), scriptLen), expectedSig)
      })
      it('should locate the signature in the end of tx hex', function () {
        assert.equal(hex.length, 390, 'transaction length')
        assert.equal(hex.search(expectedSig), 170) // 390 - 212 - 8 = 168 (txLen - scriptLen - locktimeLen)
      })
      it('should build tx hex (with type: "P2WPKH" output)', function () {
        const expectedHex = '0100000000010119a1e7978681805188cfa973c3fddf7b0f476a2415752c6e81abfb5e3ee252020000000000feffffff0180f0fa02000000001976a914bb0714d092afe38cca611791aaf076aba6aebc3788ac016a473044022026dac9599e56b1038e5e77726dfed8dae0943708eb23bb0815ef28a08b35e644022025129a134cad83cf9eaf1ef9a1a8cb3a5f25be103dd9833e6fd06785a75c2b8d012103183de65f25cfbc5c371781dc212b46bca8db2de96d9076eef0a8c98ce0fd271e00000000'
        assert.equal(hex, expectedHex)
      })
      it('should build transaction without SegWit P2WPKH output', function () {
        const expectedHex = '010000000119a1e7978681805188cfa973c3fddf7b0f476a2415752c6e81abfb5e3ee25202000000006b483045022100e2ba8f2dcb48d2ae0968c712111a56aa12923ed8b1caaedd7fe0b22d5020d77b022043a9e8254c8e0775ffb7c8c8a312486864087aef51c4bd858472ed372a344fe5012103183de65f25cfbc5c371781dc212b46bca8db2de96d9076eef0a8c98ce0fd271efeffffff0180f0fa02000000001976a914bb0714d092afe38cca611791aaf076aba6aebc3788ac65000000'
        const txConfig = {
          version: 1,
          locktime: 101,
          vin: [{
            txid: '0252e23e5efbab816e2c7515246a470f7bdffdc373a9cf885180818697e7a119',
            vout: 0,
            keyPair: ecPair,
            script: '',
            sequence: 4294967294
          }],
          vout: [{
            value: 0.5 * 100000000,
            address: 'mxZs8wiVXSD6myyRhLuLauyh8X8GFmbaLK'
          }]
        }
        const buffer = buildTx(txConfig, {sha: 'SHA256'})
        assert.equal(buffer.toString('hex'), expectedHex)
      })
    })
  })
})

/// / http://n.bitcoin.ninja/checktx?txid=d869f854e1f8788bcff294cc83b280942a8c728de71eb709a2c29d10bfe21b7c
// 0100000000010115e180dc28a2327e687facc33f10f2a20da717e5548406f7ae8b4c811072f8560100000000ffffffff0100b4f505000000001976a9141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b92888ac02483045022100df7b7e5cda14ddf91290e02ea10786e03eb11ee36ec02dd862fe9a326bbcb7fd02203f5b4496b667e6e281cc654a2da9e4f08660c620a1051337fa8965f727eb19190121038262a6c6cec93c2d3ecd6c6072efea86d02ff8e3328bbd0242b20af3425990ac00000000
// 0100000000010115e180dc28a2327e687facc33f10f2a20da717e5548406f7ae8b4c811072f8560100000000ffffffff0100b4f505000000001976a9141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b92888ac02
// 48   // 0x48 = 72 bytes = 144 chars:
// 3045022100df7b7e5cda14ddf91290e02ea10786e03eb11ee36ec02dd862fe9a326bbcb7fd02203f5b4496b667e6e281cc654a2da9e4f08660c620a1051337fa8965f727eb191901
// 21   // 0x21 = 33 bytes = 66 chars:
// 038262a6c6cec93c2d3ecd6c6072efea86d02ff8e3328bbd0242b20af3425990ac
// 00000000

// sig:
// 3045022100df7b7e5cda14ddf91290e02ea10786e03eb11ee36ec02dd862fe9a326bbcb7fd02203f5b4496b667e6e281cc654a2da9e4f08660c620a1051337fa8965f727eb191901
// 038262a6c6cec93c2d3ecd6c6072efea86d02ff8e3328bbd0242b20af3425990ac

// 0100000000010115e180dc28a2327e687facc33f10f2a20da717e5548406f7ae8b4c811072f8560100000000ffffffff0100b4f505000000001976a9141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b92888ac02483045022100df7b7e5cda14ddf91290e02ea10786e03eb11ee36ec02dd862fe9a326bbcb7fd02203f5b4496b667e6e281cc654a2da9e4f08660c620a1051337fa8965f727eb19190121038262a6c6cec93c2d3ecd6c6072efea86d02ff8e3328bbd0242b20af3425990ac00000000
// 0100000000010115e180dc28a2327e687facc33f10f2a20da717e5548406f7ae8b4c811072f8560100000000ffffffff0100b4f505000000001976a9141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b92888ac01483045022100df7b7e5cda14ddf91290e02ea10786e03eb11ee36ec02dd862fe9a326bbcb7fd02203f5b4496b667e6e281cc654a2da9e4f08660c620a1051337fa8965f727eb19190100000000
// 0100000000010115e180dc28a2327e687facc33f10f2a20da717e5548406f7ae8b4c811072f8560100000000ffffffff0100b4f505000000001976a9141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b92888ac0000000000

/// / my tx:
// 0100000000010119a1e7978681805188cfa973c3fddf7b0f476a2415752c6e81abfb5e3ee2520200000000feffffff0180f0fa02000000001976a914bb0714d092afe38cca611791aaf076aba6aebc3788ac016a473044022026dac9599e56b1038e5e77726dfed8dae0943708eb23bb0815ef28a08b35e644022025129a134cad83cf9eaf1ef9a1a8cb3a5f25be103dd9833e6fd06785a75c2b8d012103183de65f25cfbc5c371781dc212b46bca8db2de96d9076eef0a8c98ce0fd271e00000000
// 0100000000010119a1e7978681805188cfa973c3fddf7b0f476a2415752c6e81abfb5e3ee2520200000000feffffff0180f0fa02000000001976a914bb0714d092afe38cca611791aaf076aba6aebc3788ac
// 01
// 6a
// 473044022026dac9599e56b1038e5e77726dfed8dae0943708eb23bb0815ef28a08b35e644022025129a134cad83cf9eaf1ef9a1a8cb3a5f25be103dd9833e6fd06785a75c2b8d012103183de65f25cfbc5c371781dc212b46bca8db2de96d9076eef0a8c98ce0fd271e
// 00000000
