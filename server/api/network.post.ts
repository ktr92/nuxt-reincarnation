// server/api/network.post.ts

import { initSpaceData } from "#server/utils/spaceState";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  initSpaceData(body.nodes, body.edges);

  const cache = useStorage("cache");
  // Очищаем все ключи, начинающиеся с 'route:'
  const keys = await cache.getKeys("route:");
  for (const key of keys) {
    await cache.removeItem(key);
  }

  const nitroApp = useNitroApp();
  await nitroApp.hooks.callHook('space-erp:graph-updated', body.nodes, body.edges);

  return {
    status: "success",
    data: true,
  };
});
