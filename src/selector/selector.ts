import FlexibleStore from "$src/utils/flexible-store.js"

const KeyStore: FlexibleStore<any, symbol> = new FlexibleStore()

export default abstract class Selector<ItemType> {
  abstract select(item: ItemType): any[]

  static key(...values: any[]) {
    const hit = KeyStore.get(...values)
    if (hit) return hit

    const key = Symbol()
    KeyStore.set(key, ...values)

    return key
  }
}
