
## Monadic composition

A monad is no more a scary unknown word. Everybody heard of them, and even is familiar with the examples such as `Maybe`, `Either`
or `IO` monads. However to use these monads in your day-to-day coding may take some time of learning and efforts of
trying.

> What I would like to suggest in this article is to use `monadic style composition` to build your apps.

**Yes! Let your own app to be like a monad!** *

We will write our app step-by-step starting with a traditional imperative style and finishing with a composable
functional style.

###### * - I say "like" because neither I want to get far deep into the Category Theory nor I am an expert in it.

### Intro

A monad is a way of composing functionality. It was invented to target mutations (e.g. state) and asynchronous IO
in a pure functional way. The idea is that gluing (side effects, io) is made outside of the main functions (which can stay pure), but
inside the compose helper. So, the most interesting thing here is that for every app there could be a different way
of composing its pieces.

Let's look at the following example of how a state mutation could be managed in a pure way.

### V1: manage state in a pure way imperatively

```js
function increaseTotal (state, value) {
  state.total + value
  return state
}
```
\- this is a pure function that's intended to update state's property based on some parameter input.

Now lets make another pure function that changes the state in some way, e.g. adds a new property with a value:
```js
function addNewProp (state, newPropValue) {
  state.newProp = newPropValue
  return state
}
```

and finally, lets write an app that uses (composes) these two functions together:
```js
const myApp = state => {
  state = increaseTotal(state, 10)
  state = addNewProp(state, 'test')
  return state
}
```
Technically, since in JavaScript an object is passed by a reference, in our "unit" functions we do not have to return
the state since we know that they only mutate the state and do not redefine it. But lets still do this in the sake of
demonstrating the purity.

### V2: use composition to avoid manual gluing

Now, lets see if we can come up with a `composeState` function to avoid gluing the results of our two unit functions manually.

```js
const composeState = (fn1, fn2, param1, param2, state) => {
  return fun2(fn1(state, param1), param2)
}
```

And our app can be defined now like this:
```
const myAppV2 = composeState(
  increaseTotal, addNewProp,
  10, "test",
  {total: 0}
)
```

Lets now improve the API and group a function and its parameter together. And also generalize our `composeState` to
work with an array of arguments:

```js
const composeState = (parameterizedFns, state) => {
  return parameterizedFns.reduce((state, ([fn, param])) => {
    return fn(state, param)
  }, state)
}

const myAppV2a = composeState(
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
// Notice that the setup parameter comes first, and the data parameter (state) comes last:
const increaseTotal = value => state {
  state.total + value
  return state
}

const addNewProp = newPropValue => state {
  state.newProp = newPropValue
  return state
}

const composeState = (fns, state) => {
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
initial params (the `state` in our case). Lets modify our `composeState` using currying:
```js
const composeState = fns => state => {
  return fns.reduce((state, fn) => {
    return fn(state, param)
  }, state)
}
```

And now we can define our app and call it later like this:
```js
const myAppV2b = composeState([
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
composition style. There are two "applications" in the package - a transaction builder and a decoder. Both have
their own composition functions because there are differences in how to glue the unit functions they are composed
of.

In the [next article](compose-decoder-explained.md) we are discussing how a transaction decoder is implemented.