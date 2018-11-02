const Buffer = require('safe-buffer').Buffer
const typeforce = require('typeforce')

const EMPTY_BUFFER = Buffer.allocUnsafe(0)

// compose :: [Fn] -> (Tx, Buffer) -> Buffer
const compose = args => (tx, buffer) => {
  typeforce(typeforce.Array, args)
  typeforce(typeforce.Object, tx)
  typeforce(typeforce.Buffer, buffer)
  return args.reduce((buffer, f) => Buffer.concat([buffer, f(tx)]), buffer)
}

// prop :: (String -> Fn a) -> (Obj -> a)
const prop = (propName, fn) => obj => fn(obj[propName])

// prop :: (Array -> Fn a) -> (Obj -> a)
const props = (propNames, fn) => obj => {
  const props = propNames.map(propName => obj[propName])
  return fn.apply(this, props)
}

// Allows to pass a static value to the function and still be composable.
// value :: a => Fn b => (() => b)
const value = (val, fn) => () => fn(val)

const iff = (predicate, fn, elseFn) => obj => {
  const res = predicate(obj)
  if (res) {
    return fn(obj)
  }
  return typeof elseFn === 'function' ? elseFn(obj) : EMPTY_BUFFER
}

const iffNot = (predicate, fn) => obj => (!predicate(obj) ? fn(obj) : EMPTY_BUFFER)

const has = prop => obj => (typeof obj[prop] !== 'undefined')

const hasNo = prop => obj => (typeof obj[prop] === 'undefined')

// addProp :: String -> Fn -> Obj -> Buffer
const addProp = (propName, fn) => obj => {
  obj[propName] = fn(obj)
  return EMPTY_BUFFER
}

module.exports = {
  EMPTY_BUFFER,
  compose,
  prop,
  props,
  addProp,
  iff,
  iffNot,
  has,
  hasNo,
  value
}
