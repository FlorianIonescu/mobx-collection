import Selector from "./selector.js"

export default class TypeSelector<
  T extends Object,
  G extends new (...args: any[]) => T
> extends Selector<T, G> {
  select(item: T) {
    return item.constructor as G
  }
}
