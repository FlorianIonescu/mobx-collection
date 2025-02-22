import {
  action,
  autorun,
  computed,
  IComputedValue,
  IReactionDisposer,
  makeAutoObservable,
  makeObservable,
  ObservableSet,
} from "mobx"
import Selector from "./selector/selector.js"
import SelectionCache from "./types/selection-cache.js"

type Props<ItemType> = Map<Selector<ItemType>, IComputedValue<symbol>>

export default class Item<ItemType> {
  // the original item passed in
  _item: ItemType

  // selector -> selected value
  props: Props<ItemType> = new Map()

  // selector -> callback to remove it from the set it's currently in
  deletionCallbacks: Map<Selector<ItemType>, Function> = new Map()

  // callbacks to cancel mobx autoruns
  autoruns: IReactionDisposer[] = []

  constructor(item: ItemType) {
    this._item = item
    makeObservable(this, {
      update: action,
    })
  }

  get item() {
    return this._item
  }

  addProp(selector: Selector<ItemType>, cache: SelectionCache<ItemType>) {
    const compute = computed(() => {
      return selector.select(this._item)
    })

    this.props.set(selector, compute)

    const run = autorun(() => {
      this.update(selector, cache, compute.get())
    })

    this.autoruns.push(run)
  }

  update(
    selector: Selector<ItemType>,
    cache: SelectionCache<ItemType>,
    value: symbol
  ) {
    // delete the item from its current set
    const deletionCallback = this.deletionCallbacks.get(selector)
    if (deletionCallback) {
      deletionCallback()
    }

    const set = cache.forward(value)
    if (set) {
      // set exists, add item
      set.add(this.item)

      // callback to remove this item from the set it was just added to
      this.deletionCallbacks.set(selector, () => set.delete(this.item))
    } else {
      // set doesn't exist, create it
      const _set = new ObservableSet<ItemType>()
      _set.add(this.item)
      cache.set(value, _set)

      // callback to remove this item from the set it was just added to
      this.deletionCallbacks.set(selector, () => _set.delete(this.item))
    }
  }

  delete() {
    // remove item from all sets
    const callbacks = [...this.deletionCallbacks.values()]
    callbacks.forEach((c) => c())

    // cancel all autoruns
    this.autoruns.forEach((r) => r())
  }
}
