import BidirectionalMap from "$src/utils/bidirectional-map.js"
import { ObservableSet } from "mobx"

type SelectionCache<T> = BidirectionalMap<symbol, ObservableSet<T>>

export default SelectionCache
