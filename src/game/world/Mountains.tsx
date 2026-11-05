import { useMemo } from 'react'
import { DodecahedronGeometry } from 'three'
import { mat } from '../materials.ts'
import { getNature } from './scatter.ts'
import { Instances } from './Instances.tsx'

const rockMaterial = mat('#6f6a64', 0.95, 0.02)

export function Mountains() {
  const geometry = useMemo(() => new DodecahedronGeometry(1, 0), [])
  return (
    <Instances items={getNature().rocks} castShadow>
      <primitive object={geometry} attach="geometry" />
      <primitive object={rockMaterial} attach="material" />
    </Instances>
  )
}
