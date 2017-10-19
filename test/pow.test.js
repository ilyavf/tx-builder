const { bufferInt32 } = require('../src/buffer-build')
const assert = require('assert')
const pow = require('../src/pow')

describe.only('proof-of-work', function () {
  describe('pow', function () {
    this.timeout(50 * 3600 * 1000) // 50 minutes
    const buffer = bufferInt32(25)
    const count = 10
    let i
    for (i = 1; i <= count; i++) {
      (function (i) {
        it(`should calculate nonce for difficulty ${i}`, function () {
          assert.ok(pow(i)(buffer))
        })
      }(i))
    }
  })
})
