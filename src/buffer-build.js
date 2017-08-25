const Buffer = require('safe-buffer').Buffer
const varuint = require('varuint-bitcoin')

// bufferUInt8 :: Int -> Buffer
const bufferUInt8 = value => {
  const buffer = Buffer.allocUnsafe(1)
  buffer.writeUInt8(value)
  return buffer
}

// bufferInt32 :: Int -> Buffer
const bufferInt32 = value => {
  const buffer = Buffer.allocUnsafe(4)
  buffer.writeInt32LE(value)
  return buffer
}

// bufferInt32 :: Int -> Buffer
const bufferUInt32 = value => {
  const buffer = Buffer.allocUnsafe(4)
  buffer.writeUInt32LE(value)
  return buffer
}

// bufferInt32 :: Int -> Buffer
const bufferUInt64 = value => {
  const buffer = Buffer.allocUnsafe(8)
  buffer.writeInt32LE(value & -1)
  buffer.writeUInt32LE(Math.floor(value / 0x100000000), 4)
  return buffer
}

// bufferVarInt :: VarInt -> Buffer
const bufferVarInt = value => varuint.encode(value)

// bufferVarSlice :: String -> String -> Buffer
const bufferVarSlice = encoding => value => {
  const buffer = Buffer.from(value, 'hex')
  const bVarInt = bufferVarInt(buffer.length)
  return Buffer.concat([bVarInt, buffer])
}

module.exports = {
  bufferUInt8,
  bufferInt32,
  bufferUInt32,
  bufferUInt64,
  bufferVarInt,
  bufferVarSlice
}
