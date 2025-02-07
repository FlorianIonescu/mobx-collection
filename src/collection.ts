import { ObservableSet, transaction } from "mobx"
import Item from "./item.js"

type AtomicPredicate<T> = (value: T) => boolean
type CompositePredicate<T> = (props: boolean[]) => boolean
type InputPredicate<T> = AtomicPredicate<T> | CompositePredicate<T>

type ItemPredicate<T> = (value: Item<T>) => boolean

export default class Collection<T> {
  items: Map<T, Item<T>> = new Map()

  subsetsByPredicate: Map<ItemPredicate<T>, ObservableSet<T>> = new Map()
  predicatesByInput: Map<InputPredicate<T>, ItemPredicate<T>> = new Map()

  private addFilter(itemPredicate: ItemPredicate<T>) {
    const set = new ObservableSet<T>()
    this.subsetsByPredicate.set(itemPredicate, set)

    this.items.forEach((item) => {
      item.addFilterProp(set, itemPredicate)
    })

    return set
  }

  addItemFilter(inputPredicate: AtomicPredicate<T>) {
    const itemPredicate = (item: Item<T>) => inputPredicate(item.item)
    this.predicatesByInput.set(inputPredicate, itemPredicate)

    return this.addFilter(itemPredicate)
  }

  addCompositeFilter(
    combiner: CompositePredicate<T>,
    predicates: InputPredicate<T>[]
  ) {
    const itemPredicates = predicates.map((predicate) => {
      const itemPredicate = this.predicatesByInput.get(predicate)
      if (itemPredicate === undefined) {
        throw new Error("Couldn't find ItemPredicate for InputPredicate")
      }

      return itemPredicate
    })

    const predicate = (item: Item<T>) => {
      const filterValues = itemPredicates.map((itemPredicate) =>
        item.props.get(itemPredicate)?.get()
      ) as boolean[]

      return combiner(filterValues)
    }

    this.predicatesByInput.set(combiner, predicate)

    return this.addFilter(predicate)
  }

  add(item: T) {
    transaction(() => {
      const _item = new Item(item)
      this.items.set(_item.item, _item)

      this.subsetsByPredicate.forEach((set, predicate) => {
        _item.addFilterProp(set, predicate)
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

  filter(filter: InputPredicate<T>) {
    const predicate = this.predicatesByInput.get(filter)
    if (!predicate) throw Error(`Couldn't find InputPredicate`)

    const filterSet = this.subsetsByPredicate.get(predicate)
    if (!filterSet) {
      throw Error(`Couldn't find filterSet with name ${filter}`)
    }

    return filterSet
  }
}
