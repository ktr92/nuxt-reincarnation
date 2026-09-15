// calculate.post.ts

import { findShortestPath } from "#server/utils/dijkstra";
import { getSpaceData } from "#server/utils/spaceState";
import { validateGraphIntegrity } from "~~/server/utils/validators";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body || !body.startNodeId || !body.endNodeId) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Bad Request: startNodeId and endNodeId are required fields.",
    });
  }

  const { startNodeId, endNodeId, currentCriteria } = body;
  const criteria = currentCriteria === 'cost' ? 'cost' : 'distance';

  if (startNodeId === endNodeId) {
    return {
      status: "success",
      data: {
        path: [startNodeId],
        totalDistance: 0,
      },
    };
  }


  
  // Получаем доступ к изолированному кэш-хранилищу Nitro в памяти
  const cache = useStorage('cache');

  // Формируем уникальный ключ кэша (хэш подзадачи DP)
  const cacheKey = `route:${startNodeId}:${endNodeId}:${criteria}`;

  // Проверяем, считали ли мы этот путь ранее O(1)
  const cachedResult = await cache.getItem(cacheKey);

  if (cachedResult) {
    // Если нашли — отдаем мгновенно, расчет маршрута не запускается!
    return {
      status: "success",
      data: cachedResult,
      fromCache: true // Флаг для UI (метрика эффективности)
    };
  }

  // Если в кэше пусто — запускаем расчет
  const graph = getSpaceData();

  
  if (!validateGraphIntegrity(graph.nodes, graph.edges)) {
    return {
      status: 'error',
      code: '422',
      error: 'Unprocessable Entity'
    }
     
  }
  const result = findShortestPath(
    graph.nodes,
    graph.edges,
    startNodeId,
    endNodeId,
    criteria
  );

  // Сохраняем результат в кэш, чтобы помочь будущим запросам
  if (result) {
    await cache.setItem(cacheKey, result);
  }

  return {
    status: "success",
    data: result,
  };
});
