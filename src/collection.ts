import { ObservableSet, transaction } from "mobx"
import Item from "./item.js"
import BidirectionalMap from "./utils/bidirectional-map.js"

type InputPredicate<T> = (value: T, props: boolean[]) => boolean

type Filter<T> = {
  predicate: InputPredicate<T>
  dependencies: ObservableSet<T>[]
}

type FilterInput<T> =
  | {
      predicate: InputPredicate<T>
      dependencies: ObservableSet<T>[]
    }
  | InputPredicate<T>

export default class Collection<T> {
  items: Map<T, Item<T>> = new Map()
  registrations: BidirectionalMap<Filter<T>, ObservableSet<T>> =
    new BidirectionalMap()

  private makeItemPredicate(filter: Filter<T>): (item: Item<T>) => boolean {
    return (item: Item<T>) => {
      const filterValues = filter.dependencies.map((set) =>
        item.props.get(set)?.get()
      ) as boolean[]

      return filter.predicate(item._item, filterValues)
    }
  }

  private _addFilter(filter: Filter<T>) {
    // register the new predicate and its result set
    const set = new ObservableSet()
    this.registrations.set(filter, set)

    const _predicate = this.makeItemPredicate(filter)

    // tell each item to track this predicate
    this.items.forEach((item) => {
      item.addFilterProp(set, _predicate)
    })

    return set
  }

  add(item: T) {
    transaction(() => {
      const _item = new Item(item)
      this.items.set(_item.item, _item)

      this.registrations.b().forEach((set: ObservableSet<T>) => {
        const filter = this.registrations.reverse(set) as Filter<T>
        const predicate = this.makeItemPredicate(filter)
        _item.addFilterProp(set, predicate)
      })
    })
  }

  remove(item: T) {
    transaction(() => {
      this.items.delete(item)
      this.registrations.b().forEach((set) => {
        set.delete(item)
      })
    })
  }

  private _filterOrPredicateToFilter(
    filterOrPredicate: FilterInput<T>
  ): Filter<T> {
    if (filterOrPredicate instanceof Function) {
      // just a simple predicate thrown in, no dependencies
      return {
        predicate: filterOrPredicate,
        dependencies: [],
      }
    } else {
      return filterOrPredicate
    }
  }

  private _findExistingFilter(filter: Filter<T>): Filter<T> | undefined {
    return this.registrations.a().find((_filter) => {
      if (filter.predicate !== _filter.predicate) return false
      if (filter.dependencies.length !== _filter.dependencies.length)
        return false
      for (const index in filter.dependencies) {
        if (filter.dependencies[index] !== _filter.dependencies[index])
          return false
      }

      return true
    })
  }

  filter(filterOrPredicate: FilterInput<T>): ObservableSet<T> {
    const filter = this._filterOrPredicateToFilter(filterOrPredicate)

    const existing = this._findExistingFilter(filter)
    if (existing) {
      // get the registration and return its set
      return this.registrations.forward(existing) as ObservableSet<T>
    }

    // this new filter doesn't exist yet

    // check if all dependencies are fine
    for (const dependency of filter.dependencies) {
      if (!this.registrations.reverse(dependency)) {
        throw Error(
          "Attempted to add a filter with a dependency that doesn't exist"
        )
      }
    }

    // hook the filter into the system
    return this._addFilter(filter)
  }
}
