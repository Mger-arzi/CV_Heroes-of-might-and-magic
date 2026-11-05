import { useEffect, useMemo } from 'react'
import { BufferGeometry, Color, Float32BufferAttribute } from 'three'
import { HALF } from '../../config/worldConfig.ts'
import { commandMoveTo } from '../commands.ts'
import { grassMaterial } from '../materials.ts'
import { motion } from '../motion.ts'
import { distanceToRiver, lakeFactor } from '../navigation/waterMath.ts'
import { heightAt } from './height.ts'

const OUTER = 280

function linspace(from: number, to: number, segments: number): number[] {
  const values: number[] = []
  for (let i = 0; i <= segments; i += 1) values.push(from + ((to - from) * i) / segments)
  return values
}

function axis(): number[] {
  return [
    ...linspace(-OUTER, -HALF, 18).slice(0, -1),
    ...linspace(-HALF, HALF, 96),
    ...linspace(HALF, OUTER, 18).slice(1),
  ]
}

function buildTerrain(): BufferGeometry {
  const xs = axis()
  const zs = axis()
  const positions: number[] = []
  const colors: number[] = []
  const indices: number[] = []
  const grassA = new Color('#5c8a3a')
  const grassB = new Color('#74a64c')
  const grassC = new Color('#467232')
  const rock = new Color('#7a736a')
  const sand = new Color('#c6b48a')
  const tmp = new Color()

  for (let iz = 0; iz < zs.length; iz += 1) {
    for (let ix = 0; ix < xs.length; ix += 1) {
      const x = xs[ix]
      const z = zs[iz]
      const h = heightAt(x, z)
      positions.push(x, h, z)
      const noise = Math.sin(x * 0.37) * Math.cos(z * 0.31)
      if (h > 3.1) tmp.copy(rock)
      else if (lakeFactor(x, z) > 0 || distanceToRiver(x, z) < 4.4) tmp.copy(sand)
      else if (noise > 0.25) tmp.copy(grassB)
      else if (noise < -0.25) tmp.copy(grassC)
      else tmp.copy(grassA)
      const shade = 0.9 + (Math.sin(x * 1.7 + z) * 0.5 + 0.5) * 0.18
      tmp.multiplyScalar(shade)
      colors.push(tmp.r, tmp.g, tmp.b)
    }
  }

  const stride = xs.length
  for (let iz = 0; iz < zs.length - 1; iz += 1) {
    for (let ix = 0; ix < xs.length - 1; ix += 1) {
      const a = iz * stride + ix
      const b = a + 1
      const c = a + stride
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

export function Terrain() {
  const geometry = useMemo(() => buildTerrain(), [])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh
      geometry={geometry}
      material={grassMaterial}
      receiveShadow
      onClick={(event) => {
        event.stopPropagation()
        if (motion.suppressClick) {
          motion.suppressClick = false
          return
        }
        commandMoveTo(event.point.x, event.point.z)
      }}
    />
  )
}
