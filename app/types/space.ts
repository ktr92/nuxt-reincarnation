
export type NodeId = `node_${string}`;
export type EdgeId = `edge:${NodeId}->${NodeId}`;

export interface SpaceNode {
  readonly id: NodeId
  readonly name: string
  readonly coordinates: { readonly x: number; readonly y: number; readonly z: number }
  readonly type: 'hub' | 'station' | 'outpost'
}

export interface SpaceEdge {
  readonly id?: EdgeId
 readonly sourceId: NodeId
 readonly targetId: NodeId
 readonly distance: number
 readonly costPerLightYear: number
 readonly status: 'active' | 'blocked' | 'maintenance'
}

export interface RouteResult {
  readonly path: NodeId[];
  readonly totalWeight: number;
}

export  interface ApiResponseSuccess<T> {
 readonly status: 'success'
 readonly data: T,
 readonly fromCache?: boolean; 
}
export interface ApiResponseError {
 readonly status: 'error'
 readonly error: string
 readonly code: number
}

export type ApiResponse<T> = ApiResponseError | ApiResponseSuccess<T>