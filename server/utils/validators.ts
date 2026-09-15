// server/utils/validators.ts
import type {
  SpaceNode,
  SpaceEdge,
  NodeId,
  EdgeId,
  PositiveNumber
} from "../../app/types/space";



/**
 * Type Guard для валидации шаблонного литерала NodeId в рантайме
 */
export function isValidNodeId(id: unknown): id is NodeId {
  return typeof id === "string" && id.startsWith("node_") && id.length > 5;
}

/**
 * Type Guard для валидации структуры и состава EdgeId
 */
export function isValidEdgeId(
  id: unknown,
  sourceId: NodeId,
  targetId: NodeId,
): id is EdgeId {
  return typeof id === "string" && id === `edge:${sourceId}->${targetId}`;
}

/**
 * ADVANCED TYPE PREDICATE: Проверяет число и накладывает уникальный бренд PositiveNumber.
 * Это единственное легитимное место в приложении для Type Casting (`as`).
 */
export function isPositiveNumber(value: unknown): value is PositiveNumber {
  return typeof value === 'number' && !Number.isNaN(value) && value > 0;
}

/**
 * ASSERTION FUNCTION: Инструмент жесткого контроля целостности данных.
 * Выбрасывает исключение, если структура ребра нарушена.
 * Благодаря `asserts edge is SpaceEdge` компилятор автоматически 
 * применит этот тип к переменной после вызова функции.
 */
export function assertSpaceEdge(edge: unknown): asserts edge is SpaceEdge {
  if (!edge || typeof edge !== 'object') {
    throw new Error("Data Integrity Error: Edge must be a non-null object.");
  }

  const e = edge as Record<string, any>;

  // 1. Валидация идентификаторов узлов
  if (!isValidNodeId(e.sourceId)) {
    throw new Error(`Data Integrity Error: Invalid sourceId format "${e.sourceId}". Expected "node_\${string}"`);
  }
  if (!isValidNodeId(e.targetId)) {
    throw new Error(`Data Integrity Error: Invalid targetId format "${e.targetId}". Expected "node_\${string}"`);
  }

  // 2. Алгоритмическая защита: Валидация весов и автоматическое брендирование
  if (!isPositiveNumber(e.distance)) {
    throw new Error(`Data Integrity Error: distance must be a positive number (> 0). Got: ${e.distance}`);
  }
  if (!isPositiveNumber(e.costPerLightYear) && e.costPerLightYear !== 0) {
    // Стоимость может быть 0 (бесплатный маршрут), но не отрицательной
    if (typeof e.costPerLightYear !== 'number' || Number.isNaN(e.costPerLightYear) || e.costPerLightYear < 0) {
      throw new Error(`Data Integrity Error: costPerLightYear must be a non-negative number (>= 0). Got: ${e.costPerLightYear}`);
    }
  }

  // 3. Защита от петель (самолинкования графа)
  if (e.sourceId === e.targetId) {
    throw new Error(`Topology Error: Loop detected. Node "${e.sourceId}" cannot link to itself.`);
  }

  // 4. Проверка и валидация EdgeId
  const expectedEdgeId = `edge:${e.sourceId}->${e.targetId}`;
  if (e.id && !isValidEdgeId(e.id, e.sourceId, e.targetId)) {
    throw new Error(`Topology Error: Edge ID mismatch. Got "${e.id}", expected "${expectedEdgeId}"`);
  }

  // 5. Проверка допустимых статусов
  const allowedStatuses = ['active', 'blocked', 'maintenance'];
  if (!allowedStatuses.includes(e.status)) {
    throw new Error(`Data Integrity Error: Invalid edge status "${e.status}".`);
  }
}


/**
 * Безопасный рантайм-валидатор для использования в условных конструкциях (if/filter)
 */
export function isValidSpaceEdge(edge: unknown): edge is SpaceEdge {
  try {
    assertSpaceEdge(edge);
    return true;
  } catch {
    return false;
  }
}

/**
 * Валидатор топологической целостности всего графа (Data Integrity Constraints)
 */
export function validateGraphIntegrity(nodes: SpaceNode[], edges: SpaceEdge[]): boolean {
  // Быстрый O(1) маппинг существующих NodeId в системе
  const nodeIds = new Set<NodeId>(nodes.map(n => n.id));

  // Бизнес-правило: Нельзя инициализировать пустой граф
  if (nodeIds.size === 0 || edges.length === 0) return false;

  for (const edge of edges) {
    // 1. Проверяем структуру ребра и валидность брендированных чисел
    if (!isValidSpaceEdge(edge)) return false;
    
    // 2. Проверяем консистентность связей: исключаем "висячие" ребра (dangling references)
    if (!nodeIds.has(edge.sourceId) || !nodeIds.has(edge.targetId)) return false;
  }

  return true;
}
