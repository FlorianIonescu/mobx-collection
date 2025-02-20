import FlexibleStore from "$src/utils/flexible-store.js"

const KeyStore: FlexibleStore<any, symbol> = new FlexibleStore()
const defaultKey = Symbol()

export default abstract class Selector<ItemType> {
  abstract select(item: ItemType): symbol

  key(): symbol {
    return Selector.key(this.constructor)
  }

  static key(...values: any[]) {
    const hit = KeyStore.get(...values)
    if (hit) return hit

    const key = Symbol()
    KeyStore.set(key, ...values)

    return key
  }
}
