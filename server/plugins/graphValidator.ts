// server/plugins/graphValidator.tss

import { SpaceEdge, SpaceNode } from "~/types/space";
import { logGraphAnomaly } from "../utils/errors";
import { validateGraphIntegrity } from "../utils/validators";

declare module "nitropack" {
  interface NitroRuntimeHooks {
    "space-erp:graph-updated": (
      nodes: SpaceNode[],
      edges: SpaceEdge[],
    ) => void | Promise<void>;
  }
}

defineNitroPlugin((nitroApp) => {
   // Подписываемся на кастомное событие обновления топологии
 nitroApp.hooks.hook('space-erp:graph-updated', (nodes: SpaceNode[], edges: SpaceEdge[]) => {
  if (!validateGraphIntegrity(nodes, edges)) {
   logGraphAnomaly(
        "Критическая аномалия: обновленный граф секторов не прошел рантайм-проверку на целостность данных!",
        { totalNodes: nodes.length, totalEdges: edges.length, timestamp: Date.now() }
      );
  }
 })
});
