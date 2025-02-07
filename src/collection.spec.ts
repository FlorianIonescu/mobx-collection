import { expect, test } from "vitest"
import Collection from "./collection"
import { autorun, makeAutoObservable } from "mobx"

class Dummy {
  value: number
  constructor(value: number) {
    this.value = value
    makeAutoObservable(this)
  }

  set(value: number) {
    this.value = value
  }
}

test("Collection updates subsets based on filters", () => {
  const collection = new Collection<Dummy>()

  const isEven = (item: Dummy) => item.value % 2 === 0
  const isBigger = (item: Dummy) => item.value > 5
  const even = collection.filter(isEven)
  const bigger = collection.filter(isBigger)
  const both = collection.filter({
    predicate: (_item, [even, bigger]) => even && bigger,
    dependencies: [isEven, isBigger],
  })

  let updates = 0

  autorun(() => {
    ;[...even]
    updates++
  })

  autorun(() => {
    ;[...bigger]
    updates++
  })

  autorun(() => {
    ;[...both]
    updates++
  })

  expect(updates).toBe(3)

  const a = new Dummy(2)

  collection.add(a)
  expect(even.size).toBe(1)
  expect(bigger.size).toBe(0)
  expect(both.size).toBe(0)
  expect(updates).toBe(4)

  collection.add(new Dummy(7))
  expect(even.size).toBe(1)
  expect(bigger.size).toBe(1)
  expect(both.size).toBe(0)
  expect(updates).toBe(5)

  collection.add(new Dummy(4))
  expect(even.size).toBe(2)
  expect(bigger.size).toBe(1)
  expect(both.size).toBe(0)
  expect(updates).toBe(6)

  collection.add(new Dummy(8))
  expect(even.size).toBe(3)
  expect(bigger.size).toBe(2)
  expect(both.size).toBe(1)
  expect(updates).toBe(9)

  a.set(6)
  expect(even.size).toBe(3)
  expect(bigger.size).toBe(3)
  expect(both.size).toBe(2)
  expect(updates).toBe(11)

  collection.remove(a)
  expect(even.size).toBe(2)
  expect(bigger.size).toBe(2)
  expect(both.size).toBe(1)
  expect(updates).toBe(14)
})

test("Collection works for simple cases", () => {
  const collection = new Collection<Dummy>()

  const isEven = (item: Dummy) => item.value % 2 === 0
  const isBigger = (item: Dummy) => item.value > 5
  const even = collection.filter(isEven)
  const bigger = collection.filter(isBigger)

  const a = new Dummy(2)
  collection.add(a)
  expect(even.size).toBe(1)
  expect(bigger.size).toBe(0)

  collection.add(new Dummy(7))
  expect(even.size).toBe(1)
  expect(bigger.size).toBe(1)

  collection.add(new Dummy(4))
  expect(even.size).toBe(2)
  expect(bigger.size).toBe(1)

  collection.add(new Dummy(8))
  expect(even.size).toBe(3)
  expect(bigger.size).toBe(2)

  a.set(6)
  expect(even.size).toBe(3)
  expect(bigger.size).toBe(3)

  collection.remove(a)
  expect(even.size).toBe(2)
  expect(bigger.size).toBe(2)
})

test("Collection works with filters that depend on other collections", () => {
  const collection = new Collection<Dummy>()

  const isEven = (item: Dummy) => item.value % 2 === 0
  const even = collection.filter(isEven)

  const moreThanTwoEvens = (item: Dummy) => {
    return even.size > 2
  }
  const referenced = collection.filter(moreThanTwoEvens)

  let updates = 0

  autorun(() => {
    ;[...referenced]
    updates++
  })

  expect(updates).toBe(1)
  expect(referenced.size).toBe(0)
  collection.add(new Dummy(2))
  expect(updates).toBe(1)
  expect(referenced.size).toBe(0)
  collection.add(new Dummy(4))
  expect(updates).toBe(1)
  expect(referenced.size).toBe(0)
  collection.add(new Dummy(6))
  expect(updates).toBe(2)
  expect(referenced.size).toBe(3)
})

test("Collection's filter method returns existing result sets if predicate is already tracked'", () => {
  const collection = new Collection<Dummy>()

  const isEven = (item: Dummy) => item.value % 2 === 0
  const even = collection.filter(isEven)

  expect(even.size).toBe(0)
  collection.add(new Dummy(2))
  collection.add(new Dummy(4))
  collection.add(new Dummy(6))
})

test("Collection's filter throws if a filter is added with a missing dependency'", () => {
  const collection = new Collection<Dummy>()

  const isBigger = (item: Dummy) => item.value > 5

  const isEven = (item: Dummy) => item.value % 2 === 0
  expect(() => {
    collection.filter({
      predicate: isEven,
      dependencies: [isBigger],
    })
  }).toThrowError()
})
