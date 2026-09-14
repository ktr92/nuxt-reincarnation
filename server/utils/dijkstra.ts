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

    if (adjacencyList.has(sourceId)) {
      const exist = adjacencyList.get(sourceId)!;
      exist?.push({ targetId, distance });
      adjacencyList.set(sourceId, exist);
    } else {
      adjacencyList.set(sourceId, [{ targetId, distance }]);
    }
  }

  // 2. Инициализируйте таблицы расстояний (distances) и предков (previous)
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const node of nodes) {
    distances[node.id] = Infinity
    previous[node.id] = null
    unvisited.add(node.id)
  }
  distances[startNodeId] = 0;

  


  /**
   * const newNodes: SpaceNode[] = [
    {
      id: 'earth-hub',
      name: 'Терра Центральный Хаб (Земля)',
      coordinates: { x: 0, y: 0, z: 0 },
      type: 'hub'
    },
    {
      id: 'mars-station',
      name: 'Аванпост Нью-Арес (Марс)',
      coordinates: { x: 140, y: 250, z: -50 },
      type: 'station'
    },
   
  ];
  const newEdges: SpaceEdge[] = [
    {
      sourceId: 'earth-hub',
      targetId: 'mars-station',
      distance: 2.25, 
      costPerLightYear: 150,
      status: 'active'
    },
    
  ];
   */
};
