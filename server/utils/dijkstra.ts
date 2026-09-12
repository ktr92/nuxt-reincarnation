import type { SpaceNode, SpaceEdge } from '../../app/types/space'

interface RouteResult {
  path: string[];       // Массив ID планет, например: ['earth-hub', 'mars-station', 'ceres-outpost']
  totalDistance: number; // Итоговое расстояние
}