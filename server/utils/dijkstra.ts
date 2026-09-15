// server/utils/dijkstra.ts
import type { SpaceNode, SpaceEdge } from "../../app/types/space";

interface RouteResult {
  path: string[]; // Массив ID планет, например: ['earth-hub', 'mars-station', 'ceres-outpost']
  totalDistance: number; // Итоговое расстояние
}

export const findShortestPath = (
  nodes: SpaceNode[],
  edges: SpaceEdge[],
  startNodeId: string,
  endNodeId: string,
): RouteResult | null => {
  const adjacencyList = new Map<
    string,
    { targetId: string; distance: number }[]
  >();

  for (const { sourceId, targetId, distance, status } of edges) {
    if (status !== "active") continue;

    if (!adjacencyList.has(sourceId)) adjacencyList.set(sourceId, []);
    adjacencyList.get(sourceId)!.push({ targetId, distance });

  }

  // 2. Инициализируйте таблицы расстояний (distances) и предков (previous)
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const node of nodes) {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  }
  distances[startNodeId] = 0;

  // 3. Основной цикл Дейкстры
  while (unvisited.size > 0) {
    // Находим узел с минимальным расстоянием из еще непосещенных
    let currentNodeId: string | null = null;
    for (const nodeId of unvisited) {
      if (
        currentNodeId === null ||
        distances[nodeId] < distances[currentNodeId]
      ) {
        currentNodeId = nodeId;
      }
    }

    if (currentNodeId === null || distances[currentNodeId] === Infinity) break;
    if (currentNodeId === endNodeId) break; // Дошли до цели!

    unvisited.delete(currentNodeId);

    // Смотрим соседей текущего узла
    const neighbors = adjacencyList.get(currentNodeId) || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.targetId)) continue;

      // Релаксация ребра: считаем альтернативный путь
      const alternativePath = distances[currentNodeId] + edge.distance;
      if (alternativePath < distances[edge.targetId]) {
        distances[edge.targetId] = alternativePath;
        previous[edge.targetId] = currentNodeId;
      }
    }
  }

  // 4. Восстановление пути
  // Если до конечной точки расстояние Infinity — пути нет, возвращаем null
  if (distances[endNodeId] === Infinity) return null;

  const path: string[] = [];
  let u: string | null = endNodeId;
  while (u !== null) {
    path.unshift(u);
    u = previous[u];
  }

  return {
    path,
    totalDistance: distances[endNodeId],
  };
};
