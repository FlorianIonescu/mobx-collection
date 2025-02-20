import { makeAutoObservable, ObservableSet } from "mobx"
import { expect, test } from "vitest"
import Item from "./item.js"
import BidirectionalMap from "./utils/bidirectional-map.js"
import Selector from "./selector/selector.js"
import SelectionCache from "./types/selection-cache.js"

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

class IsEvenSelector extends Selector<Dummy, boolean> {
  select(item: Dummy): boolean {
    return item.value % 2 === 0
  }
}

test("Item reacts to _item changes and updates its props", () => {
  const dummy = new Dummy(1)
  const item = new Item(dummy)

  const selector = new IsEvenSelector()
  const cache: SelectionCache<Dummy, boolean> = new BidirectionalMap<
    boolean,
    ObservableSet<Dummy>
  >()
  item.addProp(selector, cache)

  const a = cache.forward(true)
  expect(a).not.toBeDefined()

  dummy.set(2)

  const b = cache.forward(true)
  expect(b).toBeDefined()
  expect(b.size).toBe(1)

  dummy.set(1)

  const c = cache.forward(true)
  expect(c).toBeDefined()
  expect(c.size).toBe(0)

  expect(b).toBe(c)
})
