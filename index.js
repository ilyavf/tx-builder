const decoder = require('./src/tx-decoder')
const decoderBuffer = require('./src/buffer-read')
const decoderCompose = require('./src/compose-read')

const builder = require('./src/tx-builder')
const builderBuffer = require('./src/buffer-build')
const builderCompose = require('./src/compose-build')

const pow = require('./src/pow')

decoder.bufferHelpers = decoderBuffer
decoder.composeHelpers = decoderCompose

builder.bufferHelpers = builderBuffer
builder.composeHelpers = builderCompose

module.exports = {
  decoder,
  builder,
  hashFromBuffer: decoder.getTxId,
  signBuffer: builder.signBuffer,
  pow
}
