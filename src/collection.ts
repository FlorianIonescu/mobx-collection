import { ObservableSet, transaction } from "mobx"
import Item from "./item.js"

type InputPredicate<T> = (value: T, props: boolean[]) => boolean
type Registration<T> = {
  set: ObservableSet<T>
  predicate: (value: Item<T>) => boolean
}

export default class Collection<T> {
  items: Map<T, Item<T>> = new Map()
  registrations: Map<InputPredicate<T>, Registration<T>> = new Map()

  addFilter(
    predicate: InputPredicate<T>,
    dependencies: InputPredicate<T>[] = []
  ) {
    // get the Registrations whose values this predicate needs
    const registrations = dependencies.map((predicate) => {
      const registration = this.registrations.get(predicate)
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

      return predicate(item._item, filterValues)
    }

    // register the new predicate and its result set
    const registration: Registration<T> = {
      set: new ObservableSet<T>(),
      predicate: _predicate,
    }
    this.registrations.set(predicate, registration)

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

  filter(predicate: InputPredicate<T>, dependencies: InputPredicate<T>[] = []) {
    const registration = this.registrations.get(predicate)
    if (registration) return registration.set

    return this.addFilter(predicate, dependencies)
  }
}
