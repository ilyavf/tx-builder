module.exports = [{
  title: 'SegWit - P2WPKH',
  txid: '',
  hex: '',
  decoded: {},
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
  hexItems: {}
}, {
  title: 'SegWit - embedded P2SH-P2WPKH)',
  txid: '8139979112e894a14f8370438a471d23984061ff83a9eba0bc7a34433327ec21',
  hex: '0100000000010115e180dc28a2327e687facc33f10f2a20da717e5548406f7ae8b4c811072f85603000000171600141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b928ffffffff019caef505000000001976a9141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b92888ac02483045022100f764287d3e99b1474da9bec7f7ed236d6c81e793b20c4b5aa1f3051b9a7daa63022016a198031d5554dbb855bdbe8534776a4be6958bd8d530dc001c32b828f6f0ab0121038262a6c6cec93c2d3ecd6c6072efea86d02ff8e3328bbd0242b20af3425990ac00000000',
  decoded: {
    'txid': '8139979112e894a14f8370438a471d23984061ff83a9eba0bc7a34433327ec21',
    'hash': '6bf4e4dfb860cf0906f49c836700b130ac78cc391c72a0911c94cdec4dcb10ec',
    'version': 1,
    'size': 218,
    'vsize': 136,
    'locktime': 0,
    'vin': [
      {
        'txid': '56f87210814c8baef7068454e517a70da2f2103fc3ac7f687e32a228dc80e115',
        'vout': 3,
        'scriptSig': {
          'asm': '00141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b928',
          'hex': '1600141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b928'
        },
        'txinwitness': [
          '3045022100f764287d3e99b1474da9bec7f7ed236d6c81e793b20c4b5aa1f3051b9a7daa63022016a198031d5554dbb855bdbe8534776a4be6958bd8d530dc001c32b828f6f0ab01',
          '038262a6c6cec93c2d3ecd6c6072efea86d02ff8e3328bbd0242b20af3425990ac'
        ],
        'sequence': 4294967295
      }
    ],
    'vout': [
      {
        'value': 0.999871,
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
  hexItems: {}
}]
