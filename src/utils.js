const bitcoin = require('bitcoinjs-lib')
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

module.exports = {
  getAddress,
  getAddressBech32,
  getHexFromBech32Address
}
