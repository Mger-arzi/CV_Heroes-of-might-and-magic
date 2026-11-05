import { LAKES, RIVER, RIVER_HALF } from '../../config/worldConfig.ts'
import type { Point } from '../../types/game.ts'
import { dist2 } from '../math.ts'

export function distanceToPolyline(x: number, z: number, points: Point[]): number {
  let best = Infinity
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i]
    const b = points[i + 1]
    const abx = b.x - a.x
    const abz = b.z - a.z
    const ab2 = abx * abx + abz * abz
    const t = ab2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - a.x) * abx + (z - a.z) * abz) / ab2))
    const qx = a.x + abx * t
    const qz = a.z + abz * t
    best = Math.min(best, dist2(x, z, qx, qz))
  }
  return best
}

export function lakeFactor(x: number, z: number): number {
  let best = 0
  for (const lake of LAKES) {
    const nx = (x - lake.x) / lake.rx
    const nz = (z - lake.z) / lake.rz
    const d = Math.hypot(nx, nz)
    if (d < 1) best = Math.max(best, 1 - d)
  }
  return best
}

export function distanceToRiver(x: number, z: number): number {
  return distanceToPolyline(x, z, RIVER)
}

export function isWater(x: number, z: number): boolean {
  if (lakeFactor(x, z) > 0) return true
  return distanceToRiver(x, z) < RIVER_HALF
}
