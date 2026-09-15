// server/utils/validators.ts
import type { SpaceNode, SpaceEdge, NodeId } from "../../app/types/space";

/**
 * Type Guard для проверки валидности ребра графа в рантайме
 */
export function isValidSpaceEdge(edge: unknown): edge is SpaceEdge {

 if (!edge || typeof edge !== 'object') return false;

 const e = edge as Record<string, any>;

 // Проверяем наличие и базовые типы полей
  if (typeof e.sourceId !== 'string' || !e.sourceId.startsWith('node_')) return false;
  if (typeof e.targetId !== 'string' || !e.targetId.startsWith('node_')) return false;
  if (typeof e.distance !== 'number' || typeof e.costPerLightYear !== 'number') return false;

  // АЛГОРИТМИЧЕСКАЯ ЗАЩИТА: Дейкстра сломается при отрицательном весе
  if (e.distance <= 0 || e.costPerLightYear < 0) return false;

  // Защита от петель (самолинкования)
  if (e.sourceId === e.targetId) return false;

 return true
}


/**
 * Валидатор целостности всего графа
 */
export function validateGraphIntegrity(nodes: SpaceNode[], edges: SpaceEdge[]): boolean {
  const nodeIds = new Set<NodeId>(nodes.map(n => n.id));

  for (const edge of edges) {
    // 1. Каждый линк должен соответствовать правилам весов
    if (!isValidSpaceEdge(edge)) return false;
    
    // 2. Проверяем консистентность: существует ли узел старта и конца в массиве nodes
    if (!nodeIds.has(edge.sourceId) || !nodeIds.has(edge.targetId)) return false;
  }

 return true;
}