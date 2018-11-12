const assert = require('assert')
const bip39 = require('bip39')
const bip32 = require('bip32')
const bitcoin = require('bitcoinjs-lib')
const { getAddress, getAddressBech32 } = require('../../src/utils')

const mnemonic = 'talent destroy radar dinosaur punch muscle swear diary mango unit gallery bus'
const seed = bip39.mnemonicToSeed(mnemonic, '')
const root = bip32.fromSeed(seed, bitcoin.networks.testnet)
const hdNode = root.derivePath(`m/44'/0'/0'`)
const xpub = hdNode.neutered().toBase58()

// Address 0:
const addrHdNode = hdNode.derive(0).derive(0)
const keyPair = bitcoin.ECPair.fromPrivateKey(addrHdNode.privateKey, {network: bitcoin.networks.testnet})
const addrPublicKeyHex = addrHdNode.publicKey.toString('hex')
const address = getAddress(addrHdNode.publicKey, { network: bitcoin.networks.testnet })
const addressBech32 = getAddressBech32(addrHdNode.publicKey, { network: bitcoin.networks.testnet })

// Address 1:
// const addr1HdNode = hdNode.derive(0).derive(1)
// const addr1 = getAddress(addr1HdNode.publicKey, { network: bitcoin.networks.testnet })
// const addr1Bech32 = getAddressBech32(addr1HdNode.publicKey, { network: bitcoin.networks.testnet })
// const addr1PublicKeyHex = addr1HdNode.publicKey.toString('hex')
// console.log(`addr1`, addr1)
// console.log(`addr1Bech32`, addr1Bech32)
// console.log(`addr1PublicKeyHex`, addr1PublicKeyHex)

// 0 publicKeyHex: 03a6afa2211fc96a4130e767da4a9e802f5e922a151c5cd6d4bffa80358dd1f9a3
// 0: mm2zdwmiVBR7ipNiN3tr4CCu6sS5tFwKna / tb1q8jr3q3s0cc7j0en5rhgeylcweeq7nd246575ce
// 1: mxk5zYRwVWDAwgKYaAadDeiCjY67ACAHLt / tb1qhn6l3jl02la469u5ad3x5a6juvw3k24tpxqxsx
// 2: n1nXTT79FU2bwHTLXQkydzfT7biCxW4ZqE / tb1qme2xla4lkjzljv5zvu3vj9l8vvjp7hvm2njvyc
// console.log(`*** fixture address=${address}`)
// tpubDCFRCuNqtJHd3htCkN1rtHmQiSsjxNBFcPjqByuQZwqn9yqmNrWNfB4Y72uNFujtmajddf29LwTMDLVfpPXz1LRDXPPo75imk8WNe1ZfbvC
// console.log(`xpub = ${xpub}`)

assert.equal(address, 'mm2zdwmiVBR7ipNiN3tr4CCu6sS5tFwKna')
assert.equal(addressBech32, 'tb1q8jr3q3s0cc7j0en5rhgeylcweeq7nd246575ce')

module.exports = {
  hdNode,
  xpub,
  addrHdNode,
  addrPublicKeyHex,
  address,
  addressBech32,
  keyPair
}
