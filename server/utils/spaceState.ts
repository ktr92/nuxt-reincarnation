import type { SpaceNode, SpaceEdge } from '../../app/types/space'

// Хранилище в памяти сервера (In-Memory DB)
let serverNodes: SpaceNode[] = []
let serverEdges: SpaceEdge[] = []

export const getSpaceData = () => ({ nodes: serverNodes, edges: serverEdges })

export const initSpaceData = (nodes: SpaceNode[], edges: SpaceEdge[]) => {
  serverNodes = nodes
  serverEdges = edges
}
