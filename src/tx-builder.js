// bitcoinjs-lib:
// const tx = new bitcoin.TransactionBuilder( network )
// tx.addInput( transactionHash, vout )
// tx.addOutput( scriptPubKey, value )
// tx.sign( vin, keyPair )
// tx.build().toHex()

const Buffer = require('safe-buffer').Buffer
const {
  bufferInt32,
  bufferUInt32,
  bufferUInt64,
  bufferVarSlice
} = require('./buffer-write')

var EMPTY_BUFFER = Buffer.allocUnsafe(0)

// buildTx :: Tx -> Buffer -> Buffer
const buildTx = tx =>
(
  compose([
    prop('version', bufferInt32),              // 4 bytes
    prop('vin', bufferInputs(bufferInput)),    // 1-9 bytes (VarInt), Input counter; Variable, Inputs
    prop('vout', bufferInputs(bufferOutput)),  // 1-9 bytes (VarInt), Output counter; Variable, Outputs
    prop('locktime', bufferUInt32),            // 4 bytes
  ])(tx, EMPTY_BUFFER)
)

// compose :: [Fn] -> Tx -> Buffer -> Buffer
const compose = args => (tx, buffer) => {
  typeforce(typeforce.Array, args)
  typeforce(typeforce.Object, tx)
  typeforce(typeforce.Buffer, buffer)
  return args.reduce((buffer, f) => Buffer.concat([buffer, f(tx)]), buffer)
}

const bufferInputs = bufferFn => vins => Buffer.concat(vins.map(bufferFn))

const bufferInput = vin =>
(
  compose([
    prop('hash', bufferHash),                // 32 bytes, Transaction Hash
    prop('index', bufferUInt32),             // 4 bytes, Output Index
    prop('script', bufferVarSlice),          // 1-9 bytes (VarInt), Unlocking-Script Size; Variable, Unlocking-Script
    prop('sequence', bufferUInt32)           // 4 bytes, Sequence Number
  ])(vin, EMPTY_BUFFER)
)

const bufferOutput = vout =>
(
  compose([
    prop('value', bufferUInt64),               // 8 bytes, Amount in satoshis
    prop('script', bufferVarSlice)             // 1-9 bytes (VarInt), Locking-Script Size; Variable, Locking-Script
  ])(vout, EMPTY_BUFFER)
)

const bufferHash = hash => Buffer.from(hash, 'hex')

module.exports = {
  buildTx,
  bufferInput,
  bufferOutput,
  bufferHash
}
