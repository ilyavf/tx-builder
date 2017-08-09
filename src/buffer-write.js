const Buffer = require('safe-buffer').Buffer
const varuint = require('varuint-bitcoin')

const bufferInt32 = value => {
  const buffer = Buffer.allocUnsafe(4)
  buffer.writeInt32LE(value)
  return buffer
}

const bufferUInt32 = value => {
  const buffer = Buffer.allocUnsafe(4)
  buffer.writeUInt32LE(value)
  return buffer
}

const bufferVarInt = value => varuint.encode(value)

const bufferVarSlice = value => {
  const buffer = Buffer.from(value, 'hex')
  const bVarInt = bufferVarInt(buffer.length)
  return Buffer.concat([bVarInt, buffer])
}

module.exports = {
  bufferInt32,
  bufferUInt32,
  bufferVarInt,
  bufferVarSlice
}
