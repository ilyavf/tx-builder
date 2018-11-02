const varuint = require('varuint-bitcoin')
// const bitcoinjs = require('bitcoinjs-lib')
const Buffer = require('safe-buffer').Buffer
// const fixture = require('./fixtures/tx-hex-decoded')
// const fixtureNode = require('./fixtures/hdnode')
// const { signBuffer } = require('../src/tx-builder')

// const txHex = '0100000000010119a1e7978681805188cfa973c3fddf7b0f476a2415752c6e81abfb5e3ee252020000000000feffffff0180f0fa02000000001976a914bb0714d092afe38cca611791aaf076aba6aebc3788ac016a473044022026dac9599e56b1038e5e77726dfed8dae0943708eb23bb0815ef28a08b35e644022025129a134cad83cf9eaf1ef9a1a8cb3a5f25be103dd9833e6fd06785a75c2b8d012103183de65f25cfbc5c371781dc212b46bca8db2de96d9076eef0a8c98ce0fd271e00000000'

const params = process.argv.slice(2)
// const txHex = fixture.hex
const txHex = params[0]
const buffer = Buffer.from(txHex, 'hex')
// const keyPair = fixtureNode.keyPair
let offset = 0

// SegWit: `nVersion | marker | flag | txins | txouts | witness | nLockTime`
const version = buffer.readInt32LE(offset)
console.log(`* version = ${version}, offset=${offset}, length=4`)
offset += 4

const marker = buffer.readUInt8(offset)
console.log(`* marker = ${marker}, offset=${offset}, length=1`)
offset += 1

const flag = buffer.readUInt8(offset)
console.log(`* flag = ${flag}, offset=${flag}, length=1`)
offset += 1

// VIN:
const vinLen = varuint.decode(buffer, offset)
console.log(`* vinLen = ${vinLen}, offset=${offset}, length=${varuint.decode.bytes}`)
offset += varuint.decode.bytes

const readVin = (buffer, offset) => {
  // VIN-i:
  const hash = buffer.slice(offset, offset + 32)
  console.log(`* hash = ${hash.reverse().toString('hex')}, offset=${offset}, length=32`)
  offset += 32

  const index = buffer.readUInt32LE(offset)
  console.log(`* index = ${index}, offset=${offset}, length=4`)
  offset += 4

  const scriptSigLen = varuint.decode(buffer, offset)
  console.log(`* scriptLen = ${scriptSigLen}, offset=${offset}, length=${varuint.decode.bytes}`)
  offset += varuint.decode.bytes

  if (scriptSigLen) {
    const scriptSig = buffer.slice(offset, offset + scriptSigLen)
    console.log(`* scriptSig = ${scriptSig.toString('hex')}, offset=${offset}, length=${scriptSigLen}`)
    offset += scriptSigLen
  }

  const sequence = buffer.readUInt32LE(offset)
  console.log(`* sequence = ${sequence}, offset=${offset}, length=4`)
  offset += 4

  return offset
}

// READ VINs:
for (let i = 0; i < vinLen; i++) {
  console.log(`--- VIN-${i} ---`)
  offset = readVin(buffer, offset)
}

// VOUT
const voutLen = varuint.decode(buffer, offset)
console.log(`* voutLen = ${voutLen}, offset=${offset}, length=${varuint.decode.bytes}`)
offset += varuint.decode.bytes

// VOUT item:
const readVout = (buffer, offset) => {
  const valueA = buffer.readUInt32LE(offset)
  const valueB = buffer.readUInt32LE(offset + 4)
  const valueBB = valueB * 0x100000000
  const value = valueA + valueBB
  console.log(`* value = ${value}, offset=${offset}, length=8`)
  offset += 8

  const scriptPubKeyLen = varuint.decode(buffer, offset)
  console.log(`* scriptPubKeyLen = ${scriptPubKeyLen}, offset=${offset}, length=${varuint.decode.bytes}`)
  offset += varuint.decode.bytes

  const scriptPubKey = buffer.slice(offset, offset + scriptPubKeyLen)
  console.log(`* scriptPubKey = ${scriptPubKey.toString('hex')}, offset=${offset}, length=${scriptPubKeyLen}`)
  offset += scriptPubKeyLen

  return offset
}

// READ VOUTs:
for (let i = 0; i < voutLen; i++) {
  console.log(`--- VOUT-${i} ---`)
  offset = readVout(buffer, offset)
}

// Witnesses
const witnessesLen = varuint.decode(buffer, offset)
console.log(`* witnessesLen = ${witnessesLen}, offset=${offset}, length=${varuint.decode.bytes}`)
offset += varuint.decode.bytes

// READ Witnesses:
for (let i = 0; i < witnessesLen; i++) {
  console.log(`--- Witness-${i} ---`)
  offset = readWitness(buffer, offset)
}

function readWitness (buffer, offset) {
  const witnessLen = varuint.decode(buffer, offset)
  console.log(`* witnessLen = ${witnessLen}, offset=${offset}, length=${varuint.decode.bytes}`)
  offset += varuint.decode.bytes

  if (witnessLen) {
    const scriptSig = buffer.slice(offset, offset + witnessLen)
    console.log(`* scriptSig = ${scriptSig.toString('hex')}, offset=${offset}, length=${witnessLen}`)
    offset += witnessLen
  }

  return offset
}

// Locktime
const locktime = buffer.readUInt32LE(offset)
console.log(`* locktime = ${locktime}, offset=${offset}, length=4`)
offset += 4

console.log(`BUFFER LEFT = ${buffer.slice(offset).toString('hex')}`)

// Example:
// const txHex = '0100000000010115e180dc28a2327e687facc33f10f2a20da717e5548406f7ae8b4c811072f8560100000000ffffffff0100b4f505000000001976a9141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b92888ac02483045022100df7b7e5cda14ddf91290e02ea10786e03eb11ee36ec02dd862fe9a326bbcb7fd02203f5b4496b667e6e281cc654a2da9e4f08660c620a1051337fa8965f727eb19190121038262a6c6cec93c2d3ecd6c6072efea86d02ff8e3328bbd0242b20af3425990ac00000000'
// 01000000   version (4 bytes)
// 00   marker
// 01   flag
// 01   vinLen
// 15e180dc28a2327e687facc33f10f2a20da717e5548406f7ae8b4c811072f856   txid
// 01000000   vin index (4 bytes)
// 00   scriptLen
// ffffffff   sequence
// 01   voutLen
// 00b4f50500000000   value (8 bytes)
// 19   scriptPubKeyLen (=25 bytes)
// 76a9141d7cd6c75c2e86f4cbf98eaed221b30bd9a0b92888ac   scriptPubKey
// 02   witnessesLen
// 48   witnessLen (=72 bytes)
// 3045022100df7b7e5cda14ddf91290e02ea10786e03eb11ee36ec02dd862fe9a326bbcb7fd02203f5b4496b667e6e281cc654a2da9e4f08660c620a1051337fa8965f727eb191901
// 21   witnessLen (=33 bytes)
// 038262a6c6cec93c2d3ecd6c6072efea86d02ff8e3328bbd0242b20af3425990ac
// 00000000   locktime
