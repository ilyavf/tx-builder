module.exports = {
  // https://github.com/bitcoin/bips/blob/master/bip-0143.mediawiki#native-p2wpkh
  'P2WPKH-OFFICIAL-EX': {
    title: 'Example from bitcoin docs - Native P2WPKH',
    desc: 'The first input comes from an ordinary P2PK. The second input comes from a P2WPKH witness program',
    hex: '01000000000102fff7f7881a8099afa6940d42d1e7f6362bec38171ea3edf433541db4e4ad969f00000000494830450221008b9d1dc26ba6a9cb62127b02742fa9d754cd3bebf337f7a55d114c8e5cdd30be022040529b194ba3f9281a99f2b1c0a19c0489bc22ede944ccf4ecbab4cc618ef3ed01eeffffffef51e1b804cc89d182d279655c3aa89e815b1b309fe287d9b2b55d57b90ec68a0100000000ffffffff02202cb206000000001976a9148280b37df378db99f66f85c95a783a76ac7a6d5988ac9093510d000000001976a9143bde42dbee7e4dbe6a21b2d50ce2f0167faa815988ac000247304402203609e17b84f6a7d30c80bfa610b5b4542f32a8a0d5447a12fb1366d7f01cc44a0220573a954c4518331561406f90300e8f3358f51928d43c212a8caed02de67eebee0121025476c2e83188368da1ff3e292e7acafcdb3566bb0ad253f62fc70f07aeee635711000000',
    info: {
      vin0: {
        desc: 'regular P2PKH',
        scriptPubKey: '2103c9f4836b9a4f77fc0d81f7bcb01b7f1b35916864b9476c241ce9fc198bd25432ac',
        privKey: 'bbc27228ddcb9209d7fd6f36b02f7dfa6252af40bb2f1cbc7a557da8027ff866',
        value: 6.25
      },
      vin1: {
        desc: 'witness P2WPKH',
        scriptPubKey: '00141d0f172a0ecb48aee1be1f2687d2963ae33f71a1',
        privKey: '619c335025c7f4012e556c2a58b2506e30b8511b53ade95ea316fd8c3286feb9',
        publicKey: '025476c2e83188368da1ff3e292e7acafcdb3566bb0ad253f62fc70f07aeee6357',
        value: 6
      },
      nVersion: '01000000',
      marker: '00',
      flag: '01',
      txin: '02 fff7f7881a8099afa6940d42d1e7f6362bec38171ea3edf433541db4e4ad969f 00000000 494830450221008b9d1dc26ba6a9cb62127b02742fa9d754cd3bebf337f7a55d114c8e5cdd30be022040529b194ba3f9281a99f2b1c0a19c0489bc22ede944ccf4ecbab4cc618ef3ed01 eeffffff ef51e1b804cc89d182d279655c3aa89e815b1b309fe287d9b2b55d57b90ec68a 01000000 00 ffffffff',
      txout: '02 202cb20600000000 1976a9148280b37df378db99f66f85c95a783a76ac7a6d5988ac 9093510d00000000 1976a9143bde42dbee7e4dbe6a21b2d50ce2f0167faa815988ac',
      witness: '00 02 47304402203609e17b84f6a7d30c80bfa610b5b4542f32a8a0d5447a12fb1366d7f01cc44a0220573a954c4518331561406f90300e8f3358f51928d43c212a8caed02de67eebee01 21025476c2e83188368da1ff3e292e7acafcdb3566bb0ad253f62fc70f07aeee6357',
      nLockTime: '11000000'
    },
    decoded: {
      txid: 'e8151a2af31c368a35053ddd4bdb285a8595c769a3ad83e0fa02314a602d4609',
      hash: 'c36c38370907df2324d9ce9d149d191192f338b37665a82e78e76a12c909b762',
      version: 1,
      size: 343,
      vsize: 261,
      locktime: 17,
      vin: [
        {
          txid: '9f96ade4b41d5433f4eda31e1738ec2b36f6e7d1420d94a6af99801a88f7f7ff',
          vout: 0,
          scriptSig: {
            asm: '30450221008b9d1dc26ba6a9cb62127b02742fa9d754cd3bebf337f7a55d114c8e5cdd30be022040529b194ba3f9281a99f2b1c0a19c0489bc22ede944ccf4ecbab4cc618ef3ed[ALL]',
            hex: '4830450221008b9d1dc26ba6a9cb62127b02742fa9d754cd3bebf337f7a55d114c8e5cdd30be022040529b194ba3f9281a99f2b1c0a19c0489bc22ede944ccf4ecbab4cc618ef3ed01'
          },
          sequence: 4294967278
        },
        {
          txid: '8ac60eb9575db5b2d987e29f301b5b819ea83a5c6579d282d189cc04b8e151ef',
          vout: 1,
          scriptSig: {
            asm: '',
            hex: ''
          },
          txinwitness: ['304402203609e17b84f6a7d30c80bfa610b5b4542f32a8a0d5447a12fb1366d7f01cc44a0220573a954c4518331561406f90300e8f3358f51928d43c212a8caed02de67eebee01',
            '025476c2e83188368da1ff3e292e7acafcdb3566bb0ad253f62fc70f07aeee6357'
          ],
          sequence: 4294967295
        }
      ],
      vout: [
        {
          value: 1.1234,
          n: 0,
          scriptPubKey: {
            asm: 'OP_DUP OP_HASH160 8280b37df378db99f66f85c95a783a76ac7a6d59 OP_EQUALVERIFY OP_CHECKSIG',
            hex: '76a9148280b37df378db99f66f85c95a783a76ac7a6d5988ac',
            reqSigs: 1,
            type: 'pubkeyhash',
            addresses: [
              'msQzKJatdWdw4rpy8sbv8puHoncseekYCf'
            ]
          }
        },
        {
          value: 2.2345,
          n: 1,
          scriptPubKey: {
            asm: 'OP_DUP OP_HASH160 3bde42dbee7e4dbe6a21b2d50ce2f0167faa8159 OP_EQUALVERIFY OP_CHECKSIG',
            hex: '76a9143bde42dbee7e4dbe6a21b2d50ce2f0167faa815988ac',
            reqSigs: 1,
            type: 'pubkeyhash',
            addresses: [
              'mkyWRMBNtjzZxdCcEZDYNi5CSoYnRaKACc'
            ]
          }
        }
      ]
    },
    items: {
      inputValue: '0046c32300000000',
      scriptCode: '1976a9141d0f172a0ecb48aee1be1f2687d2963ae33f71a188ac',
      hashPrevoutsRaw: 'fff7f7881a8099afa6940d42d1e7f6362bec38171ea3edf433541db4e4ad969f00000000ef51e1b804cc89d182d279655c3aa89e815b1b309fe287d9b2b55d57b90ec68a01000000',
      hashPrevouts: '96b827c8483d4e9b96712b6713a7b68d6e8003a781feba36c31143470b4efd37',
      hashSequence: '52b0a642eea2fb7ae638c36f6252b6750293dbe574a806984b8e4d8548339a3b',
      hashSequenceRaw: 'eeffffffffffffff',
      serializedOutputs: '202cb206000000001976a9148280b37df378db99f66f85c95a783a76ac7a6d5988ac9093510d000000001976a9143bde42dbee7e4dbe6a21b2d50ce2f0167faa815988ac',
      hashOutputs: '863ef3e1a92afbfdb97f31ad0fc7683ee943e9abcf2501590ff8f6551f47e5e5',
      hashPreimage: '0100000096b827c8483d4e9b96712b6713a7b68d6e8003a781feba36c31143470b4efd3752b0a642eea2fb7ae638c36f6252b6750293dbe574a806984b8e4d8548339a3bef51e1b804cc89d182d279655c3aa89e815b1b309fe287d9b2b55d57b90ec68a010000001976a9141d0f172a0ecb48aee1be1f2687d2963ae33f71a188ac0046c32300000000ffffffff863ef3e1a92afbfdb97f31ad0fc7683ee943e9abcf2501590ff8f6551f47e5e51100000001000000',
      sigHash: 'c37af31116d1b27caf68aae9e3ac82f1477929014d5b917657d0eb49478cb670',
      signature: '304402203609e17b84f6a7d30c80bfa610b5b4542f32a8a0d5447a12fb1366d7f01cc44a0220573a954c4518331561406f90300e8f3358f51928d43c212a8caed02de67eebee'
    },
    tx: {
      version: 1,
      locktime: 17,
      vin: [{
        txid: '9f96ade4b41d5433f4eda31e1738ec2b36f6e7d1420d94a6af99801a88f7f7ff',
        vout: 0,
        script: '',
        sequence: 4294967278,
        value: 6.25 * 100000000,
        privKey: 'bbc27228ddcb9209d7fd6f36b02f7dfa6252af40bb2f1cbc7a557da8027ff866',
        scriptPubKey: '2103c9f4836b9a4f77fc0d81f7bcb01b7f1b35916864b9476c241ce9fc198bd25432ac',
        type: 'P2PKH'
      }, {
        txid: '8ac60eb9575db5b2d987e29f301b5b819ea83a5c6579d282d189cc04b8e151ef',
        vout: 1,
        script: '',
        sequence: 4294967295,
        value: 6 * 100000000,
        privKey: '619c335025c7f4012e556c2a58b2506e30b8511b53ade95ea316fd8c3286feb9',
        publicKey: '025476c2e83188368da1ff3e292e7acafcdb3566bb0ad253f62fc70f07aeee6357',
        scriptPubKey: '00141d0f172a0ecb48aee1be1f2687d2963ae33f71a1',
        type: 'P2WPKH'
      }],
      vout: [{
        value: 1.1234 * 100000000,
        address: 'msQzKJatdWdw4rpy8sbv8puHoncseekYCf',
        type: 'P2PKH'
      }, {
        value: 2.2345 * 100000000,
        address: 'mkyWRMBNtjzZxdCcEZDYNi5CSoYnRaKACc',
        type: 'P2PKH'
      }]
    }
  },
  P2WPKH: {
    title: 'Decode SegWit - P2WPKH',
    txid: 'd869f854e1f8788bcff294cc83b280942a8c728de71eb709a2c29d10bfe21b7c',
    hex: '0100000000010115e180dc28a2327e687facc33f10f2a20da717e5548406f7ae8b4c811072f8560100000000ffffffff0100b4f505000000001976a9141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b92888ac02483045022100df7b7e5cda14ddf91290e02ea10786e03eb11ee36ec02dd862fe9a326bbcb7fd02203f5b4496b667e6e281cc654a2da9e4f08660c620a1051337fa8965f727eb19190121038262a6c6cec93c2d3ecd6c6072efea86d02ff8e3328bbd0242b20af3425990ac00000000',
    decoded: {
      txid: 'd869f854e1f8788bcff294cc83b280942a8c728de71eb709a2c29d10bfe21b7c',
      hash: '976015741ba2fc60804dd63167326b1a1f7e94af2b66f4a0fd95b38c18ee729b',
      version: 1,
      size: 195,
      vsize: 113,
      locktime: 0,
      vin: [
        {
          txid: '56f87210814c8baef7068454e517a70da2f2103fc3ac7f687e32a228dc80e115',
          vout: 1,
          scriptSig: {
            asm: '',
            hex: ''
          },
          txinwitness: [
            '3045022100df7b7e5cda14ddf91290e02ea10786e03eb11ee36ec02dd862fe9a326bbcb7fd02203f5b4496b667e6e281cc654a2da9e4f08660c620a1051337fa8965f727eb191901',
            '038262a6c6cec93c2d3ecd6c6072efea86d02ff8e3328bbd0242b20af3425990ac'
          ],
          sequence: 4294967295
        }
      ],
      vout: [
        {
          value: 0.9998848,
          n: 0,
          scriptPubKey: {
            asm: 'OP_DUP OP_HASH160 1d7cd6c75c2e86f4cbf98eaed221b30bd9a0b928 OP_EQUALVERIFY OP_CHECKSIG',
            hex: '76a9141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b92888ac',
            reqSigs: 1,
            type: 'pubkeyhash',
            addresses: [
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
