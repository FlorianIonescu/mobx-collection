import Collection from "$src/collection.js"
import { expect, test } from "vitest"
import TypeSelector from "./type-selector.js"
import AndSelector from "./and-selector.js"
import PropPathSelector from "./prop-path-selector.js"

class A {
  constructor(public value: number) {}
}
class B {
  constructor(public value: number) {}
}
class C {
  constructor(public value: number) {}
}

test("AndSelector works", () => {
  const collection = new Collection<A | B | C>()
  const selector = new AndSelector(
    new TypeSelector(),
    new PropPathSelector("value")
  )
  collection.register(selector)

  collection.add(new A(1))
  collection.add(new A(2))
  collection.add(new A(2))
  collection.add(new B(1))
  collection.add(new B(1))
  collection.add(new B(2))

  expect(collection.filter(selector, A, 1).size).toBe(1)
  expect(collection.filter(selector, A, 2).size).toBe(2)
  expect(collection.filter(selector, B, 1).size).toBe(2)
  expect(collection.filter(selector, B, 2).size).toBe(1)
})
