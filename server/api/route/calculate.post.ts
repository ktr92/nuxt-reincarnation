// calculate.post.ts

import { findShortestPath } from "#server/utils/dijkstra";
import { getSpaceData } from "#server/utils/spaceState";
import { ApiResponse, NodeId, RouteResult } from "~/types/space";
import {
  isValidNodeId,
} from "#server/utils/validators";
/**
 * Описываем строгий контракт для тела входящего запроса
 */
interface CalculateRouteRequestBody {
  startNodeId: unknown;
  endNodeId: unknown;
  currentCriteria: unknown;
}

export default defineEventHandler(
  async (event): Promise<ApiResponse<RouteResult>> => {
    const body = await readBody<CalculateRouteRequestBody>(event);

    if (
      !body ||
      !isValidNodeId(body.startNodeId) ||
      !isValidNodeId(body.endNodeId)
    ) {
      setResponseStatus(event, 400);
      return {
        status: "error",
        error:
          "Bad Request: startNodeId and endNodeId must be valid NodeId strings formatted as 'node_${string}'.",
        code: 400,
      };
    }

    const startNodeId: NodeId = body.startNodeId;
    const endNodeId: NodeId = body.endNodeId;
    const criteria = body.currentCriteria === "cost" ? "cost" : "distance";

    if (startNodeId === endNodeId) {
      return {
        status: "success",
        data: {
          path: [startNodeId],
          totalWeight: 0,
        },
      };
    }

    // Если в кэше пусто — запускаем расчет
    const graph = getSpaceData();


    // Получаем доступ к изолированному кэш-хранилищу Nitro в памяти
    const cache = useStorage("cache");

    // Формируем уникальный ключ кэша (хэш подзадачи DP)
    const cacheKey = `route:${startNodeId}:${endNodeId}:${criteria}`;

    // Проверяем, считали ли мы этот путь ранее O(1)
    const cachedResult = await cache.getItem<RouteResult>(cacheKey);

    if (cachedResult) {
      // Если нашли — отдаем мгновенно, расчет маршрута не запускается!
      return {
        status: "success",
        data: cachedResult,
        fromCache: true, // Флаг для UI (метрика эффективности)
      };
    }

    const result = findShortestPath(
      graph.nodes,
      graph.edges,
      startNodeId,
      endNodeId,
      criteria,
    );

     // Гарантия консистентности: если пути нет, возвращаем регламентированную ошибку API
    if (!result || result.totalWeight === Infinity || result.path.length === 0) {
      setResponseStatus(event, 404);
      return {
        status: "error",
        error: `Маршрут заблокирован или целевой сектор изолирован. Невозможно проложить стабильный гиперпуть между "${startNodeId}" и "${endNodeId}".`,
        code: 404
      };
    }

    // Сохраняем результат в кэш, чтобы помочь будущим запросам
    await cache.setItem(cacheKey, result);

    return {
      status: "success",
      data: result,
    };
  },
);
