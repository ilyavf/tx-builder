// bitcoinjs-lib:
// const tx = new bitcoin.TransactionBuilder( network )
// tx.addInput( transactionHash, vout )
// tx.addOutput( scriptPubKey, value )
// tx.sign( vin, keyPair )
// tx.build().toHex()

const typeforce = require('typeforce')
const types = require('./types')
const { clone } = require('ramda')
const Buffer = require('safe-buffer').Buffer
const bitcoin = require('bitcoinjs-lib')
const bcrypto = bitcoin.crypto
const bscript = bitcoin.script
const baddress = bitcoin.address

const HASHTYPE = {
  SIGHASH_ALL: 0x01
}

const {
  bufferUInt8,
  bufferInt32,
  bufferUInt32,
  bufferUInt64,
  bufferVarInt,
  bufferVarSlice,
  mapConcatBuffers
} = require('./buffer-build')
const {
  compose,
  prop,
  props,
  addProp,
  iff,
  hasNo
} = require('./compose-build')

const EMPTY_BUFFER = Buffer.allocUnsafe(0)

/**
 * Main function to build a bitcoin transaction. Creates an instance of Buffer.
 * @param {Object} tx
 * @return {Buffer}
 */
// buildTx :: Tx -> Buffer
const buildTx = tx => {
  typeforce(types.TxConfig, tx)

  return compose([
    prop('version', bufferInt32),                   // 4 bytes
    bufferInputs('vin', bufferInput),               // 1-9 bytes (VarInt), Input counter; Variable, Inputs
    prop('vout', mapConcatBuffers(bufferOutput)),   // 1-9 bytes (VarInt), Output counter; Variable, Outputs
    prop('locktime', bufferUInt32)                  // 4 bytes
  ])(tx, EMPTY_BUFFER)
}

// buildTxCopy :: Fn -> Tx -> Buffer
const makeBuildTxCopy = bufferOutput => tx => {
  typeforce(typeforce.tuple(
    types.FunctionType,
    types.TxConfig
  ), [bufferOutput, tx])

  return compose([
    prop('version', bufferInt32),
    prop('vin', mapConcatBuffers(bufferInputEmptyScript)),
    prop('vout', mapConcatBuffers(bufferOutput)),
    prop('locktime', bufferUInt32)
  ])(tx, EMPTY_BUFFER)
}

const txCopyForHash = buildTxCopy => (keyPair, tx, index, htlcParams) => {
  typeforce(typeforce.tuple(
    types.FunctionType,
    'ECPair',
    types.TxConfig,
    types.Number
  ), [buildTxCopy, keyPair, tx, index])

  const subScript = txCopySubscript(keyPair, htlcParams)
  const txCopy = clone(tx)
  txCopy.vin.forEach((vin, i) => { vin.script = i === index ? subScript : '' })
  // console.log('*** txCopy', txCopy)
  const txCopyBuffer = buildTxCopy(txCopy)
  const hashType = 1
  const txCopyBufferWithType = Buffer.concat([txCopyBuffer, bufferInt32(hashType)])

  return txCopyBufferWithType
}

const { hashTimelockContract } = require('tx-builder-equibit/src/script-builder')

const txCopySubscript = (keyPair, htlcParams) => {
  typeforce('ECPair', keyPair)
  console.log(`txCopySubscript: htlcParams: `, htlcParams)
  if (htlcParams && htlcParams.secretHash) {
    typeforce({
      secretHash: 'String',
      addr: types.Address,
      refundAddr: types.Address,
      timelock: 'Number'
    }, htlcParams)
  }
  if (htlcParams && htlcParams.secretHash) {
    const { secretHash, addr, refundAddr, timelock } = htlcParams
    // redeemerAddr, funderAddr, commitment, locktime
    const subscript = hashTimelockContract(addr, refundAddr, secretHash, timelock)
    // const subscript2 = Buffer.from('63a82088f1f9dcce43d0aea877b6be5d5ed4b90a470b151ccab39bc8d57584e6be03c78876a914d04a7422caea8c04f93b552c7c9b3caef2a91b306700696888ac', 'hex')
    console.log(`subscript = ${subscript.toString('hex')}`)
    // console.log(`subscript2 = ${subscript2.toString('hex')}`)

    return subscript
  } else {
    return bscript.pubKeyHash.output.encode(bcrypto.hash160(keyPair.getPublicKeyBuffer()))
  }
}

// bufferInputs :: (String, Fn) -> Tx -> Buffer
const bufferInputs = (propName, bufferInput) => tx =>
(
  mapConcatBuffers(bufferInput(tx))(tx[propName])
)

