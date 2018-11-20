module.exports = {
  hex: '0100000001a58a349e8d92bb9867884bf4b108da8df77143fbe8fcaf8a0f69a589de1c66a3010000006a4730440220764bbe9ddff67409310c04ffb34fe937cc91c3d55303158f91a32bed8d9d7a7b02207fb30f6b9aaef93da8c88e2b818d993ad65aae54860c3de56c6304c57252cce1012103a6afa2211fc96a4130e767da4a9e802f5e922a151c5cd6d4bffa80358dd1f9a3ffffffff0200c2eb0b000000001976a9147adddcbdf9f0ebcb814e2efb95debda73bfefd9888ace0453577000000001976a9145e9f5c8cc17ecaaea1b4e5a3d091ca0aed1342f788ac00000000',
  hexItems: {
    vin: 'a58a349e8d92bb9867884bf4b108da8df77143fbe8fcaf8a0f69a589de1c66a3010000006a4730440220764bbe9ddff67409310c04ffb34fe937cc91c3d55303158f91a32bed8d9d7a7b02207fb30f6b9aaef93da8c88e2b818d993ad65aae54860c3de56c6304c57252cce1012103a6afa2211fc96a4130e767da4a9e802f5e922a151c5cd6d4bffa80358dd1f9a3ffffffff',
    // Replaced script hex (inc length) from vin with `00`:
    vin1emptyScript: 'a58a349e8d92bb9867884bf4b108da8df77143fbe8fcaf8a0f69a589de1c66a30100000000ffffffff',
    vin1Subscript: 'a58a349e8d92bb9867884bf4b108da8df77143fbe8fcaf8a0f69a589de1c66a3010000001976a9143c8710460fc63d27e6741dd1927f0ece41e9b55588acffffffff',
    // From `manual-decode.js`:
    vout1: '00c2eb0b000000001976a9147adddcbdf9f0ebcb814e2efb95debda73bfefd9888ac',
    txCopy: '0100000001545f6161d2be3bdfe7184ee1f72123c3918738da8b97f11e23acdd34059f7a2d0100000000ffffffff0200e1f505000000001976a91461ca8116d03694952a3ad252d53c695da7d95f6188ac18ddf505000000001976a9145e9f5c8cc17ecaaea1b4e5a3d091ca0aed1342f788ac00000000',
    // From `test/transaction.js` debugging tx.sign(...) `Transaction.prototype.hashForSignature`:
    txCopySubscript: '76a9143c8710460fc63d27e6741dd1927f0ece41e9b55588ac',
    txCopyHex: '0100000001a58a349e8d92bb9867884bf4b108da8df77143fbe8fcaf8a0f69a589de1c66a3010000001976a9143c8710460fc63d27e6741dd1927f0ece41e9b55588acffffffff0200c2eb0b000000001976a9147adddcbdf9f0ebcb814e2efb95debda73bfefd9888ace0453577000000001976a9145e9f5c8cc17ecaaea1b4e5a3d091ca0aed1342f788ac00000000',
    txCopyForHash: '0100000001a58a349e8d92bb9867884bf4b108da8df77143fbe8fcaf8a0f69a589de1c66a3010000001976a9143c8710460fc63d27e6741dd1927f0ece41e9b55588acffffffff0200c2eb0b000000001976a9147adddcbdf9f0ebcb814e2efb95debda73bfefd9888ace0453577000000001976a9145e9f5c8cc17ecaaea1b4e5a3d091ca0aed1342f788ac0000000001000000'
  },
  decoded: {
    txid: '878b6b3e31135ecd083ed08413f570b0a14590b893ec0f8d8139618a78afa82c',
    version: 1,
    locktime: 0,
    vin: [{
      txid: 'a3661cde89a5690f8aaffce8fb4371f78dda08b1f44b886798bb928d9e348aa5',
      vout: 1,
      scriptSig: {
        asm: '30440220764bbe9ddff67409310c04ffb34fe937cc91c3d55303158f91a32bed8d9d7a7b02207fb30f6b9aaef93da8c88e2b818d993ad65aae54860c3de56c6304c57252cce1[ALL] 03a6afa2211fc96a4130e767da4a9e802f5e922a151c5cd6d4bffa80358dd1f9a3',
        hex: '4730440220764bbe9ddff67409310c04ffb34fe937cc91c3d55303158f91a32bed8d9d7a7b02207fb30f6b9aaef93da8c88e2b818d993ad65aae54860c3de56c6304c57252cce1012103a6afa2211fc96a4130e767da4a9e802f5e922a151c5cd6d4bffa80358dd1f9a3'
      },
      sequence: '4294967295'
    }],
    vout: [{
      value: 200000000,
      scriptPubKey: {
        hex: '76a9147adddcbdf9f0ebcb814e2efb95debda73bfefd9888ac',
        type: 'pukeyhash',
        asm: 'OP_DUP OP_HASH160 7adddcbdf9f0ebcb814e2efb95debda73bfefd98 OP_EQUALVERIFY OP_CHECKSIG',
        addresses: [
          '1CCfDfXrK93pqwczpwQnzKEPzBvuGZ9bbW'
        ]
      }
    }, {
      value: 1999980000,  // (21.9999 - 2 - 0.0001)
      scriptPubKey: {
        hex: '76a9145e9f5c8cc17ecaaea1b4e5a3d091ca0aed1342f788ac',
        type: 'pubkeyhash',
        asm: 'OP_DUP OP_HASH160 5e9f5c8cc17ecaaea1b4e5a3d091ca0aed1342f7 OP_EQUALVERIFY OP_CHECKSIG',
        addresses: [ '19dKRfZK3JyfZnaaRDFmmgjdWmw8dz7j4g' ]
      }
    }]
  },
  offsetVout1: 153,
  tx: {
    version: 1,
    locktime: 0,
    vin: [{
      txid: 'a3661cde89a5690f8aaffce8fb4371f78dda08b1f44b886798bb928d9e348aa5',
      vout: 1,
      script: '',
      sequence: '4294967295'
    }],
    vout: [{
      value: 2 * 100000000,
      address: 'mricWicq8AV5d46cYWPApESirBXcB42h57'
    }, {
      value: (21.9999 - 2 - 0.0001) * 100000000,
      address: 'mp9GiieHrLQvLu4C8nE9bbwxNmXqcC3nVf'
    }]
  }
}

// Version:
// 01000000
//
// VIN length:
// 01
//
// Hash:
// 545f6161d2be3bdfe7184ee1f72123c3918738da8b97f11e23acdd34059f7a2d
//
// Index:
// 01000000
//
// Script length:
// 6b
//
// Script:
// 4830450221008c33d765
// ae16cfa3cc653c5c039d
// 58131fbbdf76266af7a7
// 6910fc1ba39de0b80220
// 48ae83fc9b82f62b8166
// 41158dd1cfd398d2c56d
// 5f6f812c9fa588947311
// d8400121033701fc7f24
// 2ae2dd63a18753518b6d
// 1425e53496878924b6c0
// dc08d800af46ad
//
// Sequence:
// ffffffff
//
// 0200e1f505000000001976a91461ca8116d03694952a3ad252d53c695da7d95f6188ac18ddf505000000001976a9145e9f5c8cc17ecaaea1b4e5a3d091ca0aed1342f788ac00000000
