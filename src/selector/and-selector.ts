import Selector from "./selector.js"

export default class AndSelector<T extends Object> extends Selector<T> {
  a: Selector<T>
  b: Selector<T>
  constructor(a: Selector<T>, b: Selector<T>) {
    super()
    this.a = a
    this.b = b
  }

  key() {
    return Selector.key(this.a.key(), this.b.key())
  }

  select(item: T) {
    const a = this.a.select(item)
    const b = this.b.select(item)
    // console.log(a, b)
    return Selector.key(a, b)
  }
}
