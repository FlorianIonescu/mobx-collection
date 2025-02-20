import Item from "./item.js"
import BidirectionalMap from "./utils/bidirectional-map.js"
import Selector from "./selector/selector.js"
import { ObservableMap, ObservableSet } from "mobx"
import SelectionCache from "./types/selection-cache.js"
import FlexibleStore from "./utils/flexible-store.js"

type CollectionRegistrations<ItemType> = BidirectionalMap<
  Selector<ItemType>,
  SelectionCache<ItemType>
>

export default class Collection<ItemType> {
  items: ObservableMap<ItemType, Item<ItemType>> = new ObservableMap()
  registrations: CollectionRegistrations<ItemType> = new BidirectionalMap()
  compositeGroups = new FlexibleStore<any, symbol>()

  register(selector: Selector<ItemType>) {
    const existing = this.registrations.forward(selector)
    if (existing) {
      throw new Error("Tried to register an already registered Selector")
    }

    const cache = new BidirectionalMap<symbol, ObservableSet<ItemType>>()
    this.registrations.set(selector, cache)

    this.items.forEach((item) => {
      item.addProp(selector, cache)
    })
  }

  add(item: ItemType) {
    const _item = new Item(item)
    this.items.set(_item.item, _item)

    this.registrations.entries().forEach(([selector, cache]) => {
      _item.addProp(selector, cache)
    })
  }

  filter(
    selector: Selector<ItemType>,
    ...keys: any[]
  ): ObservableSet<ItemType> {
    const cache = this.registrations.forward(selector)
    if (!cache) throw new Error("Tried to filter over an unregistered Selector")

    const key =
      keys.length === 1
        ? Selector.key(...keys)
        : Selector.key(...keys.map((k) => Selector.key(k)))

    const set = cache.forward(key)
    if (set) return set

    const _set = new ObservableSet()
    cache.set(key, _set)

    return _set
  }
}
