import { makeAutoObservable, ObservableSet } from "mobx"
import { expect, test } from "vitest"
import Item from "./item"

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

test("Item reacts to _item changes and updates its props", () => {
  const dummy = new Dummy(1)
  const item = new Item(dummy)

  const isEven = (item: Item<Dummy>) => {
    return item._item.value % 2 === 0
  }
  const set: ObservableSet<Dummy> = new ObservableSet()

  item.addFilterProp(set, isEven)

  expect(set.size).toBe(0)
  dummy.set(2)
  expect(set.size).toBe(1)
  dummy.set(3)
  expect(set.size).toBe(0)
  dummy.set(4)
  expect(set.size).toBe(1)
  dummy.set(5)
  expect(set.size).toBe(0)
})
