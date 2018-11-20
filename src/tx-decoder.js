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

// readSig :: Buffer -> [ScriptSig, Buffer]
const readSig = buffer => {
  const [ res, bufferLeft ] = readVarSlice(buffer)

  const [ asmPart, asmBufferLeft ] = readVarSlice(res)
  const asm = [ asmPart.toString('hex') ]
  const hashType = asmPart.readUInt8(asmPart.length - 1) & ~0x80
  if (hashType <= 0 || hashType >= 4) throw new Error('Invalid hashType ' + hashType)
  const [ asmPart2 ] = readVarSlice(asmBufferLeft)
  asm.push(asmPart2.toString('hex'))

  return [{ asm: asm.join(' '), hex: res.toString('hex') }, bufferLeft]
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

// readScript :: Buffer -> [ScriptPubKey, Buffer]
const readScript = buffer => {
  const [ scriptBuffer, bufferLeft ] = readVarSlice(buffer)

  return [ {
    hex: scriptBuffer.toString('hex'),
    type: scriptBuffer[0] === bitcoin.opcodes.OP_DUP && scriptBuffer[1] === bitcoin.opcodes.OP_HASH160 ? 'pubkeyhash' : 'nonstandard',
    asm: bitcoin.script.toASM(scriptBuffer),
    addresses: [ bitcoin.address.fromOutputScript(scriptBuffer) ]
  }, bufferLeft ]
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
    addProp('scriptSig', readSig),       // 1-9 bytes (VarInt), Unlocking-Script Size; Variable, Unlocking-Script
    addProp('sequence', readUInt32)           // 4 bytes, Sequence Number
  ])({}, buffer)
)

// readOutput :: Buffer -> [Res, Buffer]
const readOutput = buffer =>
(
  compose([
    addProp('value', readUInt64),             // 8 bytes, Amount in satoshis
    addProp('scriptPubKey', readScript)     // 1-9 bytes (VarInt), Locking-Script Size; Variable, Locking-Script
  ])({}, buffer)
)

// Single SHA3-256.
// hashSha3 :: Buffer -> Buffer
const hashSha3 = buffer => {
  // Note: sha3_256 can accept either Buffer or String, and always outputs String.
  const hashString = sha3_256(buffer)
  return Buffer.from(hashString, 'hex')
}

// createHash :: Object -> Buffer -> Buffer
const createHash = options => data => {
  let hashFn = bcrypto.hash256
  if (options && options.sha === 'SHA3_256') {
    hashFn = hashSha3
  }
  return hashFn(data)
}

// Since a hash is a 256-bit integer and is stored using Little Endian, we reverse it for showing to user (who reads BE).
// getTxId :: Buffer -> String
const getTxId = options => buffer => {
  return createHash(options)(buffer).reverse().toString('hex')
}

module.exports = {
  decodeTx,
  readHash,
  readInputs,
  readInput,
  readOutput,
  createHash,
  getTxId,
  hashSha3
}
