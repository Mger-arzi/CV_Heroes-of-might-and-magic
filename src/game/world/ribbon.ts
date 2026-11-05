import { BufferGeometry, Float32BufferAttribute } from 'three'
import type { Point } from '../../types/game.ts'

/** Лента вдоль линии: дороги, река и береговая кромка. */
export function buildRibbon(lines: Point[][], halfWidth: number, yAt: (x: number, z: number) => number): BufferGeometry {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const tileAlong = 1.55
  const tileAcross = 0.85

  for (const points of lines) {
    if (points.length < 2) continue
    const base = positions.length / 3
    const along = [0]
    for (let i = 1; i < points.length; i += 1) {
      along.push(along[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].z - points[i - 1].z))
    }

    for (let i = 0; i < points.length; i += 1) {
      const prev = points[Math.max(0, i - 1)]
      const next = points[Math.min(points.length - 1, i + 1)]
      let dx = next.x - prev.x
      let dz = next.z - prev.z
      const len = Math.hypot(dx, dz) || 1
      dx /= len
      dz /= len
      const y = yAt(points[i].x, points[i].z)
      const u = along[i] / tileAlong
      const v = (halfWidth * 2) / tileAcross
      positions.push(points[i].x + -dz * halfWidth, y, points[i].z + dx * halfWidth)
      positions.push(points[i].x - -dz * halfWidth, y, points[i].z - dx * halfWidth)
      normals.push(0, 1, 0, 0, 1, 0)
      uvs.push(u, 0, u, v)
    }

    for (let i = 0; i < points.length - 1; i += 1) {
      const a = base + i * 2
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  return geometry
}
