const varuint = require('varuint-bitcoin')
const Buffer = require('safe-buffer').Buffer

const txHex = '0100000001545f6161d2be3bdfe7184ee1f72123c3918738da8b97f11e23acdd34059f7a2d010000006b4830450221008c33d765ae16cfa3cc653c5c039d58131fbbdf76266af7a76910fc1ba39de0b8022048ae83fc9b82f62b816641158dd1cfd398d2c56d5f6f812c9fa588947311d8400121033701fc7f242ae2dd63a18753518b6d1425e53496878924b6c0dc08d800af46adffffffff0200e1f505000000001976a91461ca8116d03694952a3ad252d53c695da7d95f6188ac18ddf505000000001976a9145e9f5c8cc17ecaaea1b4e5a3d091ca0aed1342f788ac00000000'
const buffer = Buffer.from(txHex, 'hex')
let offset = 0

const version = buffer.readInt32LE(offset)
offset += 4

// VIN
const vinLen = varuint.decode(buffer, offset)
offset += varuint.decode.bytes
console.log(`vinLen bytes = ${varuint.decode.bytes}`)

const hash = buffer.slice(offset, offset + 32)
offset += 32

const index = buffer.readUInt32LE(offset)
offset += 4

const scriptLen = varuint.decode(buffer, offset)
offset += varuint.decode.bytes
console.log(`scriptLen bytes = ${varuint.decode.bytes}`)

const script = buffer.slice(offset, offset + scriptLen)
offset += scriptLen

const sequence = buffer.readUInt32LE(offset)
offset += 4

// VOUT
const voutLen = varuint.decode(buffer, offset)
offset += varuint.decode.bytes

// VOUT-1
const valueA = buffer.readUInt32LE(offset)
const valueB = buffer.readUInt32LE(offset + 4)
const valueBB = valueB * 0x100000000
const value = valueA + valueBB
offset += 8

const lockingScriptLen = varuint.decode(buffer, offset)
offset += varuint.decode.bytes

const lockingScript = buffer.slice(offset, offset + lockingScriptLen)
offset += lockingScriptLen

// VOUT-2
const valueA2 = buffer.readUInt32LE(offset)
const valueB2 = buffer.readUInt32LE(offset + 4)
const valueBB2 = valueB2 * 0x100000000
const value2 = valueA2 + valueBB2
offset += 8

const lockingScriptLen2 = varuint.decode(buffer, offset)
offset += varuint.decode.bytes

const lockingScript2 = buffer.slice(offset, offset + lockingScriptLen2)
offset += lockingScriptLen2

// Locktime
const locktime = buffer.readUInt32LE(offset)
offset += 4


console.log(`version = ${version}`)
console.log(`vinLen = ${vinLen}`)
console.log(`hash = ${hash.toString('hex')}`)
console.log(`index = ${index}`)
console.log(`scriptLen = ${scriptLen}`)
console.log(`script = ${script.toString('hex')}`)
console.log(`sequence = ${sequence}`)
console.log(`voutLen = ${voutLen}`)
console.log(`valueA = ${valueA}`)
console.log(`valueB = ${valueB}`)
console.log(`valueB2 = ${valueBB}`)
console.log(`value = ${value}`)
console.log(`lockingScriptLen = ${lockingScriptLen}`)
console.log(`lockingScript = ${lockingScript.toString('hex')}`)
console.log(`value2 = ${value2}`)
console.log(`lockingScriptLen2 = ${lockingScriptLen2}`)
console.log(`lockingScriptLen2 = ${lockingScriptLen2}`)
console.log(`lockingScript2 = ${lockingScript2.toString('hex')}`)
console.log(`locktime = ${locktime}`)

console.log(`BUFFER LEFT = ${buffer.slice(offset).toString('hex')}`)