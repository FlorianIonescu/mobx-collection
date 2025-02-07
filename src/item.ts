import { action, autorun, computed, makeAutoObservable } from "mobx"
import Collection from "./collection.js"

type ItemPredicate<T> = (value: Item<T>) => boolean

export default class Item<T> {
  _item: T;
  [key: `is${string}`]: boolean

  constructor(item: T) {
    this._item = item
    makeAutoObservable(this)
  }

  set item(item) {
    this._item = item
  }

  get item() {
    return this._item
  }

  addFilterProp(
    collection: Collection<T>,
    filterName: string,
    predicate: ItemPredicate<T>
  ) {
    const computedProp = computed(() => predicate(this))

    Object.defineProperty(this, `is${filterName}`, {
      get: function () {
        return computedProp.get()
      },
      configurable: true,
    })

    autorun(() => {
      const matches = this[`is${filterName}`]
      const filterSet = collection.predicateResults.get(predicate)
      if (!filterSet) {
        throw Error(`Couldn't find filterSet with name ${filterName}`)
      }

      action(`update${filterName}Set`, () => {
        if (matches) {
          filterSet.add(this.item)
        } else {
          filterSet.delete(this.item)
        }
      })()
    })
  }
}
