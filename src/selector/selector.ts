import FlexibleStore from "$src/utils/flexible-store.js"

const KeyStore: FlexibleStore<any, symbol> = new FlexibleStore()
const defaultKey = Symbol()

export default abstract class Selector<ItemType> {
  abstract select(item: ItemType): symbol

  key(): symbol {
    return defaultKey
  }

  hash(): symbol {
    const key = this.key()
    if (key === defaultKey) return Selector.key(this.constructor)

    return Selector.key(this.constructor, key)
  }

  static key(...values: any[]) {
    const hit = KeyStore.get(...values)
    if (hit) return hit

    const key = Symbol()
    KeyStore.set(key, ...values)

    return key
  }
}