// bufferInput :: Fn -> Tx -> (Object, Int) -> Buffer
const makeBufferInput = buildTxCopy => tx => (vin, index) => {
  typeforce(typeforce.tuple(
    types.FunctionType,
    types.TxConfig,
    types.TxVin,
    types.Number
  ), [buildTxCopy, tx, vin, index])

  return compose([
    prop('txid', bufferHash),                // 32 bytes, Transaction Hash
    prop('vout', bufferUInt32),              // 4 bytes, Output Index
    addProp(
      'scriptSig',
      props(['keyPair', 'htlc'], vinScript(buildTxCopy)(tx, index))
    ),
    prop('scriptSig', bufferVarSlice('hex')),  // 1-9 bytes (VarInt), Unlocking-Script Size; Variable, Unlocking-Script
    prop('sequence', bufferUInt32)             // 4 bytes, Sequence Number
  ])(vin, EMPTY_BUFFER)
}

// bufferInputEmptyScript :: Object -> Buffer
const bufferInputEmptyScript = vin =>
(
  compose([
    prop('txid', bufferHash),
    prop('vout', bufferUInt32),
    prop('script', script => (!script ? bufferVarInt(0) : bufferVarSlice('hex')(script))), // Empty script (1 byte 0x00)
    prop('sequence', bufferUInt32)
  ])(vin, EMPTY_BUFFER)
)

