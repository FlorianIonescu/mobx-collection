export default class FlexibleStore<K, T> {
  leafs: Map<K, T> = new Map()
  nodes: Map<K, FlexibleStore<K, T>> = new Map()

  get(...keys: K[]): T {
    if (!keys.length) {
      return undefined
    } else if (keys.length === 1) {
      return this.leafs.get(keys[0])
    } else {
      const next = this.nodes.get(keys[0])
      if (!next) return undefined
      return next.get(...keys.slice(1))
    }
  }

  set(value: T, ...keys: K[]) {
    if (!keys.length) {
      throw new Error("FlexibleStore.set needs at least one key")
    } else if (keys.length === 1) {
      this.leafs.set(keys[0], value)
    } else {
      let next = this.nodes.get(keys[0])
      if (!next) {
        next = new FlexibleStore()
        this.nodes.set(keys[0], next)
      }

      next.set(value, ...keys.slice(1))
    }
  }

  delete(...keys: K[]) {
    if (!keys.length) {
      throw new Error("FlexibleStore.remove needs at least one key")
    } else if (keys.length === 1) {
      this.leafs.delete(keys[0])
    } else {
      const next = this.nodes.get(keys[0])

      if (next) {
        next.delete(...keys.slice(1))
        if (!next.leafs.size) this.nodes.delete(keys[0])
      }
    }
  }
}
