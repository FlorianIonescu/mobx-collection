import { ObservableSet, transaction } from "mobx"
import Item from "./item.js"

type InputPredicate<T> = (value: T, props: boolean[]) => boolean

type Filter<T> = {
  predicate: InputPredicate<T>
  dependencies: Filter<T>[]
}
type Registration<T> = {
  predicate: (value: Item<T>) => boolean
  set: ObservableSet<T>
}

type FilterInput<T> =
  | {
      predicate: InputPredicate<T>
      dependencies: FilterInput<T>[]
    }
  | InputPredicate<T>

export default class Collection<T> {
  items: Map<T, Item<T>> = new Map()
  registrations: Map<Filter<T>, Registration<T>> = new Map()
  atomicFilters: Map<Function, Filter<T>> = new Map()

  private _addFilter(filter: Filter<T>) {
    // get the Registrations whose values this predicate needs
    const registrations = filter.dependencies.map((_filter) => {
      const registration = this.registrations.get(_filter)
      if (registration === undefined) {
        throw new Error("Couldn't find Registration for InputPredicate")
      }

      return registration
    })

    // make an ItemPredicate out of this
    const _predicate = (item: Item<T>) => {
      const filterValues = registrations.map((registration) =>
        item.props.get(registration.predicate)?.get()
      ) as boolean[]

      return filter.predicate(item._item, filterValues)
    }

    // register the new predicate and its result set
    const registration: Registration<T> = {
      set: new ObservableSet<T>(),
      predicate: _predicate,
    }
    this.registrations.set(filter, registration)

    // tell each item to track this predicate
    this.items.forEach((item) => {
      item.addFilterProp(registration.set, registration.predicate)
    })

    return registration.set
  }

  add(item: T) {
    transaction(() => {
      const _item = new Item(item)
      this.items.set(_item.item, _item)

      this.registrations.forEach((registration) => {
        _item.addFilterProp(registration.set, registration.predicate)
      })
    })
  }

  remove(item: T) {
    transaction(() => {
      this.items.delete(item)
      this.registrations.forEach((registration) => {
        registration.set.delete(item)
      })
    })
  }

  private _filterOrPredicateToFilter(
    filterOrPredicate: FilterInput<T>
  ): Filter<T> {
    let filter

    // just a simple predicate thrown in, no dependencies
    if (filterOrPredicate instanceof Function) {
      filter = this.atomicFilters.get(filterOrPredicate)

      // make a new filter if it doesn't exist
      if (!filter) {
        filter = {
          predicate: filterOrPredicate,
          dependencies: [],
        }
      }
    } else {
      filter = {
        predicate: filterOrPredicate.predicate,
        dependencies: filterOrPredicate.dependencies.map((d) =>
          this._filterOrPredicateToFilter(d)
        ),
      }
    }

    return filter
  }

  filter(filterOrPredicate: FilterInput<T>): ObservableSet<T> {
    const filter = this._filterOrPredicateToFilter(filterOrPredicate)

    // get the registration and return its set if it exists
    const registration = this.registrations.get(filter)
    if (registration) return registration.set

    // this new filter doesn't exist yet

    // check if all dependencies are fine
    for (const dependency of filter.dependencies) {
      if (!this.registrations.get(dependency)) {
        throw Error(
          "Attempted to add a filter with a dependency that doesn't exist"
        )
      }
    }

    // register predicate function for future filter retrieval
    if (filterOrPredicate instanceof Function) {
      this.atomicFilters.set(filterOrPredicate, filter)
    }

    // hook the filter into the system
    return this._addFilter(filter)
  }
}
