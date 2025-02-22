import { expect, test } from "vitest"
import Collection from "./collection.js"
import { makeAutoObservable, ObservableSet } from "mobx"
import Selector from "./selector/selector.js"

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

class IsEvenSelector extends Selector<Dummy> {
  select(item: Dummy) {
    return Selector.key(item.value % 2 === 0)
  }
}

test.only("Collection updates subsets based on selectors", () => {
  const collection = new Collection<Object>()
  expect(collection.size).toBe(0)

  const even = new IsEvenSelector()

  const dummy = new Dummy(1)
  collection.add(dummy)
  expect(collection.size).toBe(1)

  // collections return the same set per selector and group pair
  const a = collection.filter(even, true)
  const b = collection.filter(even, true)
  expect(a).toBe(b)

  // even for new instances
  const a2 = collection.filter(new IsEvenSelector(), true)
  const b2 = collection.filter(new IsEvenSelector(), true)
  expect(a2).toBe(b2)

  // get the two sets
  const evens = collection.filter(even, true)
  const odds = collection.filter(even, false)

  // both should be observable sets
  expect(evens).toBeInstanceOf(ObservableSet)
  expect(odds).toBeInstanceOf(ObservableSet)

  // the only dummy has value 1
  expect(evens.size).toBe(0)
  expect(odds.size).toBe(1)

  dummy.set(2)

  // now it's value two, should be flipped
  expect(evens.size).toBe(1)
  expect(odds.size).toBe(0)

  const dummy2 = new Dummy(3)
  collection.add(dummy2)
  expect(collection.size).toBe(2)

  // now there should be one in each
  expect(evens.size).toBe(1)
  expect(odds.size).toBe(1)

  dummy2.set(4)

  // this one should move as well
  expect(evens.size).toBe(2)
  expect(odds.size).toBe(0)

  collection.remove(dummy2)

  // removing an item is also possible
  expect(collection.size).toBe(1)
  expect(evens.size).toBe(1)
})
