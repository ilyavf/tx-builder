// bitcoinjs-lib:
// const tx = new bitcoin.TransactionBuilder( network )
// tx.addInput( transactionHash, vout )
// tx.addOutput( scriptPubKey, value )
// tx.sign( vin, keyPair )
// tx.build().toHex()

const Buffer = require('safe-buffer').Buffer
const bitcoin = require('bitcoinjs-lib')
const bcrypto = bitcoin.crypto
const bscript = bitcoin.script
const baddress = bitcoin.address

const {
  bufferInt32,
  bufferUInt32,
  bufferUInt64,
  bufferVarInt,
  bufferVarSlice
} = require('./buffer-build')
const {
  compose,
  prop,
  addProp
} = require('./compose-build')

const EMPTY_BUFFER = Buffer.allocUnsafe(0)

/**
 * Main function to build a bitcoin transaction. Creates an instance of Buffer.
 * @param {Object} tx
 * @return {Buffer}
 */
// buildTx :: Tx -> Buffer
const buildTx = tx =>
(
  compose([
    prop('version', bufferInt32),                   // 4 bytes
    prop('vout', mapConcatBuffers(bufferOutput)),   // 1-9 bytes (VarInt), Output counter; Variable, Outputs
    bufferInputs('vin'),                            // 1-9 bytes (VarInt), Input counter; Variable, Inputs
    prop('locktime', bufferUInt32)                  // 4 bytes
  ])(tx, EMPTY_BUFFER)
)

const buildTxCopy = tx =>
(
  compose([
    prop('version', bufferInt32),
    prop('vout', mapConcatBuffers(bufferOutput)),
    prop('vin', mapConcatBuffers(bufferInputEmptyScript)),
    prop('locktime', bufferUInt32)
  ])(tx, EMPTY_BUFFER)
)

// bufferInputs :: String -> Tx -> Buffer
const bufferInputs = propName => tx =>
(
  mapConcatBuffers(bufferInput(tx))(tx[propName])
)

// mapConcatBuffers :: Fn -> Array -> Buffer
const mapConcatBuffers = bufferFn => vins =>
(
  Buffer.concat(
    [bufferVarInt(vins.length)].concat(vins.map(bufferFn))
  )
)

// bufferInput :: Tx -> Object -> Buffer
const bufferInput = tx => vin =>
(
  compose([
    prop('hash', bufferHash),                // 32 bytes, Transaction Hash
    prop('index', bufferUInt32),             // 4 bytes, Output Index
    addProp(
      'scriptSig',
      prop('keyPair', vinScript(tx))
    ),
    prop('scriptSig', bufferVarSlice),       // 1-9 bytes (VarInt), Unlocking-Script Size; Variable, Unlocking-Script
    prop('sequence', bufferUInt32)           // 4 bytes, Sequence Number
  ])(vin, EMPTY_BUFFER)
)

const bufferInputEmptyScript = vin =>
(
  compose([
    prop('hash', bufferHash),
    prop('index', bufferUInt32),
    () => bufferVarInt(0),                   // Empty script (1 byte 0x00)
    prop('sequence', bufferUInt32)
  ])(vin, EMPTY_BUFFER)
)

// bufferOutput :: Object -> Buffer
const bufferOutput = vout =>
(
  compose([
    prop('value', bufferUInt64),               // 8 bytes, Amount in satoshis
    addProp(
      'scriptPubKey',
      prop('address', voutScript)
    ),
    prop('scriptPubKey', bufferVarSlice)       // 1-9 bytes (VarInt), Locking-Script Size; Variable, Locking-Script
  ])(vout, EMPTY_BUFFER)
)

/**
 * Unlocking script consists of: `<signature> <pubkey>`
 * See: https://en.bitcoin.it/wiki/OP_CHECKSIG#How_it_works
 * - A copy is made of the current transaction (hereby referred to txCopy)
 * - The scripts for all transaction inputs in txCopy are set to empty scripts (exactly 1 byte 0x00)
 * - The script for the current transaction input in txCopy is set to subScript (lead in by its length as a var-integer encoded!)
 * - The last byte of the sig is the hashtype:
 *   - SIGHASH_ALL (0x00000001)
 *   - SIGHASH_NONE (0x00000002)
 *   - SIGHASH_SINGLE (0x00000003)
 *   - SIGHASH_ANYONECANPAY (0x00000080)
 */
const vinScript = tx => keyPair => {
  const kpPubKey = keyPair.getPublicKeyBuffer()
  const txCopy = Object.assign({}, tx)
  const script = bscript.pubKeyHash.output.encode(bcrypto.hash160(kpPubKey))
  // console.log(`script = ${script}`)
  return script
}

// TODO: pass network as a param.
// voutScript :: Address -> ScriptHex
const voutScript = addr => baddress.toOutputScript(addr, bitcoin.networks.testnet)

/**
 * Transaction's hash is displayed in a reverse order.
 */
// bufferHash :: HexString -> Buffer
const bufferHash = hash => Buffer.from(hash, 'hex').reverse()

module.exports = {
  buildTx,
  bufferInputs,
  bufferInput,
  bufferOutput,
  bufferHash,
  vinScript,
  voutScript,
  bufferInputEmptyScript
}
