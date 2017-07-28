# tx-decoder
Composable helpers for decoding blockchain transactions

[![Build Status](https://travis-ci.org/ilyavf/tx-decoder.png?branch=master)](https://travis-ci.org/ilyavf/tx-decoder)

This package contains **composable helpers** for decoding a blockchain transaction and implements an example of bitcoin transaction decoder.

It can be useful for blockchain projects forked from BitcoinCore that want to add **custom data to a transaction**.

Every composable helper expects a buffer and returns a pair (array of two elements) of a result and a buffer left.

Compared to `bitcoinjs-lib` which implements decoding in an imperative style where every helper uses `buffer`
of the outer scope and mutates outer `offset`. Thus its helpers cannot be reused for a different transaction structure.

## Example:
```javascript
const Buffer = require("safe-buffer").Buffer
const { readInt32, readUInt32 } = require("tx-decoder/src/buffer-utils")
const { compose, addProp } = require("tx-decoder/src/compose")
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

Here is how `readInput` can be defined in the same composable manner:
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

## Upcoming

- transaction builder