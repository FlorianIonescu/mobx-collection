import { expect, test } from "vitest"
import FlexibleStore from "./flexible-store.js"

test("FlexibleStore works", () => {
  const store = new FlexibleStore()

  // simple setters and getters work
  store.set(12, "a")
  expect(store.get("a")).toBe(12)
  expect(store.get("b")).toBeUndefined()

  // paths that overlap don't overwrite values
  store.set(13, "a", "b", "c")
  expect(store.get("a")).toBe(12)
  expect(store.get("a", "b", "c")).toBe(13)

  // deleting a deep value also cleans up that part of the tree
  store.delete("a", "b", "c")
  expect(store.nodes.size).toBe(0)
  expect(store.get("a", "b", "c")).toBeUndefined()
})
