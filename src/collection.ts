import Item from "./item.js"
import BidirectionalMap from "./utils/bidirectional-map.js"
import Selector from "./selector/selector.js"
import { ObservableMap, ObservableSet } from "mobx"
import SelectionCache from "./types/selection-cache.js"

type CollectionRegistrations<T, G> = BidirectionalMap<
  Selector<T, G>,
  SelectionCache<T, G>
>

export default class Collection<T> {
  items: ObservableMap<T, Item<T>> = new ObservableMap()
  registrations: CollectionRegistrations<T, unknown> = new BidirectionalMap()

  register<G>(selector: Selector<T, G>) {
    const existing = this.registrations.forward(selector)
    if (existing) {
      throw new Error("Tried to register an already registered Selector")
    }

    const cache = new BidirectionalMap<G, ObservableSet<T>>()
    this.registrations.set(selector, cache)

    this.items.forEach((item) => {
      item.addProp(selector, cache)
    })
  }

  add(item: T) {
    const _item = new Item(item)
    this.items.set(_item.item, _item)

    this.registrations.entries().forEach(([selector, cache]) => {
      _item.addProp(selector, cache)
    })
  }

  filter<G>(selector: Selector<T, G>, group: G): ObservableSet<T> {
    const cache = this.registrations.forward(selector)
    if (!cache) throw new Error("Tried to filter over an unregistered Selector")

    const set = cache.forward(group)
    if (set) return set

    const _set = new ObservableSet()
    cache.set(group, _set)

    return _set
  }
}
