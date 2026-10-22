import type * as THREE from 'three'

export interface Sizes {
  height: number
  pixelRatio: number
  width: number
}

export type LoadedModel = THREE.Object3D & { geometry: THREE.BufferGeometry }
