import Collection from "$src/collection.js"
import { expect, test } from "vitest"
import PropPathSelector from "./prop-path-selector.js"
import { makeAutoObservable } from "mobx"

class Dummy {
  value: number

  constructor(value: number) {
    this.value = value
    makeAutoObservable(this)
  }

  set(value: number) {
    this.value = value
  }

  get even() {
    return this.value % 2 === 0
  }
}

test("PropPathSelector works", () => {
  const collection = new Collection<Object>()

  const value = new PropPathSelector("value")
  const even = new PropPathSelector("even")

  const first = new Dummy(1)
  collection.add(first)
  collection.add(new Dummy(1))
  collection.add(new Dummy(2))

  const a = collection.filter(value, 1)
  const b = collection.filter(value, 2)
  const c = collection.filter(value, 4)
  const evens = collection.filter(even, true)
  const odds = collection.filter(even, false)

  expect(a.size).toBe(2)
  expect(b.size).toBe(1)
  expect(c.size).toBe(0)
  expect(evens.size).toBe(1)
  expect(odds.size).toBe(2)

  first.set(4)

  expect(a.size).toBe(1)
  expect(b.size).toBe(1)
  expect(c.size).toBe(1)
  expect(evens.size).toBe(2)
  expect(odds.size).toBe(1)
})
