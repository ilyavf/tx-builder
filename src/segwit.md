## Transaction Serialization
https://bitcoincore.org/en/segwit_wallet_dev/#transaction-serialization

The original transaction format:
```
nVersion | txins | txouts | nLockTime
```

**The new serialization format** [BIP-144](https://github.com/bitcoin/bips/blob/master/bip-0144.mediawiki#specification)
```
nVersion | marker | flag | txins | txouts | witness | nLockTime
```
- The marker MUST be `0x00`
- The flag MUST be `0x01`
- The witness is a serialization of all witness data of the transaction. The witness structure as a serialized byte array.

If the witness is empty, the old serialization format should be used.

Currently, the only witness objects type supported are script witnesses which consist of a stack of byte arrays. It is encoded as a var_int item count followed by each item encoded as a var_int length followed by a string of bytes. Each txin has its own script witness. The number of script witnesses is not explicitly encoded as it is implied by txin_count. Empty script witnesses are encoded as a zero byte. The order of the script witnesses follows the same order as the associated txins.

**Witness data**
- counter, VarInt;
- variable length array of bytes (no length of items is required since it has the same amount of items as vin).


## Transaction Signature Verification for Version 0 Witness Program
https://github.com/bitcoin/bips/blob/master/bip-0143.mediawiki

Double SHA256 of the serialization of:

1. `nVersion` of the transaction (4-byte little endian)
2. `hashPrevouts` (32-byte hash)
3. `hashSequence` (32-byte hash)
4. `outpoint` (32-byte hash + 4-byte little endian)
5. `scriptCode` of the input (serialized as scripts inside CTxOuts)
6. `value` of the output spent by this input (8-byte little endian)
7. `nSequence` of the input (4-byte little endian)
8. `hashOutputs` (32-byte hash)
9. `nLocktime` of the transaction (4-byte little endian)
10. `sighash` type of the signature (4-byte little endian)

### hashPrevouts
- If the ANYONECANPAY flag is not set, hashPrevouts is the double SHA256 of the serialization of all input outpoints;
- Otherwise, hashPrevouts is a uint256 of 0x0000......0000.

### hashSequence
- If none of the ANYONECANPAY, SINGLE, NONE sighash type is set, hashSequence is the double SHA256 of the serialization of nSequence of all inputs;
- Otherwise, hashSequence is a uint256 of 0x0000......0000.

### hashOutputs
- If the sighash type is neither SINGLE nor NONE, hashOutputs is the double SHA256 of the serialization of all output amount (8-byte little endian) with scriptPubKey (serialized as scripts inside CTxOuts);
- If sighash type is SINGLE and the input index is smaller than the number of outputs, hashOutputs is the double SHA256 of the output amount with scriptPubKey of the same index as the input;
- Otherwise, hashOutputs is a uint256 of 0x0000......0000.

### scriptCode
For P2WPKH witness program, the scriptCode is 0x1976a914{20-byte-pubkey-hash}88ac