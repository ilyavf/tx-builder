const bs58check = require('bs58check')
const types = require('bitcoinjs-lib/src/types')
const typeforce = require('typeforce')

function Address (value, strict) {
  let payload
  try {
    payload = bs58check.decode(value)
  } catch (err) {
    return false
  }
  if (payload.length < 21) return false
  if (payload.length > 21) return false
  return true
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

const txTypes = {
  Address,
  FunctionType,
  TxConfig,
  TxVin
}

module.exports = Object.assign(types, txTypes)
