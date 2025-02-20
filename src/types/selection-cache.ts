import BidirectionalMap from "$src/utils/bidirectional-map.js"
import { ObservableSet } from "mobx"

type SelectionCache<T, G> = BidirectionalMap<G, ObservableSet<T>>

export default SelectionCache
