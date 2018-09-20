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
const keyPair = bitcoin.ECPair.fromPrivateKey(addrHdNode.privateKey)
const addrPublicKeyHex = addrHdNode.publicKey.toString('hex')
const address = getAddress(addrHdNode.publicKey, bitcoin.networks.testnet).address
const addressBech32 = getAddressBech32(addrHdNode.publicKey, bitcoin.networks.testnet).address

// publicKeyHex = 03a6afa2211fc96a4130e767da4a9e802f5e922a151c5cd6d4bffa80358dd1f9a3
// 0: mm2zdwmiVBR7ipNiN3tr4CCu6sS5tFwKna
// 1: mxk5zYRwVWDAwgKYaAadDeiCjY67ACAHLt
// 2: n1nXTT79FU2bwHTLXQkydzfT7biCxW4ZqE
// console.log(`*** fixture address=${address}`)
// tpubDCFRCuNqtJHd3htCkN1rtHmQiSsjxNBFcPjqByuQZwqn9yqmNrWNfB4Y72uNFujtmajddf29LwTMDLVfpPXz1LRDXPPo75imk8WNe1ZfbvC
// console.log(`xpub = ${xpub}`)

module.exports = {
  hdNode,
  xpub,
  addrHdNode,
  addrPublicKeyHex,
  address,
  addressBech32,
  keyPair
}
