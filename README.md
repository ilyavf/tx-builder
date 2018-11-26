# tx-builder
Composable helpers for building and decoding blockchain transactions

[![Build Status](https://travis-ci.org/ilyavf/tx-builder.png?branch=master)](https://travis-ci.org/ilyavf/tx-builder)

### Table of Contents

- [Intro](#intro)
  - [Install](#install)
  - [Usage](#usage)
- [API](#api)
  - [Decoder](#decoder)
  - [Builder](#builder)
  - [Hash, Signature, etc](#hash-and-signature)
- [Examples](#examples)
  - [Decoding a transaction](#decoding-a-transaction)
  - [Building a transaction](#building-a-transaction)
  - [Coinbase transaction](#coinbase-transaction)
- [Notes on monadic composition](notes-on-monadic-composition.md)
- [Upcoming](#upcoming)
- [Release Notes](#release-notes)

## Intro

This package contains **composable helpers** for **building** and **decoding** a blockchain transaction and implements an example of bitcoin transaction builder and decoder.

It can be useful for blockchain projects forked from BitcoinCore that want to add **custom data to a transaction**.

For decoding a transaction the composable helpers expect a buffer and return a pair (array of two elements) of a result and a buffer left.

Compared to `bitcoinjs-lib` which implements decoding in an imperative style where every helper uses `buffer`
of the outer scope and mutates outer `offset`. Thus its helpers cannot be reused for a different transaction structure.

### Install

npm install tx-builder

### Usage

For more examples see section [Examples](#examples)

```javascript
const Buffer = require("safe-buffer").Buffer
const { readInt32, readUInt32 } = require("tx-builder/src/buffer-read")
const { compose, addProp } = require("tx-builder/src/compose-read")
const { readInputs, readInput, readOutput } = require("tx-builder/src/tx-decoder")

const decodeTx = buffer =>
(
  compose([
    addProp('version', readInt32),            // 4 bytes
    addProp('vin', readInputs(readInput)),    // 1-9 bytes (VarInt), Input counter; Variable, Inputs
    addProp('vout', readInputs(readOutput)),  // 1-9 bytes (VarInt), Output counter; Variable, Outputs
    addProp('locktime', readUInt32)           // 4 bytes
  ])({}, buffer)
)
```

## API

*All buffer helpers assume Little Endian.*

The package exports two objects: `decoder` and `buider`. Each of them contains `bufferHelpers`, `composeHelpers`
and high-level helpers (e.g. `decodeTx` and `buildTx`). Main export also contains `hashFromBuffer` and `signBuffer` functions.

```js
const { decoder, builder, hashFromBuffer, signBuffer } = require("tx-builder")
```

### Decoder
  - **Buffer helpers**. Each helper returns a value that contains a pair (array of two values) - a result and a buffer left after reading.
    - `readInt32 :: Buffer -> (Number, Buffer)` Reads 32-bit integer.
    - `readUInt32 :: Buffer -> (Number, Buffer)` Reads 32-bit unsigned integer.
    - `readUInt64 :: Buffer -> (Number, Buffer)` Reads 64-bit unsigned integer.
    - `readVarInt :: Buffer -> (Number, Buffer)` Reads variable length integer.
    - `readSlice :: Number -> Buffer -> (Buffer, Buffer)` Reads the given number of bytes from the buffer.
    - `readVarSlice :: Buffer -> (ResBuffer, Buffer)` Reads variable length slice.
  - **Composition helpers**. Each helper returns a pair - updated state and a leftover buffer.
    - `compose :: [Fn] -> State -> Buffer -> [State, Buffer]` Composes the given array of functions.
    - `addProp :: PropName -> Fn -> (State -> Buffer -> [State, Buffer])` Adds given property to the state object.
  - **High-level helpers**. Each helper returns a pair - a result and a leftover buffer.
    - `decodeTx :: Buffer -> (Object, Buffer)` Reads a buffer of a whole transaction.
    - `readHash :: Buffer -> (String, Buffer)` Reads buffer that contains a transaction hash (TXID).
    - `readInputs :: Fn -> Buffer -> (Res, Buffer)` Applies the given function to array of items. To read transaction inputs (VIN) or outputs (VOUT).
    - `readInput :: Buffer -> (Res, Buffer)` Reads a buffer that contains transaction input (VIN)
    - `readOutput :: Buffer -> (Res, Buffer)` Reads a buffer that contains transaction output (VOUT)
    - `getTxId :: Buffer -> String` Given transaction buffer calculates transaction hash (TXID).

```js
const decoder = require('tx-builder').decoder           // Main `decoder` container.
const { decodeTx, readHash, getTxId } = decoder         // High-level methods.
const { readInt32, readVarInt, readVarSlice } = decoder // Buffer helpers.
const { compose as composeDecoder, addProp } = decoder  // Composition helpers.
```

### Builder
  - **Buffer helpers**.
    - `bufferUInt8 :: Int -> Buffer` Creates a buffer that contains the given 8-bit unsigned integer.
    - `bufferInt32 :: Int -> Buffer`
    - `bufferInt32 :: Int -> Buffer`
    - `bufferUInt64 :: Int -> Buffer`
    - `bufferVarInt :: Int -> Buffer` Creates a buffer that contains a variable length integer.
    - `bufferVarSlice :: Encoding -> String -> Buffer` Creates a buffer that contains a variable length string of the given encoding.
    - `bufferVarSliceBuffer :: Buffer -> Buffer` Creates a variable length buffer with from the given buffer value.
    - `bufferVarArray :: Array -> Buffer` Creates an buffer from array of buffers in format: `<itemsCount><item1Length><item1>...`
    - `mapConcatBuffers :: Fn -> Array -> Buffer` Maps function to array elements and concats results into a buffer.
  - **Composition helpers**.
    - `compose :: [Fn] -> Tx -> Buffer -> Buffer`
    - `prop :: String -> Fn -> (Obj -> Buffer)`
    - `addProp :: String -> Fn -> Obj -> Buffer`
  - **High-level helpers**. See `test/tx-build.test.js` for examples of usage. Some of this helpers can be reused for a specific blockchain implementation. E.g. see package `tx-builder-equibit` for [Equibit Securities Platform ](https://equibitgroup.com/) implementation.
    - `buildTx :: (Tx, Options) -> Buffer` Main function to build a bitcoin transaction. Returns an instance of Buffer. Options are:
      - `network`: "TESTNET", "MAINNET" or custom.
      - `sha`: to support "SHA3_256", default: "SHA256";
      - `hashTimelockContract`: function that resolves to HTLC contract string.
    - buildTxCopy,
    - txCopyForHash,
    - txCopySubscript,
    - bufferInputs,
    - bufferInput,
    - `bufferOutput :: Object -> Buffer` Returns a buffer that contains transaction VOUT (value, scriptPubKey).
    - `bufferHash :: HexString -> Buffer` Returns a buffer that contains transaction hex (note: because of Little Endian txid in buffer is reversed).
    - vinScript,
    - `voutScript :: NetworkConfig -> Address -> ScriptHex` Given a bitcoin address creates a VOUT script.
    - bufferInputEmptyScript,
    - mapConcatBuffers,
    - makeBufferInput,
    - makeBuildTxCopy,
    - `makeBufferOutput :: ScriptBuilder -> (Object -> Buffer)` Allows to customise a locking script (`scriptPubKey`).

```js
const builder = require('tx-builder').builder        // Main `builder` container.
const { buildTx, vinScript } = builder               // High-level helpers.
const { bufferUInt8, bufferVarInt, mapConcatBuffers } = builder   // Buffer helpers.
const { compose, prop, addProp } = builder                        // Composition helpers.
```

### Hash and Signature
  - `hashFromBuffer :: Buffer -> String` Given a buffer calculates hash. E.g. transaction id is a hash.
  - `signBuffer :: keyPair -> MessageBuffer -> SignatureBuffer` Given a buffer calculates its hash and signs it.
  - `pow :: Number -> (Buffer, Number, Number) -> NonceNumber` Given a difficulty and a Buffer finds a nonce number (Proof of Work).

```js
const { hashFromBuffer, signBuffer, pow } = require("tx-builder")
```

## Examples

If you are not familiar with how to decode a transaction in general checkout `tests/manual-decode.js`. It has a step-by-step imperative-style example.

Also, feel free to checkout tests for precise examples of how to use the package helpers.

To convert a hex string into buffer:
```javascript
const hexString = "0f015a"
const buffer = Buffer.from(hexString, "hex")
```

To convert a buffer into a hex string:
```javascript
const hexString = buffer.toString("hex")
```

### Decoding a transaction

Here is how Bitcoin transaction decoder is implemented:
```javascript
const Buffer = require("safe-buffer").Buffer
const { readInt32, readUInt32 } = require("tx-builder/src/buffer-read")
const { compose, addProp } = require("tx-builder/src/compose-read")
const { readInputs, readInput, readOutput } = require("tx-builder/src/tx-decoder")

// Create a buffer from a transaction hex:
const txHex = "0100000001545f6161d2be3bdfe71..."   // see `test/fixtures/tx-hex-decoded.js` for a full tx example
const buffer = Buffer.from(txHex, 'hex')

// decodeTx :: Buffer -> [Object<version,vin,vout,locktime>, BufferLeft]
const decodeTx = buffer =>
(
  compose([
    addProp('version', readInt32),            // 4 bytes
    addProp('vin', readInputs(readInput)),    // 1-9 bytes (VarInt), Input counter; Variable, Inputs
    addProp('vout', readInputs(readOutput)),  // 1-9 bytes (VarInt), Output counter; Variable, Outputs
    addProp('locktime', readUInt32)           // 4 bytes
  ])({}, buffer)
)

console.log( decodeTx( buffer ) )
// > [{version: 1, vin: [...], vout: [...]}, <Buffer >]
```

Here is how `readInput` is defined in the same composable manner:
```javascript
const { readSlice, readVarSlice, readUInt32 } = require("tx-builder/src/buffer-read")
const { compose, addProp } = require("tx-builder/src/compose-read")

// readInput :: Buffer -> [Res, Buffer]
const readInput = buffer =>
(
  compose([
    addProp('hash', readSlice(32)),           // 32 bytes, Transaction Hash
    addProp('index', readUInt32),             // 4 bytes, Output Index
    addProp('script', readVarSlice),          // 1-9 bytes (VarInt), Unlocking-Script Size; Variable, Unlocking-Script
    addProp('sequence', readUInt32)           // 4 bytes, Sequence Number
  ])({}, buffer)
)
```


### Building a transaction

Here is how Bitcoin transaction builder is implemented
(see `src/tx-builder.js` for a full example):
```javascript
const Buffer = require("safe-buffer").Buffer
const { bufferInt32, bufferUInt32 } = require("tx-builder/src/buffer-build")
const { compose, prop } = require("tx-builder/src/compose-build")
const { bufferInputs, bufferInput, bufferOutput } = require("tx-builder/src/tx-builder")

// Given a transaction JSON:
// (see `test/fixture.js` for a full tx example)
const tx = {
  version: 1,
  locktime: 0,
  vin: [{
      txid: '2d7a9f0534ddac231ef1978bda388791c32321f7e14e18e7df3bbed261615f54',
      index: 1,
      script: '4830450221008c33d...',
      sequence: '4294967295'
  }],
  vout: [{
    value: 100000000,
    script: '76a91461ca8116d03694952a3ad252d53c695da7d95f6188ac'
  }, { ... }]
}

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

console.log( buildTx( tx ).toString( 'hex' ) )
// > "0100000001545f6161d2be3bdfe7184ee1f7..."
```

The full implementation allows to pass options:
```js
const builder = require('tx-builder')
const buildTx = builder.buildTx

const txConfig = {
  version: 1,
  locktime: 0,
  vin: [{ ... }],
  ...
}

const options = {
  network: "TESTNET",     // which is default; enum("TESTNET", "MAINNET")
  sha: "SHA3_256",        // default: "SHA256"; enum("SHA256", "SHA3_256")
}

const txBuffer = buildTx(txConfig, options)
```

### Coinbase transaction

According to [spec](https://bitcoin.org/en/developer-reference#coinbase) a coinbase transaction should contain one
input that has a 32-byte null transaction id and `0xffffffff` index (since there is no previous output), and a script
that is of a variable lenge and contains block height (BIP34) and some arbitrary data (aka _extranonce_ that contributes
to enlarge the domain for the proof of work function).

A coinbase transaction builder can be made as:
```js
// buildCoinbaseTx :: Object => Buffer
const buildCoinbaseTx = tx =>
(
  compose([
    prop('version', bufferInt32),                   // 4 bytes, version
    prop('vin', mapConcatBuffers(coinbaseInput)),   // <<<< COINBASE INPUT
    prop('vout', mapConcatBuffers(bufferOutput)),   // 1-9 bytes, vout
    prop('locktime', bufferUInt32)                  // 4 bytes, locktime
  ])(tx, EMPTY_BUFFER)
)

// coinbaseInput :: Object<blockHeight> => Buffer
const coinbaseInput = (vin) =>
(
  compose([
    () => Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex'),  // 32 bytes, txid
    () => Buffer.from('ffffffff', 'hex'),   // 4 bytes, vout
    prop('blockHeight', coinbaseScript),    // <<<< COINBASE SCRIPT, contains block height and arbitrary data
    () => bufferUInt32(4294967295)          // 4 bytes, sequence number
  ])(vin, EMPTY_BUFFER)
)

// coinbaseScript :: Integer => Buffer
const coinbaseScript = blockHeight => {
  const blockHeightBuffer = bufferVarInt(blockHeight)
  const arbitraryData = Buffer.allocUnsafe(10)
  const bVarInt = bufferVarInt(blockHeightBuffer.length + arbitraryData.length)
  return Buffer.concat([bVarInt, blockHeightBuffer, arbitraryData])
}
```

To run the coinbase builder we can feed is with transaction object like this:
```js
// Import the implemented builder (a part of `tx-builder` export):
const { buildCoinbaseTx } = require("tx-builder/src/tx-builder")

const tx = {
  version: 1,
  locktime: 0,
  vin: [{
    blockHeight: 40500
  }],
  vout: [{
    value: 12.5 + 0.02 * 100000000,         // <<<<
    address: "mricWicq8AV5d46cYWPApESirBXcB42h57"
  }]
}

const coinbaseTx = buildCoinbaseTx(tx)
console.log(`coinbaseTx hex = ${conbaseTx.toString("hex")}`)
```

## Upcoming

- [ ] full docs
- [x] broserify-ied build
- [ ] an example of other than Bitcoin-specific implementation
- [ ] parallelize `pow` with Web Workers

## Release Notes:
- 0.18.0 Decode scriptPubKey and scriptSig (#21).
- 0.17.0 Added createPubKeyHash utility. Now different sha function can be used for hashing pub keys.
- 0.16.0 Upgraded to `bitcoinjs-lib` v4.
- 0.15.0 Allow to pass options to PoW.
- 0.14.4 Bugfix for `tx-builder.types`.
- 0.14.2 Use single hashing for SHA3 option.
- 0.14.0 Parameterized `buildTx` with options: "network", "sha", "hashTimelockContract":
  - `network`: "TESTNET", "MAINNET" or custom.
  - `sha`: to support "SHA3_256", default: "SHA256";
  - `hashTimelockContract`: function that resolves to HTLC contract string.
- 0.13.0 Added an option for unlocking HTLC scripts.
- 0.12.0 Added branching helper `iff` and predicates `has` and `hasNo`. Use them in `tx-build` allow to pass `scriptPubKey` for tx outputs.
- 0.11.0 Added custom types (`Address`, 'TxConfig', 'TxVin'). Typeforce main `tx-build` functions.
- 0.10.0 Allow to create a custom locking script for transaction outputs. See `makeBufferOutput`.
- 0.8.0 Added `bufferVarSliceBuffer` to create a variable length buffer from a buffer.
- 0.7.4 Added `pow` (Proof of Work) method for finding a `nonce` value, main export.
- 0.7.3 Added `signBuffer` method, main export.
- 0.7.2 Validation: check 1st argument of the 2 argument curried `bufferVarSlice` on time.
- 0.7.1 Added `hashFromBuffer` to the main export.
- 0.7.0 Restructured main index. Added a build.
- 0.6.4 Added example of how to create a coinbase transaction.
- 0.6.0 Added network argument to voutScript. Added API docs.
- 0.5.0 Renamed input fields:
  - vin.hash to vin.txid
  - vin.index to vin.out
- 0.4.5 Made bufferInput and buildTxCopy implementation specific.
- 0.4.3 Sign multiple VINs.
- 0.4.1
  - bufferVarSlice accept encoding param;
  - clone tx config when creating a copy.
- 0.4.0 Build tx input scripts.
- 0.3.0 Added transaction builder
- 0.2.0 Added readHash helper
  - Reverse the hash (tx id) after its read from hex.
- 0.1.2 Initial version
  - buffer utils, compose helpers, bitcoin tx decode example.
