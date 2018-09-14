module.exports = {
  P2WPKH: {
    title: 'Decode SegWit - P2WPKH',
    txid: 'd869f854e1f8788bcff294cc83b280942a8c728de71eb709a2c29d10bfe21b7c',
    hex: '0100000000010115e180dc28a2327e687facc33f10f2a20da717e5548406f7ae8b4c811072f8560100000000ffffffff0100b4f505000000001976a9141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b92888ac02483045022100df7b7e5cda14ddf91290e02ea10786e03eb11ee36ec02dd862fe9a326bbcb7fd02203f5b4496b667e6e281cc654a2da9e4f08660c620a1051337fa8965f727eb19190121038262a6c6cec93c2d3ecd6c6072efea86d02ff8e3328bbd0242b20af3425990ac00000000',
    decoded: {
      'txid': 'd869f854e1f8788bcff294cc83b280942a8c728de71eb709a2c29d10bfe21b7c',
      'hash': '976015741ba2fc60804dd63167326b1a1f7e94af2b66f4a0fd95b38c18ee729b',
      'version': 1,
      'size': 195,
      'vsize': 113,
      'locktime': 0,
      'vin': [
        {
          'txid': '56f87210814c8baef7068454e517a70da2f2103fc3ac7f687e32a228dc80e115',
          'vout': 1,
          'scriptSig': {
            'asm': '',
            'hex': ''
          },
          'txinwitness': [
            '3045022100df7b7e5cda14ddf91290e02ea10786e03eb11ee36ec02dd862fe9a326bbcb7fd02203f5b4496b667e6e281cc654a2da9e4f08660c620a1051337fa8965f727eb191901',
            '038262a6c6cec93c2d3ecd6c6072efea86d02ff8e3328bbd0242b20af3425990ac'
          ],
          'sequence': 4294967295
        }
      ],
      'vout': [
        {
          'value': 0.9998848,
          'n': 0,
          'scriptPubKey': {
            'asm': 'OP_DUP OP_HASH160 1d7cd6c75c2e86f4cbf98eaed221b30bd9a0b928 OP_EQUALVERIFY OP_CHECKSIG',
            'hex': '76a9141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b92888ac',
            'reqSigs': 1,
            'type': 'pubkeyhash',
            'addresses': [
              'miCsSagJ7RQDCMcBUaKFKEryaLnxbhGAPt'
            ]
          }
        }
      ]
    },
    fromAddress: 'mgyFAKifcUPfmkY25LfLb8ckaNMP8JuvBL',
    privKey: 'cUtqnMnPdFJeg6fXknCH5XcHNqNz9amAYXDAD6S1XYehUiaVqJs3',
    tx: {
      version: 2,
      locktime: 101,
      vin: [{
        txid: '0252e23e5efbab816e2c7515246a470f7bdffdc373a9cf885180818697e7a119',
        vout: 0,
        script: '',
        sequence: 4294967294
      }],
      vout: [{
        value: 1310255.22221466 * 100000000,
        address: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
        type: 'P2WPKH'
        // segwit: 'P2WPKH'
      }]
    },
    hexItems: {

    }
  }
}
