import { Tile } from '../astar/tile';

class HeapNode {
  next: HeapNode;
  constructor(public val, public priority) {

  }
  toString() {
    return `{p=${this.priority}, v=${this.val}}`
  }
}

export class PriorityQueue {
  heap: HeapNode[];
  constructor() {
    this.heap = [null];
  }

  insert(value, priority) {
    const newNode = new HeapNode(value, priority);
    this.heap.push(newNode);

    let currentNodeIdx = this.heap.length - 1;
    let currentParentIdx = Math.floor(currentNodeIdx / 2);

    while (this.heap[currentParentIdx] && newNode.priority < this.heap[currentParentIdx].priority) {
      // swap
      const parent = this.heap[currentParentIdx];

      this.heap[currentParentIdx] = newNode;
      this.heap[currentNodeIdx] = parent;

      // update
      currentNodeIdx = currentParentIdx;
      currentParentIdx = Math.floor(currentNodeIdx / 2);
    }

  }
  public toString(): string {
    return this.heap.slice(1).map(x => x.toString()).join(' -> ');
  }

  isEmpty() {
    // the first element is null
    return this.heap.length < 2;
  }

  remove() {
    // special case
    if (this.heap.length < 3) {
      const toReturn = this.heap.pop();
      this.heap[0] = null;
      return toReturn;
    }

    const toRemove = this.heap[1];
    this.heap[1] = this.heap.pop();
    let currentIdx = 1;
    let [left, right] = [2 * currentIdx, 2 * currentIdx + 1];

    // larger child between the two
    let currentChildIdx = this.heap[right] && this.heap[right].priority <= this.heap[left].priority ? right : left;
    while (this.heap[currentChildIdx] && this.heap[currentIdx].priority >= this.heap[currentChildIdx].priority) {
      // swap the replacement node with the largest child node
      let currentNode = this.heap[currentIdx];
      let currentChildNode = this.heap[currentChildIdx];
      this.heap[currentChildIdx] = currentNode;
      this.heap[currentIdx] = currentChildNode;
    }
    return toRemove;
  }
}


