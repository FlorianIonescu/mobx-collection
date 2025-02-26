import Collection from "$src/collection.js"
import Scope from "@florianionescu/scope"
import Selector from "./selector.js"

export default class HasSelector<T extends Object> extends Selector<T> {
  selector: Selector<T>
  keys: any[]

  constructor(selector: Selector<T>, ...keys: any[]) {
    super()
    this.selector = selector
    this.keys = keys
  }

  key() {
    return Selector.key(HasSelector, this.selector.key(), ...this.keys)
  }

  select(item: T): symbol {
    const collection = Scope.get("collection") as Collection<T>
    const set = collection.filter(this.selector, item, ...this.keys)
    const group = !!set.size
    return Selector.key(group)
  }
}
