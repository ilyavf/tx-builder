const varuint = require('varuint-bitcoin')
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

const scriptLen = varuint.decode(buffer, offset)
console.log(`* scriptLen = ${scriptLen}, offset=${offset}, length=${varuint.decode.bytes}`)
offset += varuint.decode.bytes

const script = buffer.slice(offset, offset + scriptLen)
console.log(`* script = ${script.toString('hex')}, offset=${offset}, length=${scriptLen}`)
offset += scriptLen

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

  const lockingScriptLen = varuint.decode(buffer, offset)
  console.log(`* lockingScriptLen = ${lockingScriptLen}, offset=${offset}, length=${varuint.decode.bytes}`)
  offset += varuint.decode.bytes

  const lockingScript = buffer.slice(offset, offset + lockingScriptLen)
  console.log(`* lockingScript = ${lockingScript.toString('hex')}, offset=${offset}, length=${lockingScriptLen}`)
  offset += lockingScriptLen

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
