import { expect, test } from "vitest"
import Collection from "./collection"
import { autorun, makeAutoObservable, spy, trace } from "mobx"

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

test.only("Collection updates subsets based on filters", () => {
  const collection = new Collection<Dummy>()

  const isEven = (item: Dummy) => item.value % 2 === 0
  const isBigger = (item: Dummy) => item.value > 5
  const even = collection.addItemFilter(isEven)
  const bigger = collection.addItemFilter(isBigger)
  const both = collection.addCompositeFilter(
    ([even, bigger]) => even && bigger,
    [isEven, isBigger]
  )

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

test("Collection works even with filters referencing other subsets", () => {
  const collection = new Collection<Dummy>()

  const even = collection.addItemFilter((item) => item.value % 2 === 0)
  const more = collection.addItemFilter(() => even.size > 2)

  console.log([...more])

  collection.add(new Dummy(1))
  collection.add(new Dummy(2))
  collection.add(new Dummy(3))
  collection.add(new Dummy(4))
  collection.add(new Dummy(5))
  collection.add(new Dummy(6))

  console.log([...more])
})
