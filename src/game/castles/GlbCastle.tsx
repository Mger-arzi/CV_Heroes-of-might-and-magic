import { useLayoutEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Mesh, Vector3, type Material } from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import type { CastleStyle } from '../../types/game.ts'

const WIDTH = 11

const CASTLE_FILES: Record<CastleStyle, string> = {
  azure: '/models/castles/castle-stone.glb',
  timber: '/models/castles/castle-wood.glb',
  sand: '/models/castles/castle-fortress.glb',
  river: '/models/castles/castle-wood.glb',
  fortress: '/models/castles/castle-fortress.glb',
  mage: '/models/castles/castle-stone.glb',
  ivory: '/models/castles/castle-gate.glb',
}

for (const url of new Set(Object.values(CASTLE_FILES))) useGLTF.preload(url)

export function GlbCastle({ style, width = WIDTH }: { style: CastleStyle; width?: number }) {
  const gltf = useGLTF(CASTLE_FILES[style])
  const model = useMemo(() => clone(gltf.scene), [gltf.scene])

  useLayoutEffect(() => {
    model.scale.set(1, 1, 1)
    model.position.set(0, 0, 0)
    model.rotation.set(0, 0, 0)
    model.traverse((obj) => {
      const mesh = obj as Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) soften(material)
    })
    // Measure without the castle group's yaw. A rotated world box inflates by
    // about √2 and the building stays the old size.
    const parent = model.parent
    parent?.remove(model)
    model.updateMatrixWorld(true)
    const box = new Box3().setFromObject(model)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const scale = width / Math.max(size.x, size.z, 0.01)
    model.scale.setScalar(scale)
    model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
    parent?.add(model)
  }, [model, width])

  return <primitive object={model} />
}

function soften(material: Material) {
  if (!('metalness' in material) || !('roughness' in material)) return
  const shaded = material as Material & { metalness: number; roughness: number }
  shaded.metalness = 0.05
  shaded.roughness = Math.max(shaded.roughness, 0.78)
}
