const bitcoin = require('bitcoinjs-lib')
const bs58check = require('bs58check')
const bech32 = require('bech32')

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
  const payload = bs58check.decode(address)
  const version = payload.readUInt8(0)
  const hash = payload.slice(1)
  return hash.toString('hex')
}

module.exports = {
  getAddress,
  getAddressBech32,
  getHexFromBech32Address,
  getHexFromAddress
}
