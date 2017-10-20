const Buffer = require('safe-buffer').Buffer
const { bufferUInt64 } = require('./buffer-build')
const hashFromBuffer = require('./tx-decoder').getTxId

// pow :: Number -> (Buffer, Number, Number) -> NonceNumber
const pow = difficulty => (buffer, nonce = 0, increment = 1) => {
  let hash
  let now = Date.now()
  const check = Array(difficulty).fill('0').join('')
  nonce -= increment
  console.log(`Starting PoW for ${difficulty} (${check}), initial nonce = ${nonce}:`)
  do {
    nonce += increment
    hash = hashFromBuffer(Buffer.concat([buffer, bufferUInt64(nonce)]))
    if (nonce % (1 * 1000 * 1000) === 0) {  // (10^7) takes ~168sec
      console.log(`- ${Math.floor((Date.now() - now) / 1000)}, nonce = ${nonce}, hash = ${hash}`)
    }
  } while (hash.slice(0, difficulty) !== check)
  console.log(`Finished ${difficulty} with: time = ${Math.floor((Date.now() - now) / 1000)}, nonce = ${nonce}, hash = ${hash}`)
  return nonce
}

module.exports = pow
