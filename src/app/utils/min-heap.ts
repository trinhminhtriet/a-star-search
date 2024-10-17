
export type CompareFn<T> = (a: T, b: T) => number;

export class MinHeap<T> {
  public data: T[] = [];
  constructor(private compareFn: CompareFn<T>) {

  }
  private left(index: number) {
    return 2 * index + 1;
  }

  private right(index: number) {
    return 2 * index + 2
  }

  private parent(index: number) {
    return index % 2 == 0 ? (index - 2) / 2 : (index - 1) / 2;
  }

  add(element: T) {
    this.data.push(element);
    this.shiftUp(this.data.length - 1);
  }

  /**
   * Moves the node at the given index up to its proper in the heap
   */
  private shiftUp(index: number): void {
    let parent = this.parent(index);

    while (index > 0 && this.compareFn(this.data[parent], this.data[index]) > 0) {
      // swap if value of parent > value of child
      [this.data[parent], this.data[index]] = [this.data[index], this.data[parent]];
      index = parent;
      parent = this.parent(index);
    }
  }

  /**
   * Retrieves and removes the root element of this heap in O(logn)
   * - Returns undefine if the heap is empty
   */

  extractRoot(): T | undefined {
    if (this.data.length == 0) {
      return undefined;
    }
    const root = this.data[0]
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last
      this.siftDown(0);
    }
    return root;
  }

  /**
   * Moves the node at given index down to its proper place in the heap
   * @param index
   */

  private siftDown(index: number): void {
    // get index of smaller child
    const minIndex = (left: number, right: number) => {
      if (right >= this.data.length) {
        return left >= this.data.length ? -1 : left;
      } else {
        return this.compareFn(this.data[left], this.data[right]) <= 0 ? left : right;
      }
    }
    let min = minIndex(this.left(index), this.right(index));
    while (min >= 0 && this.compareFn(this.data[index], this.data[min]) > 0) {
      // swap
      [this.data[min], this.data[index]] = [this.data[index], this.data[min]];
      index = min;
      min = minIndex(this.left(index), this.right(index));
    }
  }

  /**
   * toString
   */
  toString(): string {
    return this.data.map(x => x.toString()).join(' -> ');
  }

  /**
   * Returns the number of elements in the heap O(1)
   */
  size() {
    return this.data.length;
  }


}
