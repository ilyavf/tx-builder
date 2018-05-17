/**
 * This `decodeTx` decodes a bitcoin transaction. Its an example of how to use the composable helpers
 * to make a decoder.
 */

const bitcoin = require('bitcoinjs-lib')
const bcrypto = bitcoin.crypto
const sha3_256 = require('js-sha3').sha3_256              // eslint-disable-line
const { compose, addProp } = require('./compose-read')
const {
  readSlice,
  readUInt32,
  readInt32,
  readUInt64,
  readVarInt,
  readVarSlice
} = require('./buffer-read')

/**
 * Transaction's hash is a 256-bit integer, so we need to reverse bytes due to Little Endian byte order.
 */
// readHash :: Buffer -> [Hash, Buffer]
const readHash = buffer => {
  const [res, bufferLeft] = readSlice(32)(buffer)
  // Note: `buffer.reverse()` mutates the buffer, so make a copy:
  const hash = Buffer.from(res).reverse().toString('hex')
  return [hash, bufferLeft]
}

// readInputs :: Fn -> Buffer -> (Res, Buffer)
const readInputs = readFn => buffer => {
  const vins = []
  let [vinLen, bufferLeft] = readVarInt(buffer)
  let vin
  for (let i = 0; i < vinLen; ++i) {
    [vin, bufferLeft] = readFn(bufferLeft)
    vins.push(vin)
  }
  return [vins, bufferLeft]
}

// decodeTx :: Buffer -> [Object, Buffer]
const decodeTx = buffer =>
(
  compose([
    addProp('version', readInt32),            // 4 bytes
    addProp('vin', readInputs(readInput)),    // 1-9 bytes (VarInt), Input counter; Variable, Inputs
    addProp('vout', readInputs(readOutput)),  // 1-9 bytes (VarInt), Output counter; Variable, Outputs
    addProp('locktime', readUInt32)           // 4 bytes
  ])({}, buffer)
)

// readInput :: Buffer -> [Res, Buffer]
const readInput = buffer =>
(
  compose([
    addProp('txid', readHash),                // 32 bytes, Transaction Hash
    addProp('vout', readUInt32),             // 4 bytes, Output Index
    addProp('scriptSig', readVarSlice),       // 1-9 bytes (VarInt), Unlocking-Script Size; Variable, Unlocking-Script
    addProp('sequence', readUInt32)           // 4 bytes, Sequence Number
  ])({}, buffer)
)

// readOutput :: Buffer -> [Res, Buffer]
const readOutput = buffer =>
(
  compose([
    addProp('value', readUInt64),             // 8 bytes, Amount in satoshis
    addProp('scriptPubKey', readVarSlice)     // 1-9 bytes (VarInt), Locking-Script Size; Variable, Locking-Script
  ])({}, buffer)
)

// doubleSha3 :: Buffer -> String
const doubleSha3 = buffer => {
  // Note: sha3_256 can accept either Buffer or String, and always outputs String.
  return sha3_256(sha3_256(buffer))
}

// Since a hash is a 256-bit integer and is stored using Little Endian, we reverse it for showing to user (who reads BE).
// getTxId :: Buffer -> String
const getTxId = options => buffer => {
  let createHash = bcrypto.hash256
  if (options && options.sha === 'SHA3_256') {
    createHash = doubleSha3
  }
  return createHash(buffer).reverse().toString('hex')
}

module.exports = {
  decodeTx,
  readHash,
  readInputs,
  readInput,
  readOutput,
  getTxId,
  doubleSha3
}
