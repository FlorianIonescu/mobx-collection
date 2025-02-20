import Collection from "$src/collection.js"
import { expect, test } from "vitest"
import TypeSelector from "./type-selector.js"

class A {}
class B {}
class C {}

test("TypeSelector works", () => {
  const collection = new Collection<Object>()
  const selector = new TypeSelector()
  collection.register(selector)

  collection.add(new A())
  collection.add(new A())
  collection.add(new B())

  const a = collection.filter(selector, A)
  const b = collection.filter(selector, B)
  const c = collection.filter(selector, C)

  expect(a.size).toBe(2)
  expect(b.size).toBe(1)
  expect(c.size).toBe(0)
})
