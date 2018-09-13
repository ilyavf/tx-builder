const assert = require('assert')
const Buffer = require('safe-buffer').Buffer
const { compose, prop, props, iff, iffNot, has, hasNo } = require('../src/compose-build')

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
  describe('iff', function () {
    const myFn = () => Buffer.from([0x62])
    const myFn2 = () => Buffer.from([0x70])
    const predicate = ({doIt}) => doIt
    const app = compose([
      iff(predicate, myFn)
    ])
    it('should run myFn', function () {
      const res = app({doIt: true}, Buffer.allocUnsafe(0))
      assert.equal(res.toString('hex'), '62')
    })
    it('should skip myFn', function () {
      const res = app({doIt: false}, Buffer.allocUnsafe(0))
      assert.equal(res.toString('hex'), '')
    })
    it('should run myFn2 on else', function () {
      const app = compose([
        iff(predicate, myFn, myFn2)
      ])
      const res = app({doIt: false}, Buffer.allocUnsafe(0))
      assert.equal(res.toString('hex'), '70')
    })
  })
  describe('iffNot', function () {
    const myFn = () => Buffer.from([0x62])
    const predicate = ({doIt}) => doIt
    const app = compose([
      iffNot(predicate, myFn)
    ])
    it('should run myFn if false', function () {
      const res = app({doIt: false}, Buffer.allocUnsafe(0))
      assert.equal(res.toString('hex'), '62')
    })
    it('should skip myFn if true', function () {
      const res = app({doIt: true}, Buffer.allocUnsafe(0))
      assert.equal(res.toString('hex'), '')
    })
  })
  describe('predicate has', function () {
    it('should return false if given property is undefined on the object', function () {
      assert.ok(!has('a')({b: 1}))
    })
    it('should return true if given property is defined', function () {
      assert.ok(has('a')({a: 0, b: 1}))
    })
  })
  describe('predicate hasNo', function () {
    it('should return true if given property is undefined', function () {
      assert.ok(hasNo('a')({b: 1}))
    })
  })
})
