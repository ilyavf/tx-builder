module.exports = [{
  title: 'SHA3 - Bitcoin transaction',
  txid: '5eee5ec76911cc08d06624f867be5e748f76abed3dc58252b9a71c7054b02f78',
  hex: '020000000119a1e7978681805188cfa973c3fddf7b0f476a2415752c6e81abfb5e3ee25202000000006a4730440220142641406a90c3616d7f17361f4411c342b5df69134856a0ebd48d87a422a1c4022005412986cf152e49d3a19726d253f75f4953e5cd363e39cc3fc983a6aa975865012103183de65f25cfbc5c371781dc212b46bca8db2de96d9076eef0a8c98ce0fd271efeffffff029961b5c12a7700001976a914bb0714d092afe38cca611791aaf076aba6aebc3788ac80b2e60e000000001976a9140ff10539f75cb64a18f7283adb6ffa5ed8537f9888ac65000000',
  decoded: {
    'txid': '62c6fc127d8edbe839ddcf2e2531fa1912d0746476fa68a662bf7ec0a88465c6',
    'hash': '62c6fc127d8edbe839ddcf2e2531fa1912d0746476fa68a662bf7ec0a88465c6',
    'size': 267,
    'vsize': 267,
    'version': 2,
    'locktime': 101,
    'vin': [
      {
        'txid': '0252e23e5efbab816e2c7515246a470f7bdffdc373a9cf885180818697e7a119',
        'vout': 0,
        'scriptSig': {
          'asm': '30440220018e05a5e2415496b93f5d4d1d928e3f4836280e7cecf9660ca2d9cecaa6879202200187aa4ec83a2df5cf459a833be342c8926ba65b2448cb0871d9b68e051bdaa1[ALL]',
          'hex': '4730440220018e05a5e2415496b93f5d4d1d928e3f4836280e7cecf9660ca2d9cecaa6879202200187aa4ec83a2df5cf459a833be342c8926ba65b2448cb0871d9b68e051bdaa101'
        },
        'sequence': 4294967294
      }
    ],
    'vout': [
      {
        'value': 1310255.22221466,
        'n': 0,
        'scriptPubKey': {
          'asm': 'OP_DUP OP_HASH160 bb0714d092afe38cca611791aaf076aba6aebc37 OP_EQUALVERIFY OP_CHECKSIG',
          'hex': '76a914bb0714d092afe38cca611791aaf076aba6aebc3788ac',
          'reqSigs': 1,
          'type': 'pubkeyhash',
          'addresses': [
            'mxZs8wiVXSD6myyRhLuLauyh8X8GFmbaLK'
          ]
        }
      },
      {
        'value': 2.50000000,
        'n': 1,
        'scriptPubKey': {
          'asm': 'OP_DUP OP_HASH160 0ff10539f75cb64a18f7283adb6ffa5ed8537f98 OP_EQUALVERIFY OP_CHECKSIG',
          'hex': '76a9140ff10539f75cb64a18f7283adb6ffa5ed8537f9888ac',
          'reqSigs': 1,
          'type': 'pubkeyhash',
          'addresses': [
            'mgyFAKifcUPfmkY25LfLb8ckaNMP8JuvBL'
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
      address: 'mxZs8wiVXSD6myyRhLuLauyh8X8GFmbaLK'
    }, {
      value: 2.5 * 100000000,
      address: 'mgyFAKifcUPfmkY25LfLb8ckaNMP8JuvBL'
    }]
  },
  hexItems: {}
}]
