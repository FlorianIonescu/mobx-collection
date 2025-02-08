import {
  action,
  autorun,
  computed,
  IComputedValue,
  makeAutoObservable,
  ObservableSet,
} from "mobx"

type ItemPredicate<T> = (value: Item<T>) => boolean

export default class Item<T> {
  _item: T
  props: Map<ObservableSet<T>, IComputedValue<boolean>> = new Map()

  constructor(item: T) {
    this._item = item
    makeAutoObservable(this, {
      update: action,
    })
  }

  set item(item) {
    this._item = item
  }

  get item() {
    return this._item
  }

  addFilterProp(set: ObservableSet<T>, predicate: ItemPredicate<T>) {
    const compute = computed(() => predicate(this))
    this.props.set(set, compute)

    autorun(() => {
      this.update(set, compute.get())
    })
  }

  update(set: ObservableSet<T>, compute: boolean) {
    if (compute) {
      set.add(this.item)
    } else {
      set.delete(this.item)
    }
  }
}