// makeBufferOutput :: ScriptBuilder -> (Object -> Buffer)
const makeBufferOutput = scriptPubKey => vout =>
(
  compose([
    prop('value', bufferUInt64),               // 8 bytes, Amount in satoshis
    iff(
      hasNo('scriptPubKey'),
      addProp('scriptPubKey', scriptPubKey)
    ),
    prop('scriptPubKey', bufferVarSlice('hex'))       // 1-9 bytes (VarInt), Locking-Script Size; Variable, Locking-Script
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
const vinScript = buildTxCopy => (tx, index) => (keyPair, htlc) => {
  typeforce(typeforce.tuple(
    types.TxConfig,
    types.Number,
    'ECPair',
    typeforce.maybe({
      secret: '?String',
      secretHash: '?String',
      refundAddr: types.Address,
      timelock: 'Number'
    })
  ), [tx, index, keyPair, htlc])

  let scriptBuffer

  const kpPubKey = keyPair.getPublicKeyBuffer()
  const htlcSecretBuffer = htlc && htlc.secret && Buffer.from(htlc.secret, 'hex')
  const secretHash = (htlcSecretBuffer && bcrypto.sha256(htlcSecretBuffer).toString('hex')) ||
    (htlc && htlc.secretHash)
  // For the REFUND transaction `receiverAddr` in the left branch of IF belongs to the other user and thus is passed with htlc params.
  const addr = (htlc && htlc.receiverAddr) || keyPair.getAddress()
  const htlcParams = secretHash && {
    secretHash,
    addr,
    refundAddr: htlc.refundAddr,
    timelock: htlc.timelock
  }
  const txCopyBufferWithType = txCopyForHash(buildTxCopy)(keyPair, tx, index, htlcParams)

  // console.log('*** 1: ' + txCopyBufferWithType.toString('hex'))
  // console.log('*** 2: ' + '0100000001a58a349e8d92bb9867884bf4b108da8df77143fbe8fcaf8a0f69a589de1c66a3010000001976a9143c8710460fc63d27e6741dd1927f0ece41e9b55588acffffffff0200c2eb0b000000001976a9147adddcbdf9f0ebcb814e2efb95debda73bfefd9888ace0453577000000001976a9145e9f5c8cc17ecaaea1b4e5a3d091ca0aed1342f788ac0000000001000000')

  // const hash = bcrypto.hash256(txCopyBufferWithType)
  // console.log(`hash          = ${hash.toString('hex')}`)
  // console.log(`hash expected = d27fc0b87c10d49b59196742e2836b89e08df05f0b045aaeaa1bcd1d0278500b`)
  // const sig = keyPair.sign(hash).toScriptSignature(HASHTYPE.SIGHASH_ALL)

  const sig = signBuffer(keyPair)(txCopyBufferWithType)
  // console.log(`sig          = ${sig.toString('hex')}`)
  // console.log(`sig expected = 30440220764bbe9ddff67409310c04ffb34fe937cc91c3d55303158f91a32bed8d9d7a7b02207fb30f6b9aaef93da8c88e2b818d993ad65aae54860c3de56c6304c57252cce101`)

  const sigLength = bufferUInt8(sig.length)
  const pubkeyLength = bufferUInt8(kpPubKey.length)
  // const scriptBuffer = bscript.compile([sig, kpPubKey])

  // HTLC: to unlock HTLC script we need to add a secret to the end of the unlocking script:
  if (htlc && htlc.secret) {
    const secretBuffer = Buffer.from(htlc.secret, 'hex')
    const secretLength = bufferUInt8(secretBuffer.length)

    scriptBuffer = Buffer.concat([sigLength, sig, pubkeyLength, kpPubKey, secretLength, secretBuffer, bufferUInt8(81)])
    // scriptBuffer = Buffer.concat([pubkeyLength, kpPubKey, secretLength, secretBuffer])
    // scriptBuffer = Buffer.concat([secretLength, secretBuffer, bufferUInt8(81)])
  } else if (htlc && htlc.secretHash) {
    // HTLC: to unlock HTLC script which timelock has expired we need to invoke the ELSE part of the HTLC script:
    // (this case is identified based on the fact that secret is not passed but secretHash is).
    scriptBuffer = Buffer.concat([sigLength, sig, pubkeyLength, kpPubKey, bufferUInt8(0)])
  } else {
    scriptBuffer = Buffer.concat([sigLength, sig, pubkeyLength, kpPubKey])
  }

  return scriptBuffer
}

// voutScript :: NetworkConfig -> Address -> ScriptHex
const voutScript = network => addr => {
  typeforce(types.Address, addr)
  return baddress.toOutputScript(addr, network)
}

/**
 * Transaction's hash is displayed in a reverse order.
 */
// bufferHash :: HexString -> Buffer
const bufferHash = hash => Buffer.from(hash, 'hex').reverse()

/**
 * Implementation specific functions:
 *  - `bufferOutput` in this example creates a regular P2PKH scriptPubKey;
 *  - `buildTxCopy` depends on `bufferOutput`
 *  - `bufferInput` depends on `buildTxCopy`
 * E.g. Equibit blockchain transaction differs from Bitcoin blockchain's with the VOUT structure.
 */
// bufferOutput :: Object -> Buffer
const bufferOutput = makeBufferOutput(
  prop('address', voutScript(bitcoin.networks.testnet))
)
const buildTxCopy = makeBuildTxCopy(bufferOutput)
const bufferInput = makeBufferInput(buildTxCopy)

/**
 * Coinbase transaction. Docs: https://bitcoin.org/en/developer-reference#coinbase
 * @param tx
 */
// buildCoinbaseTx :: Object -> Buffer
const buildCoinbaseTx = tx =>
(
  compose([
    prop('version', bufferInt32),                   // 4 bytes, version
    prop('vin', mapConcatBuffers(coinbaseInput)),   // a coinbase input
    prop('vout', mapConcatBuffers(bufferOutput)),   // 1-9 bytes, vout
    prop('locktime', bufferUInt32)                  // 4 bytes
  ])(tx, EMPTY_BUFFER)
)

// coinbaseInput :: Object<blockHeight> => Buffer
const coinbaseInput = (vin) =>
(
  compose([
    () => Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex'),  // 32 bytes, txid
    () => Buffer.from('ffffffff', 'hex'),   // 4 bytes, vout
    prop('blockHeight', coinbaseScript),    // 4+ bytes (VarInt), coinbase script contains block height and arbitrary data
    () => bufferUInt32(4294967295)          // 4 bytes, sequence number
  ])(vin, EMPTY_BUFFER)
)

// coinbaseScript :: Integer -> Buffer
const coinbaseScript = blockHeight => {
  const blockHeightBuffer = bufferVarInt(blockHeight)
  const arbitraryData = Buffer.allocUnsafe(10)
  const bVarInt = bufferVarInt(blockHeightBuffer.length + arbitraryData.length)
  return Buffer.concat([bVarInt, blockHeightBuffer, arbitraryData])
}

// signBuffer :: keyPair -> MessageBuffer -> SignatureBuffer
const signBuffer = keyPair => buffer => {
  const hash = bcrypto.hash256(buffer)
  return keyPair.sign(hash).toScriptSignature(HASHTYPE.SIGHASH_ALL)
}

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
  bufferInputEmptyScript,
  mapConcatBuffers,
  makeBufferInput,
  makeBufferOutput,
  makeBuildTxCopy,
  buildCoinbaseTx,
  coinbaseInput,
  coinbaseScript,
  signBuffer
}
