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
          nonce = pow(i)(buffer, nonce, 4)
          assert.ok(nonce)
        })
      }(i))
    }
  })
})

// Finished for 6 with: time = 3,   nonce = 660344,   hash = 000000d9dcd88ea53e11bf7ecd376ece32a3bf68845ebfee2e92b1ac2e206978
// Finished 7 / 1 with: time = 741, nonce = 43190948, hash = 000000019ac673e207a146c5b9bc50961bdbbd6ecfd3d5630403a73fff451bdd
// Finished 7 / 4 with: time = 55, nonce = 43190948, hash = 000000019ac673e207a146c5b9bc50961bdbbd6ecfd3d5630403a73fff451bdd
