// server/utils/astar.ts

import { NodeId, SpaceNode } from "~/types/space";

interface AStarNode {
  id: NodeId;
  g: number; // фактическая стоимость пути от старта до этой точки
  f: number; // суммарная оценка: f = g + h, по которой наша будущая куча будет сортировать элементы
}

export function calculateEuclideanDistance(
  a: SpaceNode["coordinates"],
  b: SpaceNode["coordinates"],
) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2);
}

class MinHeap {
  // Внутреннее хранилище кучи — массив узлов AStarNode
  private heap: AStarNode[] = [];

  constructor() {}

  private getParentIndex(childIndex: number): number {
    return Math.floor(childIndex - 1) / 2;
  }

  private getLeftChildIndex(parentIndex: number): number {
    return 2 * parentIndex + 1;
  }
  private getRightChildIndex(parentIndex: number): number {
    return 2 * parentIndex + 2;
  }

  private siftUp(index: number): void {
    let newIndex = index;
    let parentIndex = this.getParentIndex(index);

    // Достаточно проверять, что текущий индекс не стал корнем (newIndex > 0)
    while (newIndex > 0 && this.heap[newIndex].f < this.heap[parentIndex].f) {
      [this.heap[newIndex], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[newIndex]];
      newIndex = parentIndex;
      parentIndex = this.getParentIndex(newIndex);
    }
  }

  public push(node: AStarNode) {
    this.heap.push(node);
    this.siftUp(this.heap.length - 1);
  }

  /* public pop(): AStarNode | undefined {
   if (this.size) {
    return this.heap.shift()
   }
  } */

  public get size(): number {
    return this.heap.length;
  }
}
