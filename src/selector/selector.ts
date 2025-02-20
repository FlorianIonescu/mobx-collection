import FlexibleStore from "$src/utils/flexible-store.js"

const KeyStore: FlexibleStore<any, symbol> = new FlexibleStore()

export default abstract class Selector<ItemType> {
  static key(...values: any[]) {
    const hit = KeyStore.get(...values)
    if (hit) return hit

    const key = Symbol()
    KeyStore.set(key, ...values)

    return key
  }

  // make a key that is the same for two Selectors if they make the same subsets
  key(): symbol {
    return Selector.key(this.constructor)
  }

  abstract select(item: ItemType): symbol
}
