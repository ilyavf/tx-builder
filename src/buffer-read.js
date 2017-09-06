const varuint = require('varuint-bitcoin')
const typeforce = require('typeforce')

// readSlice :: Number -> Buffer -> (Buffer, Buffer)
const readSlice = offset => buffer => {
  return [buffer.slice(0, offset), buffer.slice(offset)]
}

// readUInt32 :: Buffer -> (Number, Buffer)
function readUInt32 (buffer) {
  typeforce(typeforce.Buffer, buffer)
  const i = buffer.readUInt32LE(0)
  return [i, buffer.slice(4)]
}

// readInt32 :: Buffer -> (Number, Buffer)
function readInt32 (buffer) {
  typeforce(typeforce.Buffer, buffer)
  const i = buffer.readInt32LE(0)
  return [i, buffer.slice(4)]
}

// readUInt64 :: Buffer -> (Number, Buffer)
function readUInt64 (buffer) {
  typeforce(typeforce.Buffer, buffer)
  const a = buffer.readUInt32LE(0)
  let b = buffer.readUInt32LE(4)
  b *= 0x100000000
  // verifuint(b + a, 0x001fffffffffffff)
  return [b + a, buffer.slice(8)]
}

// readVarInt :: Buffer -> (Res, Buffer)
function readVarInt (buffer) {
  const vi = varuint.decode(buffer, 0)
  return [vi, buffer.slice(varuint.decode.bytes)]
}

// readVarSlice :: Buffer -> (Res, Buffer)
function readVarSlice (buffer) {
  const [len, bufferLeft] = readVarInt(buffer)
  const [res, bufferLeft2] = readSlice(len)(bufferLeft)
  return [res, bufferLeft2]
}

module.exports = {
  readSlice,
  readInt32,
  readUInt32,
  readUInt64,
  readVarInt,
  readVarSlice
}
