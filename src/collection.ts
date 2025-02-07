import { ObservableSet, transaction } from "mobx"
import Item from "./item.js"

type InputPredicate<T> = (value: T, props: boolean[]) => boolean
type ItemPredicate<T> = (value: Item<T>) => boolean

export default class Collection<T> {
  items: Map<T, Item<T>> = new Map()

  subsetsByPredicate: Map<ItemPredicate<T>, ObservableSet<T>> = new Map()
  predicatesByInput: Map<InputPredicate<T>, ItemPredicate<T>> = new Map()

  private _addFilter(itemPredicate: ItemPredicate<T>) {
    const set = new ObservableSet<T>()
    this.subsetsByPredicate.set(itemPredicate, set)

    this.items.forEach((item) => {
      item.addFilterProp(set, itemPredicate)
    })

    return set
  }

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

    // then run it through the collection
    return this._addFilter(_predicate)
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
