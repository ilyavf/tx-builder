const { compose, addProp } = require('./compose')
const {
  readSlice,
  readUInt32,
  readInt32,
  readUInt64,
  readVarInt,
  readVarSlice
} = require('./buffer-utils')

// readInputs :: Buffer -> (Res, Offset)
const readInputs = readFn => buffer => {
  const vins = []
  let [vinLen, bufferLeft] = readVarInt(buffer)
  let vin
  for (let i = 0; i < vinLen; ++i) {
    [vin, bufferLeft] = readFn(bufferLeft)
    vins.push(vin)
  }
  return [vins, bufferLeft]
}

// decodeTx :: buffer -> [vin, buffer]
const decodeTx = buffer =>
(
  compose([
    addProp('version', readInt32),
    addProp('vin', readInputs(readInput)),
    addProp('vout', readInputs(readOutput)),
    addProp('locktime', readUInt32)
  ])({}, buffer)
)

// readInput :: Buffer -> [Res, Buffer]
const readInput = buffer =>
(
  compose([
    addProp('hash', readSlice(32)),
    addProp('index', readUInt32),
    addProp('script', readVarSlice),
    addProp('sequence', readUInt32)
  ])({}, buffer)
)

// readOutput :: Buffer -> [Res, Buffer]
const readOutput = buffer =>
(
  compose([
    addProp('value', readUInt64),
    addProp('script', readVarSlice)
  ])({}, buffer)
)

module.exports = {
  decodeTx,
  readInputs,
  readInput,
  readOutput
}
