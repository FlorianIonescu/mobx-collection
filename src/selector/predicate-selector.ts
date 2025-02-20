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

  select(item: T) {
    return this.predicate(item)
  }
}

// TODO make specs for this
