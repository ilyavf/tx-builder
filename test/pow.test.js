const { bufferInt32 } = require('../src/buffer-build')
const assert = require('assert')
const pow = require('../src/pow')

describe('proof-of-work', function () {
  describe('pow', function () {
    this.timeout(50 * 3600 * 1000) // 50 minutes
    const buffer = bufferInt32(25)
    const count = 2
    let i
    let nonce = 0
    for (i = 1; i <= count; i++) {
      (function (i) {
        it(`should calculate nonce for difficulty ${i}`, function () {
          if (i === 7) {
            nonce = 43190940
          }
          nonce = pow(i)(buffer, nonce)
          assert.ok(nonce)
        })
      }(i))
    }
  })
})

// Finished with: time = 741, nonce = 43190948, hash = 000000019ac673e207a146c5b9bc50961bdbbd6ecfd3d5630403a73fff451bdd
