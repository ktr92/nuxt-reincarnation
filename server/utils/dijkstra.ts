import type {
  SpaceNode,
  SpaceEdge,
  NodeId,
  PositiveNumber,
  RouteResult,
} from "../../app/types/space";

/**
 * Внутренний интерфейс для смежных узлов.
 * Все поля строго типизированы, никаких сырых примитивов.
 */
interface AdjacentLink {
  readonly targetId: NodeId;
  readonly distance: PositiveNumber;
  readonly costPerLightYear: PositiveNumber;
}

/**
 * Чистая функция для вычисления веса ребра на основе выбранного критерия.
 * Возвращает number, так как при перемножении бренды стираются, что математически корректно.
 */
const getWeight = (
  edge: AdjacentLink,
  criteria: "distance" | "cost",
): number => {
  return criteria === "distance"
    ? edge.distance
    : edge.distance * edge.costPerLightYear;
};

/**
 * Алгоритм Дейкстры с гарантированной типобезопасностью на уровне компиляции.
 * Исключает зависания и бесконечные циклы благодаря контракту PositiveNumber.
 */
export const findShortestPath = (
  nodes: readonly SpaceNode[],
  edges: readonly SpaceEdge[],
  startNodeId: NodeId,
  endNodeId: NodeId,
  criteria: "distance" | "cost",
): RouteResult | null => {
  // 1. Построение списка смежности (Adjacency List) с явной типизацией ключей NodeId
  const adjacencyList = new Map<NodeId, AdjacentLink[]>();

  for (const edge of edges) {
    if (edge.status !== "active") continue;

    // Инициализируем массив для узла, если его еще нет
    let links = adjacencyList.get(edge.sourceId);
    if (!links) {
      links = [];
      adjacencyList.set(edge.sourceId, links);
    }

    links.push({
      targetId: edge.targetId,
      distance: edge.distance,
      costPerLightYear: edge.costPerLightYear,
    });
  }

  // 2. Инициализация таблиц расстояний и предков с использованием типизированных Record
  const distances: Record<NodeId, number> = {} as Record<NodeId, number>;
  const previous: Record<NodeId, NodeId | null> = {} as Record<
    NodeId,
    NodeId | null
  >;
  const unvisited = new Set<NodeId>();

  for (const node of nodes) {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  }

  // Защита: Если стартовая точка не существует в графе, вычисления не имеют смысла
  if (!unvisited.has(startNodeId)) return null;
  distances[startNodeId] = 0;

  // 3. Основной вычислительный цикл
  while (unvisited.size > 0) {
    let currentNodeId: NodeId | null = null;

    // Поиск непосещенного узла с минимальным весом
    for (const nodeId of unvisited) {
      const distNode = distances[nodeId] ?? Infinity;
      const distCurrent =
        currentNodeId !== null
          ? (distances[currentNodeId] ?? Infinity)
          : Infinity;

      if (currentNodeId === null || distNode < distCurrent) {
        currentNodeId = nodeId;
      }
    }

    if (currentNodeId === null) break;

    // Если мы уперлись в недостижимый узел или дошли до целевой точки — останавливаемся
    const currentNodeDistance = distances[currentNodeId] ?? Infinity;
    if (currentNodeDistance === Infinity) break;
    if (currentNodeId === endNodeId) break;

    unvisited.delete(currentNodeId);

    // Обработка соседей текущего узла
    const neighbors = adjacencyList.get(currentNodeId) ?? [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.targetId)) continue;

      const targetNodeDistance = distances[edge.targetId] ?? Infinity;
      const alternativePath = currentNodeDistance + getWeight(edge, criteria);

      if (alternativePath < targetNodeDistance) {
        distances[edge.targetId] = alternativePath;
        previous[edge.targetId] = currentNodeId;
      }
    }
  }

  // 4. Проверка достижимости целевого узла
  if (distances[endNodeId] === Infinity) return null;

  const finalWeight = distances[endNodeId] ?? Infinity;
  if (finalWeight === Infinity) return null;

  // 5. Восстановление итогового пути
  const path: NodeId[] = [];
  let u: NodeId | null = endNodeId;

  while (u !== null) {
    path.push(u);
    u = previous[u] ?? null; // Избегаем undefined, строго придерживаемся контракта Nullable
  }

  return {
    path: path.reverse(),
    totalWeight: finalWeight,
  };
};
