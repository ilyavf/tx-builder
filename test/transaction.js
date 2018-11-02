const bip32 = require('bip32')
const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')
const { decodeTx } = require('../src/tx-decoder')
const fixture = require('./fixtures/tx-hex-decoded')

const mnemonic = 'talent destroy radar dinosaur punch muscle swear diary mango unit gallery bus'
const seed = bip39.mnemonicToSeed(mnemonic, '')
const root = bip32.fromSeed(seed, bitcoin.networks.testnet)
const hdNode = root.derivePath("m/44'/0'/0'")

const addrHdNode = hdNode.derive(0).derive(0)
// const address = addrHdNode.getAddress()

const tx = new bitcoin.TransactionBuilder(bitcoin.networks.testnet)
tx.addInput('a3661cde89a5690f8aaffce8fb4371f78dda08b1f44b886798bb928d9e348aa5', 1)
tx.addOutput('mricWicq8AV5d46cYWPApESirBXcB42h57', 2 * 100000000)
tx.addOutput('mp9GiieHrLQvLu4C8nE9bbwxNmXqcC3nVf', (21.9999 - 2 - 0.0001) * 100000000)
tx.sign(0, addrHdNode.keyPair)

const hex = tx.build().toHex()
console.log(`hex = ${hex}`)

const buffer = Buffer.from(hex, 'hex')
const decoded = decodeTx(buffer)[0]
console.log(JSON.stringify(decoded))
console.log('\nscript' + JSON.stringify(decoded.vin[0].scriptSig.toString('hex')))

/// /////
const { vinScript, voutScript } = require('../src/tx-builder')
const script = vinScript(fixture.tx)(addrHdNode.keyPair)
console.log(`script = ${script.toString('hex')}`)

const scriptPubKey = voutScript('mricWicq8AV5d46cYWPApESirBXcB42h57')
console.log(`scriptPubKey = ${scriptPubKey.toString('hex')}`)
