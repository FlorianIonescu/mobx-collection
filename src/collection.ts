import Item from "./item.js"
import BidirectionalMap from "./utils/bidirectional-map.js"
import Selector from "./selector/selector.js"
import { action, makeObservable, ObservableSet } from "mobx"
import SelectionCache from "./types/selection-cache.js"
import FlexibleStore from "./utils/flexible-store.js"
import Scope from "@florianionescu/scope"

type CollectionRegistrations<ItemType> = BidirectionalMap<
  Selector<ItemType>,
  SelectionCache<ItemType>
>

export default class Collection<ItemType> {
  items: Map<ItemType, Item<ItemType>> = new Map()
  registrations: CollectionRegistrations<ItemType> = new BidirectionalMap()
  compositeGroups = new FlexibleStore<any, symbol>()
  selectors: Map<symbol, Selector<ItemType>> = new Map()

  last: ItemType | null = null

  constructor() {
    makeObservable(this, {
      add: action,
      filter: action,
    })
  }

  add(item: ItemType) {
    const _item = new Item(item)
    this.items.set(_item.item, _item)

    this.registrations.entries().forEach(([selector, cache]) => {
      _item.addProp(this, selector, cache)
    })

    this.last = item
  }

  remove(item: ItemType) {
    const _item = this.items.get(item)
    if (!_item) return

    _item.delete()
    this.items.delete(item)

    if (this.last === item) this.last = null
  }

  get size() {
    return this.items.size
  }

  any(selector: Selector<ItemType>, ...keys: any[]): ItemType | undefined {
    const set = this.filter(selector, ...keys)
    const next = set.values().next()
    return next.value || undefined
  }

  all(selector: Selector<ItemType>, ...keys: any[]): ItemType[] {
    const set = this.filter(selector, ...keys)
    return [...set.values()]
  }

  filter(
    selector: Selector<ItemType>,
    ...keys: any[]
  ): ObservableSet<ItemType> {
    return Scope.do("collection", this, () => {
      // get existing selector if available, otherwise start tracking
      const _selector = this.register(selector)

      // get its cache
      const cache = this.registrations.forward(_selector)

      const key =
        keys.length === 1
          ? Selector.key(...keys)
          : Selector.key(...keys.map((k) => Selector.key(k)))

      const set = cache.forward(key)
      if (set) return set

      const _set = new ObservableSet()
      cache.set(key, _set)

      return _set
    })
  }

  private register(selector: Selector<ItemType>): Selector<ItemType> {
    const found = this.selectors.get(selector.key())
    if (found) return found

    // haven't seen any selector like this before

    // create the new cache
    const cache = new BidirectionalMap<symbol, ObservableSet<ItemType>>()

    // register selector and its cache by key
    this.selectors.set(selector.key(), selector)
    this.registrations.set(selector, cache)

    // make sure that all existing items start tracking this
    this.items.forEach((item) => {
      item.addProp(this, selector, cache)
    })

    return selector
  }
}
