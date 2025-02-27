import Collection from "$src/collection.js"
import { expect, test } from "vitest"
import PropPathSelector from "./prop-path-selector.js"
import { makeAutoObservable } from "mobx"
import HasSelector from "./has-selector.js"
import TypeSelector from "./type-selector.js"
import AndSelector from "./and-selector.js"

class Dummy {
  id: string
  parent?: Dummy

  constructor(parent?: Dummy) {
    makeAutoObservable(this)

    if (parent) this.parent = parent
    this.id = "example-id"
  }
}

class Dummy2 {
  parent?: Dummy

  constructor(parent?: Dummy) {
    makeAutoObservable(this)

    if (parent) this.parent = parent
  }
}

test("HasSelector works", () => {
  const collection = new Collection<Object>()

  const getChildren = (item: any) => {
    return collection.filter(new PropPathSelector("parent"), item)
  }
  const hasChildren = new HasSelector(getChildren)

  const a = new Dummy()
  collection.add(a)

  expect(collection.filter(hasChildren, a).size).toBe(0)

  collection.add(new Dummy(a))
  collection.add(new Dummy(a))

  expect(collection.filter(hasChildren, true).size).toBe(1)
})

test("HasSelector works with composite keys as well", () => {
  const collection = new Collection<Object>()

  const a = new Dummy()
  collection.add(a)

  collection.add(new Dummy(a))
  collection.add(new Dummy(a))

  const getDummy2Children = (item: any) => {
    return collection.filter(
      new AndSelector(new TypeSelector(), new PropPathSelector("parent")),
      Dummy2,
      item
    )
  }

  const players = collection.filter(
    new AndSelector(new TypeSelector(), new HasSelector(getDummy2Children)),
    Dummy,
    true
  )

  expect(players.size).toBe(0)

  collection.add(new Dummy2(a))
  collection.add(new Dummy2(a))

  expect(players.size).toBe(1)
})
