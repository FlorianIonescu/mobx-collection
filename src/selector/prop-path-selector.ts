import Selector from "./selector.js"
import getByPath from "$src/utils/get-by-path.js"

export default class PropPathSelector<
  ItemType extends Object,
  Groups extends any
> extends Selector<ItemType, Groups> {
  path: string

  constructor(path: string) {
    super()

    this.path = path
  }

  select(item: ItemType): Groups {
    return getByPath(item, this.path)
  }
}
