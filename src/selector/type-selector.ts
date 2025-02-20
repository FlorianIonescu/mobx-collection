import Selector from "./selector.js"

export default class TypeSelector<T extends Object> extends Selector<T> {
  select(item: T) {
    return [item.constructor]
  }
}
