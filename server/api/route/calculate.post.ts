// calculate.post.ts

import { findShortestPath } from "#server/utils/dijkstra";
import { getSpaceData } from "#server/utils/spaceState";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body || !body.startNodeId || !body.endNodeId) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Bad Request: startNodeId and endNodeId are required fields.",
    });
  }

  const { startNodeId, endNodeId } = body;
  if (startNodeId === endNodeId) {
    return {
      status: "success",
      data: {
        path: [startNodeId],
        totalDistance: 0,
      },
    };
  }

  const graph = getSpaceData();
  const result = findShortestPath(
    graph.nodes,
    graph.edges,
    startNodeId,
    endNodeId,
  );

  return {
    status: "success",
    data: result,
  };
});
