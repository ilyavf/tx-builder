const varuint = require('varuint-bitcoin')
// const bitcoinjs = require('bitcoinjs-lib')
const Buffer = require('safe-buffer').Buffer
const fixture = require('./fixtures/tx-hex-decoded')
const fixtureNode = require('./fixtures/hdnode')
const { signBuffer } = require('../src/tx-builder')

// const actual = '020000000119a1e7978681805188cfa973c3fddf7b0f476a2415752c6e81abfb5e3ee25202000000006a47304402201fdbe9e6ae2fe2ae64f06d99901b0f3eb6d27b2c8455db7015c3cc590716e6b10220315f0f84131e0cf93aa255b2c52e5357ea18b28a254ddcd36ef316f2205ab0e0012103183de65f25cfbc5c371781dc212b46bca8db2de96d9076eef0a8c98ce0fd271efeffffff029961b5c12a7700001976a914bb0714d092afe38cca611791aaf076aba6aebc3788ac80b2e60e000000001976a9140ff10539f75cb64a18f7283adb6ffa5ed8537f9888ac65000000'
// const expected = '020000000119a1e7978681805188cfa973c3fddf7b0f476a2415752c6e81abfb5e3ee25202000000006b48304502210091f5f7dc9012e00f85e2dfdb1557ed2265766a8bad92555926462bf93af7193602203c1f3a5043682ae005ef2728defa76abe7bf9374853ece02e1b437cfef208e76012103183de65f25cfbc5c371781dc212b46bca8db2de96d9076eef0a8c98ce0fd271efeffffff029961b5c12a7700001976a914bb0714d092afe38cca611791aaf076aba6aebc3788ac80b2e60e000000001976a9140ff10539f75cb64a18f7283adb6ffa5ed8537f9888ac65000000'
// const actual = '010000000119a1e7978681805188cfa973c3fddf7b0f476a2415752c6e81abfb5e3ee25202000000006b483045022100e2ba8f2dcb48d2ae0968c712111a56aa12923ed8b1caaedd7fe0b22d5020d77b022043a9e8254c8e0775ffb7c8c8a312486864087aef51c4bd858472ed372a344fe5012103183de65f25cfbc5c371781dc212b46bca8db2de96d9076eef0a8c98ce0fd271efeffffff0180f0fa02000000001976a914bb0714d092afe38cca611791aaf076aba6aebc3788ac65000000'

const txHex = fixture.hex
// const txHex = actual
const buffer = Buffer.from(txHex, 'hex')
const keyPair = fixtureNode.keyPair
let offset = 0

const version = buffer.readInt32LE(offset)
console.log(`* version = ${version}, offset=${offset}, length=4`)
offset += 4

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

// Locktime
const locktime = buffer.readUInt32LE(offset)
console.log(`* locktime = ${locktime}, offset=${offset}, length=4`)
offset += 4

console.log(`BUFFER LEFT = ${buffer.slice(offset).toString('hex')}`)

// For fixtures:
console.log(`VIN-1 hex: ${buffer.slice(5, 152).toString('hex')}`)
console.log(`VOUT-1 hex: ${buffer.slice(153, 187).toString('hex')}`)
// console.log(`scriptSig = ${scriptSig.toString('hex')}`)
// const asm = bitcoinjs.script.toASM(scriptSig)
// console.log(`asm = ${asm}`)

// Signature:
const sig = signBuffer(keyPair)(buffer)
console.log(`sig = ${sig instanceof Buffer} ${sig.toString('hex')}`)
