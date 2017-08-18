const varuint = require('varuint-bitcoin')
const bitcoinjs = require('bitcoinjs-lib')
const Buffer = require('safe-buffer').Buffer
const fixture = require('./fixture')

const txHex = fixture.hex
const buffer = Buffer.from(txHex, 'hex')
let offset = 0

const version = buffer.readInt32LE(offset)
console.log(`* version = ${version}, offset=${offset}, length=4`)
offset += 4

// VIN:
const vinLen = varuint.decode(buffer, offset)
console.log(`* vinLen = ${vinLen}, offset=${offset}, length=${varuint.decode.bytes}`)
offset += varuint.decode.bytes

// VIN-1:
const hash = buffer.slice(offset, offset + 32)
console.log(`* hash = ${hash.toString('hex')}, offset=${offset}, length=32`)
offset += 32

const index = buffer.readUInt32LE(offset)
console.log(`* index = ${index}, offset=${offset}, length=4`)
offset += 4

const scriptSigLen = varuint.decode(buffer, offset)
console.log(`* scriptLen = ${scriptSigLen}, offset=${offset}, length=${varuint.decode.bytes}`)
offset += varuint.decode.bytes

const scriptSig = buffer.slice(offset, offset + scriptSigLen)
console.log(`* scriptSig = ${scriptSig.toString('hex')}, offset=${offset}, length=${scriptSigLen}`)
offset += scriptSigLen

const sequence = buffer.readUInt32LE(offset)
console.log(`* sequence = ${sequence}, offset=${offset}, length=4`)
offset += 4

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

console.log('--- VOUT-1 ---')
offset = readVout(buffer, offset)
console.log('--- VOUT-2 ---')
offset = readVout(buffer, offset)

// Locktime
const locktime = buffer.readUInt32LE(offset)
console.log(`* locktime = ${locktime}, offset=${offset}, length=4`)
offset += 4

console.log(`BUFFER LEFT = ${buffer.slice(offset).toString('hex')}`)

console.log(`VIN-1 hex: ${buffer.slice(5, 153).toString('hex')}`)
console.log(`VOUT-1 hex: ${buffer.slice(154, 188).toString('hex')}`)

console.log(`scriptSig = ${scriptSig.toString('hex')}`)
const asm = bitcoinjs.script.toASM(scriptSig)
console.log(`asm = ${asm}`)
