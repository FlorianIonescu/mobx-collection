import Collection from "$src/collection.js"
import { expect, test } from "vitest"
import PredicateSelector from "./predicate-selector.js"

class Dummy {
  constructor(public value: number) {}
}

test("TypeSelector works", () => {
  const collection = new Collection<Object>()
  const over = new PredicateSelector((item: Dummy) => item.value > 3)
  const even = new PredicateSelector((item: Dummy) => item.value % 2 === 0)

  collection.add(new Dummy(1))
  collection.add(new Dummy(2))
  collection.add(new Dummy(3))
  collection.add(new Dummy(4))
  collection.add(new Dummy(5))
  collection.add(new Dummy(6))
  collection.add(new Dummy(7))

  expect(collection.filter(over, true).size).toBe(4)
  expect(collection.filter(over, false).size).toBe(3)
  expect(collection.filter(even, true).size).toBe(3)
  expect(collection.filter(even, false).size).toBe(4)
})
