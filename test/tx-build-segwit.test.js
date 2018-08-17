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

const bitcoin = require('bitcoinjs-lib')
const assert = require('assert')
const fixturesSegwit = require('./fixtures/tx-sha3')
const createP2shP2wpkhAddress = require('../src/segwit').createP2shP2wpkhAddress()
const { buildTx } = require('../src/tx-builder')
// const { getTxId } = require('../src/tx-decoder')

describe.only('SegWit', function () {
  describe('Create P2SH-P2WPKH address', function () {
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
  describe.skip('P2WPKH', function () {
    let buffer
    before(function () {
      const ecPair = bitcoin.ECPair.fromWIF(fixturesSegwit[0].privKey, bitcoin.networks.testnet)
      fixturesSegwit[0].tx.vin.forEach(vin => { vin.keyPair = ecPair })
      buffer = buildTx(fixturesSegwit[0].tx, {sha: 'SHA256'})
    })
    it('should build transaction with SegWit P2WPKH output', function () {
      assert.equal(buffer.toString('hex'), fixturesSegwit[0].hex)
    })
  })
})
