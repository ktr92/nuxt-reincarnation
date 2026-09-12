import type { SpaceNode, SpaceEdge } from '../types/space'

export const useSpaceNetwork = () => {
  // Используем shallowRef, так как объектов будет много и они readonly
  const nodes = shallowRef<SpaceNode[]>([])
  const edges = shallowRef<SpaceEdge[]>([])

  // Функция полной инициализации сети (например, при загрузке с сервера)
  const setNetwork = (newNodes: SpaceNode[], newEdges: SpaceEdge[]) => {
    nodes.value = newNodes
    edges.value = newEdges
  }

  const clearNetwork = () => {
   nodes.value = []
   edges.value = []
  }

  // Экспорт readonly версий для компонентов, чтобы они не могли мутировать стейт в обход функций
  return {
    nodes: readonly(nodes),
    edges: readonly(edges),
    setNetwork,
    clearNetwork
  }
}
