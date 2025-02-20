import Selector from "./selector.js"
import getByPath from "$src/utils/get-by-path.js"

export default class PropPathSelector<
  ItemType extends Object
> extends Selector<ItemType> {
  path: string

  constructor(path: string) {
    super()

    this.path = path
  }

  select(item: ItemType) {
    return [getByPath(item, this.path)]
  }
}
