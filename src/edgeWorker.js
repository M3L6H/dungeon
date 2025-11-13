const MAX_ADDITIONAL_LEN = 50;
const ADDITIONAL_CHANCE = 0.5;

class EdgeHeap {
  constructor() {
    this.values = [];
  }

  get length() {
    return this.values.length;
  }

  push(edge) {
    this.values.push(edge);
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
    return a.len < b.len;
  }
}

class UnionFind {
  constructor(size) {
    this.elts = [];
    for (let i = 0; i < size; ++i) {
      this.elts.push(i);
    }
  }

  union(a, b) {
    const pA = this.find(a);
    const pB = this.find(b);

    if (pA === pB) return false;

    this.elts[pB] = pA;

    return true;
  }

  find(n) {
    let curr = n;
    while (this.elts[curr] !== curr) {
      curr = this.elts[curr];
    }
    this.elts[n] = curr;
    return curr;
  }
}

function validDir(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  switch (a.dir) {
    case 0: // NORTH
      return dy < -3; // b.y is NORTH of a.y (b.y < a.y)
    case 1: // EAST
      return dx > 3; // b.x is EAST of a.x (b.x > a.x)
    case 2: // SOUTH
      return dy > 3; // b.y is SOUTH of a.y (b.y > a.y)
    case 3: // WEST
      return dx < -3; // b.x is WEST of a.x (b.x < a.x)
    default:
      console.error(`Invalid dir ${a.dir}`);
  }

  return false;
}

function cityBlockDist(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function generateMST(count, nodes) {
  const inTree = new UnionFind(count);
  const usedNode = new Array(nodes.length).fill(false);
  const edgeHeap = new EdgeHeap();

  for (let i = 0; i < nodes.length; ++i) {
    for (let j = i + 1; j < nodes.length; ++j) {
      if (nodes[i].id === nodes[j].id) continue;
      if (!validDir(nodes[i], nodes[j]) || !validDir(nodes[j], nodes[i])) {
        continue;
      }

      edgeHeap.push({
        aId: i,
        bId: j,
        a: nodes[i],
        b: nodes[j],
        len: cityBlockDist(nodes[i], nodes[j]), // Pre-compute length
      });
    }
  }

  console.debug(`Filled edge heap with ${edgeHeap.length} possible edges`);

  const edges = [];

  while (edgeHeap.length > 0) {
    const edge = edgeHeap.pop();

    if (usedNode[edge.aId] || usedNode[edge.bId]) continue;
    const union = inTree.union(edge.a.id, edge.b.id);
    const additional =
      edge.len < MAX_ADDITIONAL_LEN && Math.random() < ADDITIONAL_CHANCE;
    if (!(union || additional)) continue;

    edges.push(edge);
    usedNode[edge.aId] = true;
    usedNode[edge.bId] = true;
  }

  return edges;
}

onmessage = function (event) {
  const { count, nodes } = event.data;
  postMessage(generateMST(count, nodes));
};
