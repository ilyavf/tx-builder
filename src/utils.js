const bitcoin = require('bitcoinjs-lib')

function getAddress (publicKey, network) {
  network = network || bitcoin.networks.testnet
  return bitcoin.payments.p2pkh({ pubkey: publicKey, network })
}

module.exports = {
  getAddress: getAddress
}
