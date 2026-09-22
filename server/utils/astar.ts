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

export class MinHeap {
  // Внутреннее хранилище кучи — массив узлов AStarNode
  private heap: AStarNode[] = [];

  constructor() {}

  private getParentIndex(childIndex: number): number {
    return Math.floor((childIndex - 1) / 2);
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
    while (newIndex > 0) {
      const currentNode = this.heap[newIndex];
      const parentNode = this.heap[parentIndex];
      if (!currentNode || !parentNode || currentNode.f >= parentNode.f) {
        break;
      }

      [this.heap[newIndex], this.heap[parentIndex]] = [
        this.heap[parentIndex],
        this.heap[newIndex],
      ];

      // Сдвигаем указатели вверх по дереву
      newIndex = parentIndex;
      parentIndex = this.getParentIndex(newIndex);
    }
  }

  private siftDown(index: number) {
    let current = index;
    const length = this.heap.length;

    while (true) {
      let smallest = current;
      const leftChildIndex = this.getLeftChildIndex(current);
      const rightChildIndex = this.getRightChildIndex(current);

      // Проверяем левого ребенка: он должен существовать и быть меньше текущего smallest
      if (
        leftChildIndex < length &&
        this.heap[leftChildIndex]!.f < this.heap[smallest]!.f
      ) {
        smallest = leftChildIndex;
      }

      // Проверяем правого ребенка: он должен существовать и быть меньше текущего лидера (smallest)
      if (
        rightChildIndex < length &&
        this.heap[rightChildIndex]!.f < this.heap[smallest]!.f
      ) {
        smallest = rightChildIndex;
      }

      // Если наименьшим остался сам элемент, то куча сбалансирована
      if (smallest === current) {
        break;
      }

      // Делаем swap в массиве
      [this.heap[current], this.heap[smallest]] = [
        this.heap[smallest]!,
        this.heap[current]!,
      ];

      // Переходим по дереву вниз
      current = smallest;
    }
  }

  public isEmpty() {
    return this.heap.length === 0;
  }

  public extractMin() {
    if (this.isEmpty()) return null;
    let min = null;
    if (this.heap.length === 1) {
      min = this.heap[0];
      this.heap = [];
    } else {
      [this.heap[0], this.heap[this.heap.length - 1]] = [
        this.heap[this.heap.length - 1],
        this.heap[0],
      ];
      min = this.heap.pop();
      this.siftDown(0)
    }
    return min;
  }

  public push(node: AStarNode) {
    this.heap.push(node);
    this.siftUp(this.heap.length - 1);
  }

  public get size(): number {
    return this.heap.length;
  }
}
