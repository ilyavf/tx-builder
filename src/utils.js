const Buffer = require('safe-buffer').Buffer
const bitcoin = require('bitcoinjs-lib')
const bs58check = require('bs58check')
const bech32 = require('bech32')
const OPS = require('bitcoin-ops')
const typeforce = require('typeforce')
const types = require('./types')
const { bufferUInt8, bufferVarInt } = require('./buffer-build')

function getAddress (publicKey, network) {
  network = network || bitcoin.networks.testnet
  return bitcoin.payments.p2pkh({ pubkey: publicKey, network }).address
}

function getAddressBech32 (publicKey, network) {
  network = network || bitcoin.networks.testnet
  return bitcoin.payments.p2wpkh({ pubkey: publicKey, network }).address
}

// Returns hex value of a SegWit address:
// getHexFromBech32Address :: String -> Buffer
function getHexFromBech32Address (address) {
  typeforce(types.Address, address)
  const result = bech32.decode(address)
  result.words.shift() // version
  const data = bech32.fromWords(result.words)
  return Buffer.from(data)
}

// Returns hex value of a Bitcoin address:
// getHexFromAddress :: String -> Buffer
function getHexFromAddress (address) {
  typeforce(types.Address, address)
  const payload = bs58check.decode(address)
  // const version = payload.readUInt8(0)
  const hash = payload.slice(1)
  return hash
}

// outputScript :: Object -> Buffer
function outputScript ({ address, hash }) {
  if (hash && !Buffer.isBuffer(hash)) {
    hash = Buffer.from(hash, 'hex')
  }
  hash = hash || getHexFromAddress(address)
  // P2PKH script:
  return bitcoin.script.compile([
    OPS.OP_DUP,
    OPS.OP_HASH160,
    hash,
    OPS.OP_EQUALVERIFY,
    OPS.OP_CHECKSIG
  ])
}

// outputScriptWitness :: Object -> Buffer
function outputScriptWitness ({ address, hash }) {
  hash = hash || getHexFromBech32Address(address)
  // P2WPKH script:
  return Buffer.concat([bufferUInt8(OPS.OP_0), bufferVarInt(hash.length), hash])
}

// todo: add SHA3 option.
const pubKeyHash = options => pubKey => {
  typeforce('Buffer', pubKey)
  return bitcoin.crypto.hash160(pubKey)
}

module.exports = {
  getAddress,
  getAddressBech32,
  getHexFromBech32Address,
  getHexFromAddress,
  outputScript,
  outputScriptWitness,
  pubKeyHash
}
