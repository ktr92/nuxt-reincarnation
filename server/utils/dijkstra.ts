// server/utils/dijkstra.ts
import type {
  SpaceNode,
  SpaceEdge,
  NodeId,
  PositiveNumber,
} from "../../app/types/space";

interface RouteResult {
  path: string[]; // Массив ID планет, например: ['earth-hub', 'mars-station', 'ceres-outpost']
  totalWeight: number; // Итоговое расстояние
}

const getWeight = (
  edge: { distance: number; costPerLightYear: number },
  criteria: "distance" | "cost",
): number => {
  return criteria === "distance"
    ? edge.distance
    : edge.distance * edge.costPerLightYear;
};

export const findShortestPath = (
  nodes: SpaceNode[],
  edges: SpaceEdge[],
  startNodeId: NodeId,
  endNodeId: NodeId,
  criteria: "distance" | "cost",
): RouteResult | null => {
  const adjacencyList = new Map<
    string,
    {
      targetId: string;
      distance: PositiveNumber;
      costPerLightYear: PositiveNumber;
    }[]
  >();

  for (const {
    sourceId,
    targetId,
    distance,
    status,
    costPerLightYear,
  } of edges) {
    if (status !== "active") continue;

    if (!adjacencyList.has(sourceId)) adjacencyList.set(sourceId, []);
    adjacencyList.get(sourceId).push({ targetId, distance, costPerLightYear });
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
    if (currentNodeId === endNodeId) break; // Дошли до цели

    unvisited.delete(currentNodeId);

    // Смотрим соседей текущего узла
    const neighbors = adjacencyList.get(currentNodeId) || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.targetId)) continue;

      // Релаксация ребра: считаем альтернативный путь
      // Если criteria === 'distance', вес равен edge.distance.
      // Если criteria === 'cost', вес равен edge.distance * edge.costPerLightYear

      const alternativePath =
        distances[currentNodeId] + getWeight(edge, criteria);
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
    path.push(u);
    u = previous[u];
  }

  return {
    path: path.reverse(),
    totalWeight: distances[endNodeId],
  };
};
