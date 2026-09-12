import { initSpaceData } from "#server/utils/spaceState";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  initSpaceData(body.nodes, body.edges)

  return {
   status: 'success',
   data: true
  }
})
