import { findShortestPath } from "../utils/dijkstra";
import { getSpaceData } from "../utils/spaceState";

export default defineEventHandler(async (event) => {
  const {startNodeId, endNodeId } = await readBody(event);
  
  const graph = getSpaceData();

  const result = findShortestPath(graph.nodes, graph.edges, startNodeId, endNodeId);

  return {
   status: 'success',
   data: result
  }
})
