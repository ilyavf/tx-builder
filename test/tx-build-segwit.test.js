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
      const expectedSig = '473044022002a58570a8c2ad4986db43e5ac9d40e94c35e07343c6c709be324199e92d37c002207f950d131f91cde241d035487342520620b9b0b9ad0c13d5d9a5490ede4e7674012103183de65f25cfbc5c371781dc212b46bca8db2de96d9076eef0a8c98ce0fd271e'
      const scriptLen = 0x6a * 2 //
      // Just making sure the signature length is correct:
      assert.equal(expectedSig.length, scriptLen)
      const privKey = 'cUtqnMnPdFJeg6fXknCH5XcHNqNz9amAYXDAD6S1XYehUiaVqJs3'
      let txConfig, ecPair, buffer, hex
      before(function () {
        ecPair = bitcoin.ECPair.fromWIF(privKey, bitcoin.networks.testnet)
        txConfig = {
          version: 2,
          locktime: 101,  // 4 bytes (8 hex chars)
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
        console.log('tx hex:', hex)
        assert.equal(hex.substr(-(scriptLen + 8), scriptLen), expectedSig)
      })
      it('should locate the signature in the end of tx hex', function () {
        assert.equal(hex.search(expectedSig), 168) // 388 - 212 - 8 = 168 (txLen - scriptLen - locktimeLen)
      })
      it('should build tx hex', function () {
        const expectedHex = '0200000000010119a1e7978681805188cfa973c3fddf7b0f476a2415752c6e81abfb5e3ee2520200000000feffffff0180f0fa02000000001976a914bb0714d092afe38cca611791aaf076aba6aebc3788ac016a473044022002a58570a8c2ad4986db43e5ac9d40e94c35e07343c6c709be324199e92d37c002207f950d131f91cde241d035487342520620b9b0b9ad0c13d5d9a5490ede4e7674012103183de65f25cfbc5c371781dc212b46bca8db2de96d9076eef0a8c98ce0fd271e65000000'
        assert.equal(hex, expectedHex)
      })
      it.skip('should build transaction without SegWit P2WPKH output', function () {
        const txConfig = {
          version: 2,
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
            address: 'mxZs8wiVXSD6myyRhLuLauyh8X8GFmbaLK',
            type: 'P2WPKH'
          }]
        }
        const buffer = buildTx(txConfig, {sha: 'SHA256'})
        assert.equal(buffer.toString('hex'), fixturesSegwit[0].hex)
      })
    })
  })
})
