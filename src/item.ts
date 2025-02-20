import {
  action,
  autorun,
  computed,
  IComputedValue,
  makeAutoObservable,
  ObservableSet,
} from "mobx"
import Selector from "./selector/selector.js"
import SelectionCache from "./types/selection-cache.js"

type Props<T, G> = Map<Selector<T, G>, IComputedValue<G>>

export default class Item<T> {
  _item: T
  props: Props<T, unknown> = new Map()

  constructor(item: T) {
    this._item = item
    makeAutoObservable(this, {
      update: action,
    })
  }

  set item(item) {
    this._item = item
  }

  get item() {
    return this._item
  }

  addProp<G>(selector: Selector<T, G>, cache: SelectionCache<T, G>) {
    const compute = computed(() => selector.select(this._item))
    this.props.set(selector, compute)

    autorun(() => {
      this.update(cache, compute.get())
    })
  }

  update<G>(cache: SelectionCache<T, G>, compute: G) {
    // TODO only remove it from the set it's actually in
    const sets = cache.b()
    sets.forEach((set) => {
      set.delete(this.item)
    })

    const set = cache.forward(compute)
    if (set) {
      set.add(this.item)
    } else {
      const _set = new ObservableSet<T>()
      _set.add(this.item)
      cache.set(compute, _set)
    }
  }
}
