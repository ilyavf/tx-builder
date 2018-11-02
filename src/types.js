const bs58check = require('bs58check')
const bech32 = require('bech32')
const types = require('bitcoinjs-lib/src/types')
const typeforce = require('typeforce')

function Address (value, strict) {
  // Base58Check: 'mxZs8wiVXSD6myyRhLuLauyh8X8GFmbaLK'
  // Bech32:      'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx' <[prefix][separator][data]>
  return AddressBase58Check(value) || AddressBech32(value)
}

function AddressBase58Check (value) {
  try {
    const payload = bech32.decode(value)
    return !!payload
  } catch (err) {
    return false
  }
}

function AddressBech32 (value) {
  try {
    return bs58check.decode(value).length === 21
  } catch (err) {
    return false
  }
}

function FunctionType (value, strict) {
  return typeof value === 'function'
}

const TxConfig = typeforce.compile({
  version: typeforce.Number,
  vin: typeforce.Array,
  vout: typeforce.Array,
  locktime: typeforce.Number
})

const TxVin = typeforce.compile({
  txid: typeforce.String,
  vout: typeforce.Number
})

const TxBuilderOptions = typeforce.compile({
  network: typeforce.maybe(typeforce.oneOf(typeforce.value('TESTNET'), typeforce.value('MAINNET'), types.Network)),
  sha: types.maybe(types.oneOf(typeforce.value('SHA256'), typeforce.value('SHA3_256'))),
  hashTimelockContract: types.maybe(FunctionType)
})
const txTypes = {
  Address,
  AddressBase58Check,
  AddressBech32,
  FunctionType,
  TxBuilderOptions,
  TxConfig,
  TxVin
}

module.exports = Object.assign(types, txTypes)
