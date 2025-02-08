export default class BidirectionalMap<A, B> {
  private _forward = new Map<A, B>()
  private _reverse = new Map<B, A>()

  set(A: A, B: B): void {
    this._forward.set(A, B)
    this._reverse.set(B, A)
  }

  a() {
    return [...this._forward.keys()]
  }

  b() {
    return [...this._forward.values()]
  }

  forward(A: A): B | undefined {
    return this._forward.get(A)
  }

  reverse(B: B): A | undefined {
    return this._reverse.get(B)
  }

  deleteByA(A: A): void {
    const B = this._forward.get(A)
    if (B !== undefined) {
      this._forward.delete(A)
      this._reverse.delete(B)
    }
  }

  deleteByB(B: B): void {
    const A = this._reverse.get(B)
    if (A !== undefined) {
      this._forward.delete(A)
      this._reverse.delete(B)
    }
  }

  clear(): void {
    this._forward.clear()
    this._reverse.clear()
  }

  size(): number {
    return this._forward.size
  }
}
