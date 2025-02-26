import Collection from "$src/collection.js"
import Scope from "@florianionescu/scope"
import Selector from "./selector.js"

const identity = (item: any) => item

export default class HasSelector<T extends Object> extends Selector<T> {
  selector: Selector<T>
  group: (item: T) => any
  keys: any[]

  constructor(selector: Selector<T>, group?: (item: T) => any, ...keys: any[]) {
    super()
    this.selector = selector
    this.group = group || identity
    this.keys = keys
  }

  key() {
    return Selector.key(
      HasSelector,
      this.selector.key(),
      this.group,
      ...this.keys
    )
  }

  select(item: T): symbol {
    const collection = Scope.get("collection") as Collection<T>
    const set = collection.filter(this.selector, this.group(item), ...this.keys)
    const group = !!set.size
    return Selector.key(group)
  }
}
