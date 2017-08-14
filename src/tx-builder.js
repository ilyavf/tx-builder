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
    prop('version', bufferInt32),              // 4 bytes
    prop('vin', bufferInputs(bufferInput)),    // 1-9 bytes (VarInt), Input counter; Variable, Inputs
    prop('vout', bufferInputs(bufferOutput)),  // 1-9 bytes (VarInt), Output counter; Variable, Outputs
    prop('locktime', bufferUInt32)             // 4 bytes
  ])(tx, EMPTY_BUFFER)
)

// bufferInputs :: Fn -> [Object] -> Buffer
const bufferInputs = bufferFn => vins =>
(
  Buffer.concat(
    [bufferVarInt(vins.length)].concat(vins.map(bufferFn))
  )
)

// bufferInput :: Object -> Buffer
const bufferInput = vin =>
(
  compose([
    prop('hash', bufferHash),                // 32 bytes, Transaction Hash
    prop('index', bufferUInt32),             // 4 bytes, Output Index
    addProp('scriptSig', vinScript),
    prop('scriptSig', bufferVarSlice),       // 1-9 bytes (VarInt), Unlocking-Script Size; Variable, Unlocking-Script
    prop('sequence', bufferUInt32)           // 4 bytes, Sequence Number
  ])(vin, EMPTY_BUFFER)
)

// bufferOutput :: Object -> Buffer
const bufferOutput = vout =>
(
  compose([
    prop('value', bufferUInt64),               // 8 bytes, Amount in satoshis
    addProp('scriptPubKey', voutScript('address')),
    prop('scriptPubKey', bufferVarSlice)       // 1-9 bytes (VarInt), Locking-Script Size; Variable, Locking-Script
  ])(vout, EMPTY_BUFFER)
)

const vinScript = ({keyPair}) => {
  const kpPubKey = keyPair.getPublicKeyBuffer()
  const script = bscript.pubKeyHash.output.encode(bcrypto.hash160(kpPubKey))
  // console.log(`script = ${script}`)
  return script
}

// TODO: pass network as a param.
// voutScript :: String -> Object<Address> -> ScriptHex
const voutScript = propName => tx => baddress.toOutputScript(tx[propName], bitcoin.networks.testnet)

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
  voutScript
}
