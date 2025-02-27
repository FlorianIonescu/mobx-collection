import Explanation from "$src/types/explanation.js"
import getByPath from "$src/utils/get-by-path.js"
import Selector from "./selector.js"

export default class PropPathSelector<
  ItemType extends Object
> extends Selector<ItemType> {
  path: string

  constructor(path: string) {
    super()

    this.path = path
  }

  key(): symbol {
    return Selector.key(this.path)
  }

  select(item: ItemType) {
    let result: any
    try {
      result = getByPath(item, this.path)
    } catch {}

    return Selector.key(result)
  }

  explain(value: any): Explanation[] {
    return [`are having the value '${value}' set in '${this.path}'`]
  }
}
