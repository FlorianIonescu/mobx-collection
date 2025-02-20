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

type Props<ItemType> = Map<Selector<ItemType>, IComputedValue<symbol>>

export default class Item<ItemType> {
  _item: ItemType
  props: Props<ItemType> = new Map()

  constructor(item: ItemType) {
    this._item = item
    makeAutoObservable(this, {
      update: action,
    })
  }

  get item() {
    return this._item
  }

  addProp(selector: Selector<ItemType>, cache: SelectionCache<ItemType>) {
    const compute = computed(() => {
      const values = selector.select(this._item)
      return Selector.key(...values)
    })

    this.props.set(selector, compute)

    autorun(() => {
      this.update(cache, compute.get())
    })
  }

  update(cache: SelectionCache<ItemType>, compute: symbol) {
    // TODO only remove it from the set it's actually in
    const sets = cache.b()
    sets.forEach((set) => {
      set.delete(this.item)
    })

    const set = cache.forward(compute)
    if (set) {
      set.add(this.item)
    } else {
      const _set = new ObservableSet<ItemType>()
      _set.add(this.item)
      cache.set(compute, _set)
    }
  }
}
