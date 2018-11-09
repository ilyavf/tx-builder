const assert = require('assert')
const bitcoin = require('bitcoinjs-lib')
const { getAddress, getAddressBech32, getHexFromAddress, outputScript, outputScriptWitness, createPubKeyHash } = require('../src/utils')

describe('Utils', function () {
  const publicKeyHex = '03a6afa2211fc96a4130e767da4a9e802f5e922a151c5cd6d4bffa80358dd1f9a3'
  const publicKey = Buffer.from(publicKeyHex, 'hex')
  describe('getAddress', function () {
    it('should return Base58Check address', function () {
      const expected = 'mm2zdwmiVBR7ipNiN3tr4CCu6sS5tFwKna'
      const addr = getAddress(publicKey, { network: bitcoin.networks.testnet })
      assert.equal(addr, expected)
    })
  })
  describe('getAddressBech32', function () {
    it('should return Bech32 (SegWit) address', function () {
      const expected = 'tb1q8jr3q3s0cc7j0en5rhgeylcweeq7nd246575ce'
      const addr = getAddressBech32(publicKey, { network: bitcoin.networks.testnet })
      assert.equal(addr, expected)
    })
  })
  describe('getHexFromAddress', function () {
    it('should return hex from Base58Check address', function () {
      const addr = 'msQzKJatdWdw4rpy8sbv8puHoncseekYCf'
      const expected = '8280b37df378db99f66f85c95a783a76ac7a6d59'
      const hex = getHexFromAddress(addr).toString('hex')
      assert.equal(hex, expected)
    })
  })
  describe('outputScript', function () {
    it('should create P2PKH output script off address', function () {
      const address = 'msQzKJatdWdw4rpy8sbv8puHoncseekYCf'
      const script = outputScript({ address })
      const expected = '76a9148280b37df378db99f66f85c95a783a76ac7a6d5988ac'
      assert.equal(script.toString('hex'), expected)
    })
  })
  describe('outputScriptWitness', function () {
    it('should create P2WPKH output script off address', function () {
      const publicKey = Buffer.from('025476c2e83188368da1ff3e292e7acafcdb3566bb0ad253f62fc70f07aeee6357', 'hex')
      const address = getAddressBech32(publicKey, { network: bitcoin.networks.testnet })
      const script = outputScriptWitness({ address })
      const expected = '00141d0f172a0ecb48aee1be1f2687d2963ae33f71a1'
      assert.equal(script.toString('hex'), expected)
    })
  })
  describe('createPubKeyHash', function () {
    it('should create hash from a given public key', function () {
      const publicKey = Buffer.from('025476c2e83188368da1ff3e292e7acafcdb3566bb0ad253f62fc70f07aeee6357', 'hex')
      const publicKeyHash = createPubKeyHash({})(publicKey)
      const expected = '1d0f172a0ecb48aee1be1f2687d2963ae33f71a1'
      assert.equal(publicKeyHash.toString('hex'), expected)
    })
  })
})
