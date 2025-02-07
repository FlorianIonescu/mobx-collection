import { ObservableSet } from "mobx"
import Item from "./item.js"

type AtomicPredicate<T> = (value: T) => boolean
type CompositePredicate<T> = (props: boolean[]) => boolean
type InputPredicate<T> = AtomicPredicate<T> | CompositePredicate<T>

type ItemPredicate<T> = (value: Item<T>) => boolean

export default class Collection<T> {
  count = 0

  items: Map<T, Item<T>> = new Map()

  predicateResults: Map<ItemPredicate<T>, ObservableSet<T>> = new Map()
  predicateNames: Map<ItemPredicate<T>, string> = new Map()
  predicatesByInput: Map<InputPredicate<T>, ItemPredicate<T>> = new Map()

  private addFilter(predicate: ItemPredicate<T>) {
    this.count++
    const name = this.count.toString()

    const set = new ObservableSet<T>()
    this.predicateResults.set(predicate, set)
    this.predicateNames.set(predicate, name)

    this.items.forEach((item) => {
      item.addFilterProp(this, name, predicate)
    })

    return set
  }

  addItemFilter(predicate: AtomicPredicate<T>) {
    const _predicate = (item: Item<T>) => predicate(item.item)
    this.predicatesByInput.set(predicate, _predicate)

    return this.addFilter(_predicate)
  }

  addCompositeFilter(
    combiner: CompositePredicate<T>,
    predicates: InputPredicate<T>[]
  ) {
    const filterNames = predicates.map((predicate) => {
      const itemPredicate = this.predicatesByInput.get(predicate)
      if (itemPredicate === undefined) {
        throw new Error("Couldn't find ItemPredicate for InputPredicate")
      }

      const filterName = this.predicateNames.get(itemPredicate)
      if (filterName === undefined) {
        throw new Error("Couldn't find filterName for ItemPredicate")
      }

      return filterName
    })

    const predicate = (item: Item<T>) => {
      const filterValues = filterNames.map((fname) => item[`is${fname}`])
      return combiner(filterValues)
    }

    this.predicatesByInput.set(combiner, predicate)

    return this.addFilter(predicate)
  }

  add(item: T) {
    const _item = new Item(item)
    this.items.set(_item.item, _item)

    this.predicateResults.forEach((set, predicate) => {
      const filterName = this.predicateNames.get(predicate)
      if (!filterName) throw Error("Couldn't find filterName")

      _item.addFilterProp(this, filterName, predicate)
    })
  }

  remove(item: T) {
    this.items.delete(item)
    this.predicateResults.forEach((set, predicate) => {
      set.delete(item)
    })
  }

  filter(filter: InputPredicate<T>) {
    const predicate = this.predicatesByInput.get(filter)
    if (!predicate) throw Error(`Couldn't find InputPredicate`)

    const filterSet = this.predicateResults.get(predicate)
    if (!filterSet) {
      throw Error(`Couldn't find filterSet with name ${filter}`)
    }

    return filterSet
  }
}
