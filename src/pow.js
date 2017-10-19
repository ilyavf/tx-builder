const Buffer = require('safe-buffer').Buffer
const { bufferUInt64 } = require('./buffer-build')
const hashFromBuffer = require('./tx-decoder').getTxId

// pow :: Buffer -> Number -> NonceNumber
const pow = difficulty => (buffer, nonce = 0) => {
  let hash
  let now = Date.now()
  const check = [...Array(difficulty)].reduce(acc => acc + '0', '')
  nonce--
  console.log(`Starting PoW for ${difficulty}:`)
  do {
    nonce++
    hash = hashFromBuffer(Buffer.concat([buffer, bufferUInt64(nonce)]))
    if (nonce % 5000 * 1000 === 0) {  // (5 * 10^6) takes ~30sec
      console.log(`- ${Math.floor((Date.now() - now) / 1000)}, nonce = ${nonce}, hash = ${hash}`)
    }
  } while (hash.slice(0, difficulty) !== check)
  console.log(`Finished with: time = ${Math.floor((Date.now() - now) / 1000)}, nonce = ${nonce}, hash = ${hash}`)
  return nonce
}

module.exports = pow
