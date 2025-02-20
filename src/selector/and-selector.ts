import Selector from "./selector.js"

type AndSelectorGroup<A, B> = unknown

export default class AndSelector<
  T extends Object,
  A extends unknown,
  B extends unknown
> extends Selector<T, AndSelectorGroup<A, B>> {
  a: Selector<T, A>
  b: Selector<T, B>
  constructor(a: Selector<T, A>, b: Selector<T, B>) {
    super()
    this.a = a
    this.b = b
  }

  select(item: T) {
    //
  }
}
