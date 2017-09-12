
## Monadic composition

A monad is no more a scary unknown word. Everybody heard of them, and even of examples such as `Maybe`, `Either`
or `IO` monads. However to use these monads in your day-to-day coding may take some time of learning and efforts of
trying.

> What I would like to suggest in this article is to use `monadic style composition` to build your apps.

**Yes! Let your own app to be like a monad!** *

We will write our app step-by-step starting with a traditional imperative style and finishing with a composable
functional style.

###### * - I say "like" because neither I want to get far deep into the Category Theory nor I am an expert in it.

### Intro

A monad is a way of composing functionality. It was invented to target mutations (e.g. state) and asynchronous IO
in a pure functional way. Let's look at the following example of how a state mutation could be managed in a pure way.

### V1: manage state in a pure way imperatively

```js
function increaseTotal (state, value) {
  state.total + value
  return state
}
```
- this is a pure function that's intended to update state property based on some parameter input.

Now lets make another pure function that changes the state in some way
```js
function addNewProp (state, newPropValue) {
  state.newProp = newPropValue
  return state
}
```

and finally, lets write a composition of these two functions:
```js
const myApp = state => {
  state = increaseTotal(state, 10)
  state = addNewProp(state, 'test')
  return state
}
```
Technically we do not have to return state since we knew that our unit functions only mutate the state and does not
redefine it.

### V2: use composition to avoid manual gluing

Now, lets see if we can come up with a `compose` function to avoid gluing the results of our two unit functions manually.

```js
const compose = (fn1, fn2, param1, param2, state) => {
  return fun2(fn1(state, param1), param2)
}
```

And our app can be defined now like this:
```
const myAppV2 = compose(
  increaseTotal, addNewProp,
  10, "test",
  {total: 0}
)
```

Of course we can be fancy: group a function and its param together, and generalize our `compose` to work with an array
of arguments:

```js
const compose = (parameterizedFns, state) => {
  return parameterizedFns.reduce((state, ([fn, param])) => {
    return fn(state, param)
  }, state)
}

const myAppV2a = compose(
  [
    [increaseTotal, 10],
    [addNewProp, "test"],
  ],
  {total: 0}
)
```
Isn't it looking much better now?

Or we even can use currying to setup our function avoiding grouping with an array so that we don't have to destruct
pairs inside our compose function:
```js
const increaseTotal = state => value {
  state.total + value
  return state
}

const addNewProp = state => newPropValue {
  state.newProp = newPropValue
  return state
}

const compose = (fns, state) => {
  return fns.reduce((state, fn) => {
    return fn(state, param)
  }, state)
}

const myAppV2b = compose([
  increaseTotal(10),
  addNewProp("test"),
], {total: 0})
```

### V3: an ideal composition

Something here is still not ideal. We would like to define our app first and only then call it passing some
initial params (the `state` in our case). Lets modify our `compose` using currying:
```js
const compose = fns => state => {
  return fns.reduce((state, fn) => {
    return fn(state, param)
  }, state)
}
```

And now we can define our app and call it later like this:
```js
const myAppV2b = compose([
  increaseTotal(10),
  addNewProp("test")
])

myAppV3({total: 0})
```

I claim that this is the most declarative and friendly way to build apps :)

### Summary

We created our own composition function to allow declaring of our app in a composable (monadic) style. The key here
is to understand that the pieces of our app act similarly and can be composed in the same manner.

Moreover, apps that are declared this way can be composed using the same composition function! Yes, my friend, welcome
to the world of composition!

### What's next?

Feel free to check out a real-world example app - [tx-builder](https://www.npmjs.com/package/tx-builder).
This package provides some composition helpers that allow to make a Blockchain transaction builder in the monadic
composition style.