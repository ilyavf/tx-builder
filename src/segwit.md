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
- variable length array of bytes (VarInt length, string of bytes).
