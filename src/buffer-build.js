const Buffer = require('safe-buffer').Buffer
const varuint = require('varuint-bitcoin')
const typeforce = require('typeforce')

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

// bufferUInt64 :: Int -> Buffer
const bufferUInt64 = value => {
  const buffer = Buffer.allocUnsafe(8)
  buffer.writeInt32LE(value & -1)
  buffer.writeUInt32LE(Math.floor(value / 0x100000000), 4)
  return buffer
}

// bufferVarInt :: VarInt -> Buffer
const bufferVarInt = value => varuint.encode(value)

// bufferVarSlice :: Encoding -> String -> Buffer
const bufferVarSlice = encoding => {
  typeforce(typeforce.oneOf(
    typeforce.value('hex'),
    typeforce.value('ascii')
  ), encoding)
  return value => {
    const buffer = Buffer.from(value, encoding)
    const bVarInt = bufferVarInt(buffer.length)
    return Buffer.concat([bVarInt, buffer])
  }
}

// bufferVarSliceBuffer :: Buffer -> Buffer
const bufferVarSliceBuffer = buffer => {
  const bVarInt = bufferVarInt(buffer.length)
  return Buffer.concat([bVarInt, buffer])
}

// Creates a buffer from array of buffers: `<itemsCount><item1Length><item1><item2Length><item2>...`
// bufferVarArray :: Array -> Buffer
const bufferVarArray = arr => {
  const bVarInt = bufferVarInt(arr.length)
  return Buffer.concat([
    bVarInt,
    Buffer.concat(arr.map(bufferVarSliceBuffer))
  ])
}

/**
 * Maps function to array elements and concats results into a buffer.
 */
// mapConcatBuffers :: Fn -> Array -> Buffer
const mapConcatBuffers = bufferFn => vins =>
(
  Buffer.concat(
    [bufferVarInt(vins.length)].concat(vins.map(bufferFn))
  )
)

module.exports = {
  bufferUInt8,
  bufferInt32,
  bufferUInt32,
  bufferUInt64,
  bufferVarInt,
  bufferVarSlice,
  bufferVarSliceBuffer,
  bufferVarArray,
  mapConcatBuffers
}
