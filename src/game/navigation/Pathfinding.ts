import { ROAD_NODES } from '../../config/worldConfig.ts'
import type { Point } from '../../types/game.ts'
import { findEdgeBetween, nearestRoadPoint, POLY_EDGES, roadNeighbors } from './RoadGraph.ts'

function pointAt(edgeIndex: number, t: number): Point {
  const edge = POLY_EDGES[edgeIndex]
  const scaled = t * (edge.points.length - 1)
  const i = Math.max(0, Math.min(edge.points.length - 2, Math.floor(scaled)))
  const local = scaled - i
  const a = edge.points[i]
  const b = edge.points[i + 1]
  return { x: a.x + (b.x - a.x) * local, z: a.z + (b.z - a.z) * local }
}

function sliceEdge(edgeIndex: number, t0: number, t1: number): Point[] {
  const edge = POLY_EDGES[edgeIndex]
  const last = edge.points.length - 1
  const from = t0 * last
  const to = t1 * last
  const points: Point[] = [pointAt(edgeIndex, t0)]

  if (to >= from) {
    for (let i = Math.ceil(from); i <= Math.floor(to); i += 1) points.push(edge.points[i])
  } else {
    for (let i = Math.floor(from); i >= Math.ceil(to); i -= 1) points.push(edge.points[i])
  }

  points.push(pointAt(edgeIndex, t1))
  return dedupe(points)
}

function dedupe(points: Point[]): Point[] {
  const result: Point[] = []
  for (const point of points) {
    const prev = result[result.length - 1]
    if (!prev || Math.hypot(prev.x - point.x, prev.z - point.z) > 0.15) result.push(point)
  }
  return result
}

function polylineLength(points: Point[]): number {
  let length = 0
  for (let i = 1; i < points.length; i += 1) {
    length += Math.hypot(points[i].x - points[i - 1].x, points[i].z - points[i - 1].z)
  }
  return length
}

/** Короткий путь по узлам дорог. Граф маленький, поэтому обычный Дейкстра. */
export function dijkstra(start: string, goal: string): string[] | null {
  if (start === goal) return [start]

  const dist = new Map<string, number>()
  const prev = new Map<string, string>()
  const queue = new Set(Object.keys(ROAD_NODES))

  for (const id of queue) dist.set(id, Infinity)
  dist.set(start, 0)

  while (queue.size > 0) {
    let current: string | null = null
    let best = Infinity
    for (const id of queue) {
      const value = dist.get(id) ?? Infinity
      if (value < best) {
        best = value
        current = id
      }
    }
    if (!current || best === Infinity) break
    if (current === goal) break
    queue.delete(current)

    for (const next of roadNeighbors(current)) {
      if (!queue.has(next.id)) continue
      const alt = best + next.cost
      if (alt < (dist.get(next.id) ?? Infinity)) {
        dist.set(next.id, alt)
        prev.set(next.id, current)
      }
    }
  }

  if ((dist.get(goal) ?? Infinity) === Infinity) return null

  const path = [goal]
  let cursor = goal
  while (cursor !== start) {
    const parent = prev.get(cursor)
    if (!parent) return null
    path.push(parent)
    cursor = parent
  }
  path.reverse()
  return path
}

function routeVia(startEdge: number, startT: number, goalEdge: number, goalT: number, startNode: string, goalNode: string): Point[] | null {
  const nodePath = dijkstra(startNode, goalNode)
  if (!nodePath) return null

  const points: Point[] = []
  const start = POLY_EDGES[startEdge]
  const tStartNode = startNode === start.a ? 0 : 1
  points.push(...sliceEdge(startEdge, startT, tStartNode))

  for (let i = 0; i < nodePath.length - 1; i += 1) {
    const edge = findEdgeBetween(nodePath[i], nodePath[i + 1])
    if (!edge) return null
    const forward = edge.a === nodePath[i]
    let t0 = forward ? 0 : 1
    let t1 = forward ? 1 : 0
    const lastHop = i === nodePath.length - 2
    if (lastHop && edge.index === goalEdge) t1 = goalT
    points.push(...sliceEdge(edge.index, t0, t1).slice(1))
  }

  const arrivedByGoalEdge =
    nodePath.length >= 2 && findEdgeBetween(nodePath[nodePath.length - 2], nodePath[nodePath.length - 1])?.index === goalEdge

  if (!arrivedByGoalEdge) {
    const goal = POLY_EDGES[goalEdge]
    const tNode = goalNode === goal.a ? 0 : 1
    points.push(...sliceEdge(goalEdge, tNode, goalT).slice(1))
  }

  return dedupe(points)
}

/**
 * Строит маршрут по дорожной сети.
 * Если точка далеко от дороги, вернёт пустой массив — герой не поедет сквозь лес.
 */
export function findRoute(from: Point, to: Point): Point[] {
  const startHit = nearestRoadPoint(from.x, from.z)
  const goalHit = nearestRoadPoint(to.x, to.z)
  if (!startHit || !goalHit) return []
  if (goalHit.dist > 8) return []

  if (startHit.edge === goalHit.edge) {
    return sliceEdge(startHit.edge, startHit.t, goalHit.t)
  }

  const startEdge = POLY_EDGES[startHit.edge]
  const goalEdge = POLY_EDGES[goalHit.edge]
  let best: Point[] | null = null
  let bestLength = Infinity

  for (const startNode of [startEdge.a, startEdge.b]) {
    for (const goalNode of [goalEdge.a, goalEdge.b]) {
      const path = routeVia(startHit.edge, startHit.t, goalHit.edge, goalHit.t, startNode, goalNode)
      if (!path || path.length === 0) continue
      const length = polylineLength(path)
      if (length < bestLength) {
        bestLength = length
        best = path
      }
    }
  }

  return best ?? []
}
