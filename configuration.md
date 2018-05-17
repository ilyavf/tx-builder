To allow configuration options, e.g. for SHA algorithm:

```js
const bitcoin = require('bitcoinjs-lib')
const { buildTx } = require('tx-builder').builder
const txConfig = { version: 1, vin: [...]}
const options = {
  network: 'TESTNET'            // ('MAINNET', 'TESTNET'), default: 'TESTNET'
  sha: 'SHA3_256',              // ('SHA256' | 'SHA3_256'), default: 'SHA256'
  hashTimelockContract          // a function type
}
const buildTxSha3 = buildTx(options)
const tx = buildTxSha3()
console.log(tx.toString( 'hex' ))
// >>> "0100000001545f6161d2be3bdfe7184ee1f7..."
```

SHA algorith is used in these cases:
- TXID, its a double hash, e.g. SHA3(SHA3(<txhex>))
- signBuffer


Dependency path:
- buildTx
  - bufferInput (to sign UTXO)
    - buildTxCopy (to hash tx before signing)
      - bufferOutput (this to customize specific blockchain, e.g. Equibit VS Bitcoin)
