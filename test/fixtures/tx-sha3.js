module.exports = [{
  title: 'SHA3 - Bitcoin transaction',
  txid: 'f2a167a0d5037c4969629c612e988230873280bbcffa61494ad322fe16a662d0',
  hex: '020000000119a1e7978681805188cfa973c3fddf7b0f476a2415752c6e81abfb5e3ee25202000000006a47304402205f05a8a1ecda6e3645f73fab0a73be968225b7670f52d49cd85ac9cc7b67f4c702202dcc547d54f4ff7aebadf4dfeade4792e0239bd51803e638c9b24fcc3931de19012103183de65f25cfbc5c371781dc212b46bca8db2de96d9076eef0a8c98ce0fd271efeffffff029961b5c12a7700001976a914bb0714d092afe38cca611791aaf076aba6aebc3788ac80b2e60e000000001976a9140ff10539f75cb64a18f7283adb6ffa5ed8537f9888ac65000000',
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
