import {
  CASTLES,
  CASTLE_BLOCK_RADIUS,
  PLAZA_RADIUS,
  ROAD_EDGES,
  ROAD_NODES,
  WALK_RADIUS,
} from '../../config/worldConfig.ts'
import type { Point, RoadKind } from '../../types/game.ts'
import { HALF } from '../../config/worldConfig.ts'
import { isWater } from './waterMath.ts'

export interface PolyEdge {
  index: number
  a: string
  b: string
  kind: RoadKind
  points: Point[]
}

function sampleEdge(a: Point, b: Point, bend: number): Point[] {
  const mx = (a.x + b.x) / 2
  const mz = (a.z + b.z) / 2
  const dx = b.x - a.x
  const dz = b.z - a.z
  const len = Math.hypot(dx, dz) || 1
  const cx = mx + (-dz / len) * bend
  const cz = mz + (dx / len) * bend
  const steps = Math.max(4, Math.ceil(len / 2))
  const points: Point[] = []

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const u = 1 - t
    points.push({
      x: u * u * a.x + 2 * u * t * cx + t * t * b.x,
      z: u * u * a.z + 2 * u * t * cz + t * t * b.z,
    })
  }
  return points
}

export const POLY_EDGES: PolyEdge[] = ROAD_EDGES.map((edge, index) => ({
  index,
  a: edge.a,
  b: edge.b,
  kind: edge.kind,
  points: sampleEdge(ROAD_NODES[edge.a], ROAD_NODES[edge.b], edge.bend),
}))

const neighbors = new Map<string, { id: string; cost: number }[]>()

for (const id of Object.keys(ROAD_NODES)) neighbors.set(id, [])

for (const edge of POLY_EDGES) {
  const a = ROAD_NODES[edge.a]
  const b = ROAD_NODES[edge.b]
  const cost = Math.hypot(a.x - b.x, a.z - b.z)
  neighbors.get(edge.a)?.push({ id: edge.b, cost })
  neighbors.get(edge.b)?.push({ id: edge.a, cost })
}

export function roadNeighbors(id: string): { id: string; cost: number }[] {
  return neighbors.get(id) ?? []
}

export interface RoadHit {
  edge: number
  t: number
  dist: number
  x: number
  z: number
  kind: RoadKind
}

export function nearestRoadPoint(x: number, z: number): RoadHit | null {
  let best: RoadHit | null = null

  for (const edge of POLY_EDGES) {
    const pts = edge.points
    for (let i = 0; i < pts.length - 1; i += 1) {
      const a = pts[i]
      const b = pts[i + 1]
      const abx = b.x - a.x
      const abz = b.z - a.z
      const ab2 = abx * abx + abz * abz
      const raw = ab2 === 0 ? 0 : ((x - a.x) * abx + (z - a.z) * abz) / ab2
      const local = Math.max(0, Math.min(1, raw))
      const qx = a.x + abx * local
      const qz = a.z + abz * local
      const dist = Math.hypot(x - qx, z - qz)
      if (!best || dist < best.dist) {
        const t0 = i / (pts.length - 1)
        const t1 = (i + 1) / (pts.length - 1)
        best = {
          edge: edge.index,
          t: t0 + (t1 - t0) * local,
          dist,
          x: qx,
          z: qz,
          kind: edge.kind,
        }
      }
    }
  }

  return best
}

export function distanceToRoad(x: number, z: number): number {
  return nearestRoadPoint(x, z)?.dist ?? Infinity
}

export function distanceToBridge(x: number, z: number): number {
  let best = Infinity
  for (const edge of POLY_EDGES) {
    if (edge.kind !== 'bridge') continue
    for (let i = 0; i < edge.points.length - 1; i += 1) {
      const a = edge.points[i]
      const b = edge.points[i + 1]
      const abx = b.x - a.x
      const abz = b.z - a.z
      const ab2 = abx * abx + abz * abz
      const t = ab2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - a.x) * abx + (z - a.z) * abz) / ab2))
      best = Math.min(best, Math.hypot(x - (a.x + abx * t), z - (a.z + abz * t)))
    }
  }
  return best
}

export function findEdgeBetween(a: string, b: string): PolyEdge | undefined {
  return POLY_EDGES.find((edge) => (edge.a === a && edge.b === b) || (edge.a === b && edge.b === a))
}

function nearPlaza(x: number, z: number): boolean {
  for (const castle of CASTLES) {
    if (Math.hypot(x - castle.approach.x, z - castle.approach.z) <= PLAZA_RADIUS) return true
  }
  return false
}

function insideCastle(x: number, z: number): boolean {
  for (const castle of CASTLES) {
    if (Math.hypot(x - castle.position.x, z - castle.position.z) < CASTLE_BLOCK_RADIUS) return true
  }
  return false
}

/** Герой может стоять на дороге, на мосту и на площадке у ворот. */
export function isWalkable(x: number, z: number): boolean {
  if (Math.abs(x) > HALF - 3 || Math.abs(z) > HALF - 3) return false
  if (insideCastle(x, z)) return false

  const hit = nearestRoadPoint(x, z)
  const onRoad = Boolean(hit && hit.dist <= WALK_RADIUS[hit.kind])
  const onBridge = distanceToBridge(x, z) <= WALK_RADIUS.bridge + 0.8

  if (isWater(x, z) && !onBridge) return false
  if (onRoad || nearPlaza(x, z)) return true
  return false
}
