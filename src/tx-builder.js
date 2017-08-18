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

const HASHTYPE = {
  SIGHASH_ALL: 0x01
}

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
    bufferInputs('vin'),                            // 1-9 bytes (VarInt), Input counter; Variable, Inputs
    prop('vout', mapConcatBuffers(bufferOutput)),   // 1-9 bytes (VarInt), Output counter; Variable, Outputs
    prop('locktime', bufferUInt32)                  // 4 bytes
  ])(tx, EMPTY_BUFFER)
)

// buildTxCopy :: Tx -> Buffer
const buildTxCopy = tx =>
(
  compose([
    prop('version', bufferInt32),
    prop('vin', mapConcatBuffers(bufferInputEmptyScript)),
    prop('vout', mapConcatBuffers(bufferOutput)),
    prop('locktime', bufferUInt32)
  ])(tx, EMPTY_BUFFER)
)

const txCopyForHash = (keyPair, tx, index = 0) => {
  const subScript = txCopySubscript(keyPair)
  const txCopy = Object.assign({}, tx)
  txCopy.vin.forEach((vin, i) => vin.script = i === index ? subScript : '')
  // console.log('*** txCopy', txCopy)
  const txCopyBuffer = buildTxCopy(txCopy)
  const hashType = 1
  const txCopyBufferWithType = Buffer.concat([txCopyBuffer, bufferInt32(hashType)])

  return txCopyBufferWithType
}

const txCopySubscript = keyPair =>
(
  bscript.pubKeyHash.output.encode(bcrypto.hash160(keyPair.getPublicKeyBuffer()))
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

// bufferInputEmptyScript :: Object -> Buffer
const bufferInputEmptyScript = vin =>
(
  compose([
    prop('hash', bufferHash),
    prop('index', bufferUInt32),
    prop('script', script => (!script ? bufferVarInt(0) : bufferVarSlice(script))), // Empty script (1 byte 0x00)
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
 * Unlocking script consists of: `<signature> <pubkey>`.
 * The hex should start with the length of the script (var_uint).
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

  const subScript = bscript.pubKeyHash.output.encode(bcrypto.hash160(kpPubKey))
  // TODO: tmp, should pass vin index here.
  const txCopy = Object.assign({}, tx)
  txCopy.vin[0].script = subScript
  const txCopyBuffer = buildTxCopy(txCopy)
  const hashType = 1
  const txCopyBufferWithType = Buffer.concat([txCopyBuffer, bufferInt32(hashType)])

  console.log('*** 1: ' + txCopyBufferWithType.toString('hex'))
  console.log('*** 2: ' + '0100000001a58a349e8d92bb9867884bf4b108da8df77143fbe8fcaf8a0f69a589de1c66a3010000001976a9143c8710460fc63d27e6741dd1927f0ece41e9b55588acffffffff0200c2eb0b000000001976a9147adddcbdf9f0ebcb814e2efb95debda73bfefd9888ace0453577000000001976a9145e9f5c8cc17ecaaea1b4e5a3d091ca0aed1342f788ac0000000001000000')

  const hash = bcrypto.hash256(txCopyBufferWithType)
  const sig = keyPair.sign(hash).toScriptSignature(HASHTYPE.SIGHASH_ALL)

  const scriptBuffer = Buffer.concat([sig, kpPubKey])
  const scriptLen = bufferVarInt(scriptBuffer.length)
  console.log(`sig = ${sig.toString('hex')}`)
  console.log(`kpPubKey = ${kpPubKey.toString('hex')}`)
  console.log(`scriptLen = ${scriptLen.toString('hex')}`)

  return Buffer.concat([scriptLen, scriptBuffer])
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
  buildTxCopy,
  txCopyForHash,
  txCopySubscript,
  bufferInputs,
  bufferInput,
  bufferOutput,
  bufferHash,
  vinScript,
  voutScript,
  bufferInputEmptyScript
}
