import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Object3D, type InstancedMesh } from 'three'
import type { InstanceItem } from './scatter.ts'

const dummy = new Object3D()

/** Одинаковые деревья и камни рисуются одним вызовом, а не отдельным объектом. */
export function Instances({
  items,
  castShadow = false,
  children,
}: {
  items: InstanceItem[]
  castShadow?: boolean
  children: ReactNode
}) {
  const ref = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    items.forEach((item, index) => {
      dummy.position.set(item.x, item.y, item.z)
      dummy.rotation.set(0, item.rot, 0)
      dummy.scale.setScalar(item.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [items])

  if (items.length === 0) return null

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow={castShadow} raycast={() => null}>
      {children}
    </instancedMesh>
  )
}
