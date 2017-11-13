const assert = require('assert')
const { prop, props } = require('../src/compose-build')

describe('compose-build', function () {
  describe('prop', function () {
    it('should create a function that expects the desired prop as argument', function () {
      const obj = {
        a: 5,
        b: 6
      }
      const myFn = a => a + 10
      const myApp = prop('a', myFn)
      assert.equal(myApp(obj), 15)
    })
  })
  describe('props', function () {
    it('should create a function that expects the desired props as arguments', function () {
      const obj = {
        a: 5,
        b: 6
      }
      const myFn = (a, b) => a + b
      const myApp = props(['a', 'b'], myFn)
      assert.equal(myApp(obj), 11)
    })
  })
})
