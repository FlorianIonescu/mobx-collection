import { ObservableSet, transaction } from "mobx"
import Item from "./item.js"

type InputPredicate<T> = (value: T, props: boolean[]) => boolean
type ItemPredicate<T> = (value: Item<T>) => boolean

export default class Collection<T> {
  items: Map<T, Item<T>> = new Map()

  subsetsByPredicate: Map<InputPredicate<T>, ObservableSet<T>> = new Map()
  predicatesByInput: Map<InputPredicate<T>, ItemPredicate<T>> = new Map()

  addFilter(
    predicate: InputPredicate<T>,
    dependencies: InputPredicate<T>[] = []
  ) {
    // get the ItemPredicates whose values this predicate needs
    const itemPredicates = dependencies.map((predicate) => {
      const itemPredicate = this.predicatesByInput.get(predicate)
      if (itemPredicate === undefined) {
        throw new Error("Couldn't find ItemPredicate for InputPredicate")
      }

      return itemPredicate
    })

    // make an ItemPredicate out of this
    const _predicate = (item: Item<T>) => {
      const filterValues = itemPredicates.map((itemPredicate) =>
        item.props.get(itemPredicate)?.get()
      ) as boolean[]

      return predicate(item._item, filterValues)
    }

    // associate it with the InputPredicate
    this.predicatesByInput.set(predicate, _predicate)

    // create a result set
    const set = new ObservableSet<T>()
    this.subsetsByPredicate.set(predicate, set)

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

      this.subsetsByPredicate.forEach((set, predicate) => {
        const _predicate = this.predicatesByInput.get(predicate)!
        _item.addFilterProp(set, _predicate)
      })
    })
  }

  remove(item: T) {
    transaction(() => {
      this.items.delete(item)
      this.subsetsByPredicate.forEach((set, predicate) => {
        set.delete(item)
      })
    })
  }

  filter(predicate: InputPredicate<T>, dependencies: InputPredicate<T>[] = []) {
    const set = this.subsetsByPredicate.get(predicate)
    if (set) return set

    return this.addFilter(predicate, dependencies)
  }
}
