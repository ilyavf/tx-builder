const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')

const mnemonic = 'talent destroy radar dinosaur punch muscle swear diary mango unit gallery bus'
const seed = bip39.mnemonicToSeed(mnemonic, '')
const root = bitcoin.HDNode.fromSeedBuffer(seed, bitcoin.networks.testnet)
const hdNode = root.derivePath(`m/44'/0'/0'`)

const addrHdNode = hdNode.derive(0).derive(0)
const address = addrHdNode.getAddress()
const xpub = hdNode.neutered().toBase58()

// 0: mm2zdwmiVBR7ipNiN3tr4CCu6sS5tFwKna
// 1: mxk5zYRwVWDAwgKYaAadDeiCjY67ACAHLt
// 2: n1nXTT79FU2bwHTLXQkydzfT7biCxW4ZqE
// console.log(`*** fixture address=${address}`)
// tpubDCFRCuNqtJHd3htCkN1rtHmQiSsjxNBFcPjqByuQZwqn9yqmNrWNfB4Y72uNFujtmajddf29LwTMDLVfpPXz1LRDXPPo75imk8WNe1ZfbvC
// console.log(`xpub = ${xpub}`)

module.exports = {
  hdNode,
  addrHdNode,
  address,
  keyPair: addrHdNode.keyPair,
  xpub
}
