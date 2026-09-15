import { getSpaceData } from "#server/utils/spaceState";
import { ApiResponse } from "~/types/space";

export default defineEventHandler(async () => {
  // Возвращаем данные в нашем строгом формате ApiResponse<T>

  const data = getSpaceData();

  return {
    status: "success",
    data: data,
  } as ApiResponse<{ nodes: typeof data.nodes; edges: typeof data.edges }>;
});
