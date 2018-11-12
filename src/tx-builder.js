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
const CONSTANTS = require('./constants')

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
  // bufferVarArray,
  mapConcatBuffers
} = require('./buffer-build')
const {
  EMPTY_BUFFER,
  compose,
  prop,
  props,
  addProp,
  iff,
  // iffNot,
  hasNo
} = require('./compose-build')

const { hashSha3 } = require('./tx-decoder')
const { createPubKeyHash, getAddress } = require('./utils')

/**
 * Main function to build a bitcoin transaction. Creates an instance of Buffer.
 * @param {Object} options
 * @param {Object} tx
 * @return {Buffer}
 *
 * ```
 * const txConfig = { version: 1, vin: [...]}
 * const options = {
 *    network: bitcoin.networks.testnet   // or `bitcoin.networks.bitcoin` for mainnet.
 *    sha: 'SHA3'                         // ('SHA256' | 'SHA3' | Fn)
 * }
 * ```
 *
 * Transaction serialization:
 * - Pre-segwit:
 *   `nVersion | txins | txouts | nLockTime`
 * - SegWit:
 *   `nVersion | marker | flag | txins | txouts | witness | nLockTime`
 */
// buildTx :: (Tx, Options) -> Buffer
const buildTx = (tx, options) => {
  options = options || {}
  typeforce(types.TxConfig, tx)
  typeforce(types.TxBuilderOptions, options)

  return compose([
    prop('version', bufferInt32),                             // 4 bytes
    iff(isSegwit(options), addSegwitMarker(options)),
    bufferInputs('vin', bufferInput(options)),                // 1-9 bytes (VarInt), Input counter; Variable, Inputs
    prop('vout', mapConcatBuffers(bufferOutput(options))),    // 1-9 bytes (VarInt), Output counter; Variable, Outputs
    iff(isSegwit(options), prop('vin', addSegwitData(options))),
    prop('locktime', bufferUInt32)                            // 4 bytes
  ])(tx, EMPTY_BUFFER)
}

// buildTxOrig :: (Tx, Options) -> Buffer
const buildTxOrig = (tx, options) => {
  options = options || {}
  typeforce(types.TxConfig, tx)
  typeforce(types.TxBuilderOptions, options)

  return compose([
    prop('version', bufferInt32),                             // 4 bytes
    bufferInputs('vin', bufferInput(options)),                // 1-9 bytes (VarInt), Input counter; Variable, Inputs
    prop('vout', mapConcatBuffers(bufferOutput(options))),    // 1-9 bytes (VarInt), Output counter; Variable, Outputs
    prop('locktime', bufferUInt32)                            // 4 bytes
  ])(tx, EMPTY_BUFFER)
}

