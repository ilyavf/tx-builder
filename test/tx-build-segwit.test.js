const bitcoin = require('bitcoinjs-lib')
const assert = require('assert')
const fixturesSegwit = require('./fixtures/tx-sha3')
const { buildTx } = require('../src/tx-builder')
// const { getTxId } = require('../src/tx-decoder')

describe('SegWit', function () {
  describe('P2WPKH', function () {
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
