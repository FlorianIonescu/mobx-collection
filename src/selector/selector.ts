import Explanation from "$src/types/explanation.js"
import FlexibleStore from "$src/utils/flexible-store.js"

const KeyStore: FlexibleStore<any, symbol> = new FlexibleStore()

function formatExplanation(node: Explanation, indent = 0) {
  if (typeof node === "string") {
    return " ".repeat(indent) + node
  } else {
    return node.map((child) => formatExplanation(child, indent + 2)).join("\n")
  }
}

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

  abstract explain(...values: any[]): Explanation[]

  info(...values: any[]): void {
    const explanation = this.explain(...values)
    console.info(
      formatExplanation(["you will get all the items that", explanation])
    )
  }
}
