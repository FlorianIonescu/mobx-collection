import Explanation from "$src/types/explanation.js"
import Selector from "./selector.js"

type Predicate<T> = (item: T) => any

export default class PredicateSelector<T extends Object> extends Selector<T> {
  predicate: Predicate<T>

  constructor(predicate: Predicate<T>) {
    super()
    this.predicate = predicate
  }

  key() {
    return Selector.key(PredicateSelector, this.predicate)
  }

  select(item: T): symbol {
    return Selector.key(this.predicate(item))
  }

  explain(value: any): Explanation[] {
    return [
      `are having the value '${value}' returned by '${this.predicate.name}'`,
    ]
  }
}
