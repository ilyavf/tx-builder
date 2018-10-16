const bitcoin = require('bitcoinjs-lib')
const bs58check = require('bs58check')
const bech32 = require('bech32')
const OPS = require('bitcoin-ops')
const typeforce = require('typeforce')
const types = require('./types')

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
  return bech32.decode(address).data
}

// Returns hex value of a Bitcoin address:
// getHexFromAddress :: String -> Buffer
function getHexFromAddress (address) {
  typeforce(types.Address, address)
  const payload = bs58check.decode(address)
  const version = payload.readUInt8(0)
  const hash = payload.slice(1)
  return hash
}

// outputScript :: Object -> Buffer
function outputScript ({ address, hash }) {
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

module.exports = {
  getAddress,
  getAddressBech32,
  getHexFromBech32Address,
  getHexFromAddress,
  outputScript
}
