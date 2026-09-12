export interface SpaceNode {
  readonly id: string
  readonly name: string
  readonly coordinates: { x: number; y: number; z: number }
  readonly type: 'hub' | 'station' | 'outpost'
}

export interface SpaceEdge {
 readonly sourceId: string
 readonly targetId: string
 readonly distance: number
 readonly costPerLightYear: number
 readonly status: 'active' | 'blocked' | 'maintenance'
}

export  interface ApiResponseSuccess<T> {
 readonly status: 'success'
 readonly data: T
}
export interface ApiResponseError {
 readonly status: 'error'
 readonly error: string
 readonly code: number
}

export type ApiResponse<T> = ApiResponseError | ApiResponseSuccess<T>