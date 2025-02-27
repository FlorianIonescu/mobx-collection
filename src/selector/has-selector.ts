import Selector from "./selector.js"
import Explanation from "$src/types/explanation.js"
import { ObservableSet } from "mobx"

export default class HasSelector<T extends Object> extends Selector<T> {
  makeSet: (item: T) => ObservableSet<T>

  constructor(makeSet: (item: T) => ObservableSet<T>) {
    super()
    this.makeSet = makeSet
  }

  key() {
    return Selector.key(HasSelector, this.makeSet)
  }

  select(item: T): symbol {
    const set = this.makeSet(item)
    const group = set.size > 0
    return Selector.key(group)
  }

  explain(item: any, value: boolean): Explanation[] {
    return [
      `${value ? "have" : "have no"} items returned from '${
        this.makeSet.name
      }'`,
    ]
  }
}
