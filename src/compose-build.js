const typeforce = require('typeforce')

const EMPTY_BUFFER = Buffer.allocUnsafe(0)

// compose :: [Fn] -> Tx -> Buffer -> Buffer
const compose = args => (tx, buffer) => {
  typeforce(typeforce.Array, args)
  typeforce(typeforce.Object, tx)
  typeforce(typeforce.Buffer, buffer)
  return args.reduce((buffer, f) => Buffer.concat([buffer, f(tx)]), buffer)
}

// prop :: String -> Fn -> (Obj -> Buffer)
const prop = (propName, fn) => obj => fn(obj[propName])

// addProp :: String -> Fn -> Obj -> Buffer
addProp = (propName, fn) => obj => {
  obj[propName] = fn(obj)
  return EMPTY_BUFFER
}

module.exports = {
  compose,
  prop,
  addProp
}
