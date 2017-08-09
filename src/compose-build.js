const typeforce = require('typeforce')

// compose :: [Fn] -> Tx -> Buffer -> Buffer
const compose = args => (tx, buffer) => {
  typeforce(typeforce.Array, args)
  typeforce(typeforce.Object, tx)
  typeforce(typeforce.Buffer, buffer)
  return args.reduce((buffer, f) => Buffer.concat([buffer, f(tx)]), buffer)
}

// prop :: String -> Fn -> (Obj -> Buffer)
const prop = (propName, fn) => obj => fn(obj[propName])

module.exports = {
  compose,
  prop
}
