const Buffer = require('safe-buffer').Buffer
const varuint = require('varuint-bitcoin')
const typeforce = require('typeforce')

const readSlice = offset => buffer => {
  return [buffer.slice(0, offset), buffer.slice(offset)]
}

// readUInt32 :: Buffer -> (Res, Buffer)
function readUInt32 (buffer) {
  typeforce(typeforce.Buffer, buffer)
  var i = buffer.readUInt32LE(0)
  return [i, buffer.slice(4)]
}

// readUInt32 :: Buffer -> (Res, Buffer)
function readInt32 (buffer) {
  typeforce(typeforce.Buffer, buffer)
  var i = buffer.readInt32LE(0)
  return [i, buffer.slice(4)]
}

function readUInt64LE (buffer, offset) {
  var a = buffer.readUInt32LE(offset)
  var b = buffer.readUInt32LE(offset + 4)
  b *= 0x100000000

  // verifuint(b + a, 0x001fffffffffffff)

  return b + a
}

function readUInt64 (buffer) { // eslint-disable-line no-unused-vars
  var i = readUInt64LE(buffer, 8)
  return [i, buffer.slice(8)]
}

// readVarInt :: Buffer -> (Res, Buffer)
function readVarInt (buffer) {
  var vi = varuint.decode(buffer, 0)
  return [vi, buffer.slice(varuint.decode.bytes)]
}

// readVarSlice :: Buffer -> (Res, Buffer)
function readVarSlice (buffer) {
  const [len, offset] = readVarInt(buffer)
  const [res, offset2] = readSlice(len)(buffer.slice(offset))
  return [res, buffer.slice(offset + offset2)]
}




const txHex = '0100000001545f6161d2be3bdfe7184ee1f72123c3918738da8b97f11e23acdd34059f7a2d010000006b4830450221008c33d765ae16cfa3cc653c5c039d58131fbbdf76266af7a76910fc1ba39de0b8022048ae83fc9b82f62b816641158dd1cfd398d2c56d5f6f812c9fa588947311d8400121033701fc7f242ae2dd63a18753518b6d1425e53496878924b6c0dc08d800af46adffffffff0200e1f505000000001976a91461ca8116d03694952a3ad252d53c695da7d95f6188ac18ddf505000000001976a9145e9f5c8cc17ecaaea1b4e5a3d091ca0aed1342f788ac00000000'
const buffer = Buffer.from(txHex, 'hex')

// compose :: adds -> (state -> buffer -> [state, buffer])
function compose (args) {
  return function (state, buffer) {
    typeforce(typeforce.Buffer, buffer)
    args.reduce(([state, buffer], f) => f(state, buffer), [state, buffer])
    return [state, buffer]
  }
}
// add :: propName -> f -> (state -> buffer -> [state, buffer])
function add (propName, f) {
  return function (state, buffer) {
    typeforce(typeforce.Buffer, buffer)
    const [res, bufferLeft] = f(buffer)
    state[propName] = res
    return [state, bufferLeft]
  }
}

console.log(readInt32(buffer))

// readInputs :: Buffer -> (Res, Offset)
function readInputs (buffer) {
  const vins = []
  let [vinLen, bufferLeft] = readVarInt(buffer)
  let vin
  for (let i = 0; i < vinLen; ++i) {
    [vin, bufferLeft] = readInput(bufferLeft)
    vins.push(vin)
  }
  return [vins, bufferLeft]
}
function readOutputs (buffer) {

  // var voutLen = readVarInt()
  // tx.outs.push({
  //   value: readUInt64(),
  //   script: readVarSlice()
  // })

  const vout = []
  return [vout, buffer]
}



// decodeTx :: buffer -> [vin, buffer]
const decodeTx = buffer =>
(
  compose([
    add('version', readInt32),
    add('vin', readInputs),
    add('vout', readOutputs),
    add('locktime', readUInt32)
  ])({}, buffer)
)

// compose :: adds -> (state -> buffer -> [state, buffer])
const readInput = buffer =>
(
  compose([
    add('hash', readSlice(32)),
    add('index', readUInt32),
    add('script', readVarSlice),
    add('sequence', readUInt32)
  ])({}, buffer)
)

try {
  console.log(decodeTx(buffer))
} catch(e) {
  console.log(e)
}

module.exports = {
  readInt32
}
