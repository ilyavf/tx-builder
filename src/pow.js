const Buffer = require('safe-buffer').Buffer
const { bufferUInt64 } = require('./buffer-build')
const hashFromBuffer = require('./tx-decoder').getTxId

// pow :: (Number, Options) -> (Buffer, Number, Number) -> NonceNumber
const pow = (difficulty, options) => (buffer, nonce = 0, increment = 1) => {
  let hash
  let now = Date.now()
  const check = Array(difficulty).fill('0').join('')
  console.log(`Starting PoW for ${difficulty} (${check}), initial nonce = ${nonce}:`)
  do {
    hash = hashFromBuffer(options)(Buffer.concat([buffer, bufferUInt64(nonce)]))
    if (nonce % (10 * 1000 * 1000) === 0) {  // (10^7) takes ~45sec
      console.log(`- ${Math.floor((Date.now() - now) / 1000)}, nonce = ${nonce}, hash = ${hash}`)
    }
    nonce += increment
  } while (hash.slice(0, difficulty) !== check)
  console.log(`Finished ${difficulty} with: time = ${Math.floor((Date.now() - now) / 1000)}, nonce = ${nonce}, hash = ${hash}`)
  return nonce
}

module.exports = pow