// buildTxCopy :: Fn -> Tx -> Buffer
const makeBuildTxCopy = bufferOutput => function makeBuildTxCopyFn (tx) {
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

const txCopyForHash = (buildTxCopy, options) => (keyPair, tx, index, htlcParams) => {
  typeforce(typeforce.tuple(
    types.FunctionType,
    'ECPair',
    types.TxConfig,
    types.Number
  ), [buildTxCopy, keyPair, tx, index])

  const subScript = txCopySubscript(keyPair, htlcParams, options)
  const txCopy = clone(tx)
  txCopy.vin.forEach((vin, i) => { vin.script = i === index ? subScript : '' })
  // console.log('*** txCopy', txCopy)
  const txCopyBuffer = buildTxCopy(txCopy)
  const hashType = 1
  const txCopyBufferWithType = Buffer.concat([txCopyBuffer, bufferInt32(hashType)])

  return txCopyBufferWithType
}

// Requires publicKey to generate address (P2PKH).
const txCopySubscript = function txCopySubscriptFn (keyPair, htlcParams, options) {
  typeforce('ECPair', keyPair)
  // console.log(`txCopySubscript: htlcParams: `, htlcParams)
  if (htlcParams && htlcParams.secretHash) {
    typeforce({
      secretHash: 'String',
      addr: types.Address,
      refundAddr: types.Address,
      timelock: 'Number'
    }, htlcParams)
    typeforce(types.FunctionType, options.hashTimelockContract)
  }
  if (htlcParams && htlcParams.secretHash) {
    const { secretHash, addr, refundAddr, timelock } = htlcParams
    // redeemerAddr, funderAddr, commitment, locktime
    const subscript = options.hashTimelockContract(addr, refundAddr, secretHash, timelock)
    // const subscript2 = Buffer.from('63a82088f1f9dcce43d0aea877b6be5d5ed4b90a470b151ccab39bc8d57584e6be03c78876a914d04a7422caea8c04f93b552c7c9b3caef2a91b306700696888ac', 'hex')
    // console.log(`subscript = ${subscript.toString('hex')}`)
    // console.log(`subscript2 = ${subscript2.toString('hex')}`)

    return subscript
  } else {
    // return bscript.pubKeyHash.output.encode(bcrypto.hash160(keyPair.getPublicKeyBuffer()))
    return bitcoin.payments.p2pkh({
      hash: createPubKeyHash(options)(keyPair.publicKey),
      network: options.network
    }).output
  }
}

// bufferInputs :: (String, Fn) -> Tx -> Buffer
const bufferInputs = (propName, bufferInput) => tx =>
(
  mapConcatBuffers(bufferInput(tx))(tx[propName])
)

// bufferInput :: (Fn -> Options) -> Tx -> (Object, Int) -> Buffer
const makeBufferInput = (buildTxCopy, options) => tx => function makeBufferInputFn (vin, index) {
  typeforce(typeforce.tuple(
    types.FunctionType,
    types.TxConfig,
    types.TxVin,
    types.Number
  ), [buildTxCopy, tx, vin, index])

  return compose([
    prop('txid', bufferTxid),                // 32 bytes, Transaction Hash
    prop('vout', bufferUInt32),              // 4 bytes, Output Index
    addProp(
      'scriptSig',
      props(['keyPair', 'htlc'], vinScript(buildTxCopy, options)(tx, index))
    ),
    // Do not add signature to buffer for SegWit, it will be picked up later for witness data.
    iff(
      isSegwit(options),
      prop('scriptSig', () => bufferVarInt(0)),
      prop('scriptSig', bufferVarSlice('hex'))  // 1-9 bytes (VarInt), Unlocking-Script Size; Variable, Unlocking-Script
    ),
    prop('sequence', bufferUInt32)             // 4 bytes, Sequence Number
  ])(vin, EMPTY_BUFFER)
}

// bufferInputEmptyScript :: Object -> Buffer
const bufferInputEmptyScript = vin =>
(
  compose([
    prop('txid', bufferTxid),
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
const vinScript = (buildTxCopy, options) => (tx, index) => (keyPair, htlc) => {
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

  const kpPubKey = keyPair.publicKey
  const htlcSecretBuffer = htlc && htlc.secret && Buffer.from(htlc.secret, 'hex')

  // Note: for HTLC we use only SHA256 to hash a secret because Bitcoin node does not have SHA3.
  const secretHash = (htlcSecretBuffer && bcrypto.sha256(htlcSecretBuffer).toString('hex')) ||
    (htlc && htlc.secretHash)

  // For the REFUND transaction `receiverAddr` in the left branch of IF belongs to the other user and thus is passed with htlc params.
  const addr = (htlc && htlc.receiverAddr) || getAddress(kpPubKey, options)
  const htlcParams = secretHash && {
    secretHash,
    addr,
    refundAddr: htlc.refundAddr,
    timelock: htlc.timelock
  }

  // SegWit: https://github.com/bitcoin/bips/blob/master/bip-0143.mediawiki#specification
  const txCopyBufferWithType = txCopyForHash(buildTxCopy, options)(keyPair, tx, index, htlcParams)

  // console.log('*** 1: ' + txCopyBufferWithType.toString('hex'))
  // console.log('*** 2: ' + '0100000001a58a349e8d92bb9867884bf4b108da8df77143fbe8fcaf8a0f69a589de1c66a3010000001976a9143c8710460fc63d27e6741dd1927f0ece41e9b55588acffffffff0200c2eb0b000000001976a9147adddcbdf9f0ebcb814e2efb95debda73bfefd9888ace0453577000000001976a9145e9f5c8cc17ecaaea1b4e5a3d091ca0aed1342f788ac0000000001000000')

  // const hash = bcrypto.hash256(txCopyBufferWithType)
  // console.log(`hash          = ${hash.toString('hex')}`)
  // console.log(`hash expected = d27fc0b87c10d49b59196742e2836b89e08df05f0b045aaeaa1bcd1d0278500b`)
  // const sig = keyPair.sign(hash).toScriptSignature(HASHTYPE.SIGHASH_ALL)

  const sig = signBuffer(keyPair, {sha: options.sha})(txCopyBufferWithType)
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

// voutScript :: Options -> Address -> ScriptHex
const voutScript = ({network}) => addr => {
  typeforce(
    typeforce.maybe(typeforce.oneOf(typeforce.value('TESTNET'), typeforce.value('MAINNET'), types.Network)),
    network
  )
  typeforce(types.Address, addr)
  const networkObj = (!network || network === 'TESTNET')
    ? bitcoin.networks.testnet                                        // <<< default
    : (network === 'MAINNET' ? bitcoin.networks.bitcoin : network)
  return baddress.toOutputScript(addr, networkObj)
}

/**
 * Transaction's hash is displayed in a reverse order.
 */
// bufferTxid :: HexString -> Buffer
const bufferTxid = txid => Buffer.from(txid, 'hex').reverse()

/**
 * Implementation specific functions:
 *  - `bufferOutput` in this example creates a regular P2PKH scriptPubKey;
 *  - `buildTxCopy` depends on `bufferOutput`
 *  - `bufferInput` depends on `buildTxCopy`
 * E.g. Equibit blockchain transaction differs from Bitcoin blockchain's with the VOUT structure.
 * @param {Object} options Options
 * @result {Fn}
 */
// bufferOutput :: Options -> (Object -> Buffer)
const bufferOutput = options => makeBufferOutput(
  prop('address', voutScript(options))
)
const buildTxCopy = options => makeBuildTxCopy(bufferOutput(options))
const bufferInput = options => makeBufferInput(buildTxCopy(options), options)

/**
 * Coinbase transaction. Docs: https://bitcoin.org/en/developer-reference#coinbase
 * @param tx
 */
// buildCoinbaseTx :: Object -> Buffer
const buildCoinbaseTx = (tx, options = {}) =>
(
  compose([
    prop('version', bufferInt32),                   // 4 bytes, version
    prop('vin', mapConcatBuffers(coinbaseInput)),   // a coinbase input
    prop('vout', mapConcatBuffers(bufferOutput(options))),   // 1-9 bytes, vout
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
    () => bufferUInt32(0xffffffff)          // 4 bytes, sequence number 4294967295
  ])(vin, EMPTY_BUFFER)
)

// coinbaseScript :: Integer -> Buffer
const coinbaseScript = blockHeight => {
  const blockHeightBuffer = bufferVarInt(blockHeight)
  const arbitraryData = Buffer.allocUnsafe(10)
  const bVarInt = bufferVarInt(blockHeightBuffer.length + arbitraryData.length)
  return Buffer.concat([bVarInt, blockHeightBuffer, arbitraryData])
}

// signBuffer :: (KeyPair, Object) -> MessageBuffer -> SignatureBuffer
const signBuffer = (keyPair, options) => function signBufferFn (buffer) {
  let createHash = bcrypto.hash256
  typeforce('ECPair', keyPair)
  if (options && options.sha === 'SHA3_256') {
    createHash = hashSha3
  }
  const hash = createHash(buffer)

  // return keyPair.sign(hash).toScriptSignature(HASHTYPE.SIGHASH_ALL)
  return bscript.signature.encode(keyPair.sign(hash), HASHTYPE.SIGHASH_ALL)
}

// If one of the VINs has type P2PKH then it requires SegWit serialization.
// isSegwit :: Object -> Object -> Boolean
const isSegwit = options => tx => {
  if (tx.vin) {
    return tx.vin.reduce((acc, { type }) => (acc || type === 'P2WPKH'), false)
  } else {
    // If an individual vin is passed:
    return tx.type === 'P2WPKH'
  }
}

const addSegwitMarker = options => tx => {
  return compose([
    () => bufferUInt8(CONSTANTS.ADVANCED_TRANSACTION_MARKER),
    () => bufferUInt8(CONSTANTS.ADVANCED_TRANSACTION_FLAG)
  ])(tx, EMPTY_BUFFER)
}

// Witnesses consist of a stack of byte arrays. It is encoded as a var_int item count followed by each item encoded
// as a var_int length followed by a string of bytes.
// addSegwitData :: Object -> Array -> Buffer
const addSegwitData = options => vin => {
  // const witnesses = vin.map(({scriptSig}) => scriptSig)
  // return bufferVarArray(witnesses)
  // console.log('addSegwitData:::')
  // console.log('- bufferVarInt(2):', bufferVarInt(2))
  // console.log('- vin.scriptSig:', vin[0].scriptSig)
  const witnesses = Buffer.concat([bufferVarInt(2), vin[0].scriptSig])
  return witnesses
}

module.exports = {
  buildTx,
  buildTxOrig,
  buildTxCopy,
  txCopyForHash,
  txCopySubscript,
  bufferInputs,
  bufferInput,
  bufferOutput,
  bufferTxid,
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
  signBuffer,
  isSegwit,
  addSegwitMarker,
  addSegwitData
}
