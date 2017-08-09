# tx-decoder
Composable helpers for building and decoding blockchain transactions

[![Build Status](https://travis-ci.org/ilyavf/tx-builder.png?branch=master)](https://travis-ci.org/ilyavf/tx-builder)

This package contains **composable helpers** for **building** and **decoding** a blockchain transaction and implements an example of bitcoin transaction builder and decoder.

It can be useful for blockchain projects forked from BitcoinCore that want to add **custom data to a transaction**.

For decoding a transaction the composable helpers expect a buffer and return a pair (array of two elements) of a result and a buffer left.

Compared to `bitcoinjs-lib` which implements decoding in an imperative style where every helper uses `buffer`
of the outer scope and mutates outer `offset`. Thus its helpers cannot be reused for a different transaction structure.

## Example:

### Decoding a transaction

Here is how bitcoin transaction decoder is implemented (the main export of the package):
```javascript
const Buffer = require("safe-buffer").Buffer
const { readInt32, readUInt32 } = require("tx-decoder/src/buffer-read")
const { compose, addProp } = require("tx-decoder/src/compose-read")
const { readInputs, readInput, readOutput } = require("tx-decoder/src/tx-decoder")

// Create a buffer from a transaction hex:
const txHex = "0100000001545f6161d2be3bdfe71..."   // see `test/fixture.js` for a full tx example
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
const { readSlice, readVarSlice, readUInt32 } = require("tx-decoder/src/buffer-utils")
const { compose, addProp } = require("tx-decoder/src/compose")

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

Checkout `tests/manual-decode.js` if you are not familiar with how to decode a transaction. It has a step-by-step imperative-style example.

Checkout tests for exact examples of how to use the package helpers.


### Building a transaction

Here is how bitcoin transaction builder is implemented:
```javascript
const Buffer = require("safe-buffer").Buffer
const { bufferInt32, bufferUInt32 } = require("tx-decoder/src/buffer-utils")
const { compose, prop } = require("tx-decoder/src/compose-build")
const { bufferInputs, bufferInput, bufferOutput } = require("tx-decoder/src/tx-builder")

// Create a buffer from a transaction hex:
// (see `test/fixture.js` for a full tx example)
const tx = {
  version: 1,
  locktime: 0,
  vin: [{
      hash: '2d7a9f0534ddac231ef1978bda388791c32321f7e14e18e7df3bbed261615f54',
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

## Upcoming

- build script
- decode script

## Release Notes:
- 0.3.0 Added transaction builder
- 0.2.0 Added readHash helper
  - Reverse the hash (tx id) after its read from hex.
- 0.1.2 Initial version
  - buffer utils, compose helpers, bitcoin tx decode example.
