## Custom composition

### Transaction decoder

Lets see what the `compose` function does to decode a blockchain transaction.

#### Transaction structure

A blockchain transaction consists of several blocks. Each block (or a part of a block) can be defined as one of the following:
- constant length data, e.g.:
  - version, 4 bytes;
  - transaction id, 32 bytes;
  - locktime, 32 bytes;
- variable length value, e.g.:
  - number of inputs or outputs, "varInt" type;
  - size of variable length block of data, "varInt" type;
- variable length block of data:
  - locking and unlocking scripts, variable length slice.

Here is a part of the hex representation of a blockchain transaction:
```
0100000001a58a349e8d92bb9867884bf4b108da8df77143fbe8fcaf8a0f69a589de1c66a303 ...
```

According to spec the blocks of this part of the transactions are:
```
01000000  - 4 bytes, version number
01        - varInt, a number of transaction inputs (called VIN)
a58a349e8d92bb9867884bf4b108da8df77143fbe8fcaf8a0f69a589de1c66a3
          - 32 bytes, prev transaction id of the 1st input
03        - varInt, prev transaction index of the 1st input
```

#### Decoding a transaction

To gradually decode a transaction we need to convert its hex representation into a buffer of bytes. Then, follow
the spec and interprete parts of the transaction step-by-step according to the rules.

A unit function that decodes a block expects the transaction buffer on the input, interpretes a part of the buffer,
and returns a pair:
- result of the block interpretation;
- and a sliced buffer that's left, which will be passed as an input to the next unit function.

The composition helper that's supposed to glue the unit functions should take care of managing inputs, outputs and
building the result.

> Note: In terms of the Category Theory, the data type of a result that can be "assembled" is called a `monoid` under
> the operation of "assembling". E.g. to assemble a sum we can use numbers which is a `monoid` under addition: `sum = 1 + 2`

Lets see some sample data and some code.

To read the version number from a transaction buffer we can do:
```js
// Import a buffer Node package:
const Buffer = require("safe-buffer").Buffer

// Define our hex transaction and convert to a buffer:
const txHex = "0100000001a58a349e8d92bb9867884bf4b108da8df77143fbe8fcaf8a0f69a589de1c66a303"
const txBuffer = Buffer.from(txHex, "hex")

// Read 4 bytes from the buffer starting from the beginning (offset = 0):
const version = txBuffer.readInt32LE( 0 )
```

> Note: bytes in the buffer are stored in the reversed order (younger bytes are first). This is called Little Endian.
> Thus number `00000001` is written into a buffer as `01 00 00 00`.

