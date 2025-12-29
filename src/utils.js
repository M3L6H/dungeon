export const DIRS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

export class Heap {
  constructor(comparator) {
    this.comparator = comparator;
    this.values = [];
  }

  get length() {
    return this.values.length;
  }

  push(node) {
    this.values.push(node);
    this._bubbleUp(this.length - 1);
  }

  pop() {
    if (this.length === 0) return undefined;
    if (this.length === 1) return this.values.pop();
    const value = this.values[0];
    this.values[0] = this.values.pop();
    this._bubbleDown(0);
    return value;
  }

  _bubbleUp(idx) {
    if (idx === 0) return;
    const pIdx = Math.floor((idx - 1) / 2);
    const curr = this.values[idx];
    if (this._lt(this.values[pIdx], curr)) {
      return;
    }
    this.values[idx] = this.values[pIdx];
    this.values[pIdx] = curr;
    this._bubbleUp(pIdx);
  }

  _bubbleDown(idx) {
    const lIdx = idx * 2 + 1;
    const rIdx = idx * 2 + 2;
    let mIdx = lIdx;
    if (lIdx >= this.length) return;
    if (rIdx < this.length && this._lt(this.values[rIdx], this.values[lIdx])) {
      mIdx = rIdx;
    }
    const curr = this.values[idx];
    if (this._lt(curr, this.values[mIdx])) {
      return;
    }
    this.values[idx] = this.values[mIdx];
    this.values[mIdx] = curr;
    this._bubbleDown(mIdx);
  }

  _lt(a, b) {
    return this.comparator(a, b) < 0;
  }
}

export function permuteArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInRange(i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randInRange(a, b) {
  const isAMax = b === undefined;
  const min = isAMax ? 0 : Math.ceil(a);
  const max = Math.floor(isAMax ? a : b);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}