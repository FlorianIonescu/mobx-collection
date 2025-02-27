import Explanation from "$src/types/explanation.js"
import Selector from "./selector.js"

export default class AndSelector<T extends Object> extends Selector<T> {
  selectors: Selector<T>[]
  constructor(...selectors: Selector<T>[]) {
    super()
    this.selectors = selectors
  }

  key() {
    return Selector.key(AndSelector, ...this.selectors.map((s) => s.key()))
  }

  select(item: T) {
    return Selector.key(...this.selectors.map((s) => s.select(item)))
  }

  explain(...values: any[]): Explanation[] {
    return this.selectors.reduce((prev, cur, index) => {
      const next = cur.explain(values[index])
      if (prev.length) {
        return [...prev, "and", ...next]
      } else {
        return [...next]
      }
    }, [])
  }
}
