import { CASTLES, HALF, LAKES, MAP_SCALE, PEAKS, SITES } from '../../config/worldConfig.ts'
import { mulberry32 } from '../math.ts'
import { distanceToRoad } from '../navigation/RoadGraph.ts'
import { distanceToRiver, isWater, lakeFactor } from '../navigation/waterMath.ts'
import { heightAt } from './height.ts'

export interface InstanceItem {
  x: number
  y: number
  z: number
  rot: number
  scale: number
}

function nearCastle(x: number, z: number, radius: number): boolean {
  const onCastle = CASTLES.some((castle) => {
    const pad = radius * ((castle.size ?? 11) / 11)
    return Math.hypot(x - castle.position.x, z - castle.position.z) < pad
  })
  const onSite = SITES.some((site) => Math.hypot(x - site.position.x, z - site.position.z) < radius + 2)
  return onCastle || onSite
}

function build(): {
  pines: InstanceItem[]
  oaks: InstanceItem[]
  talls: InstanceItem[]
  bushes: InstanceItem[]
  flowers: InstanceItem[]
  rocks: InstanceItem[]
  reeds: InstanceItem[]
} {
  const rand = mulberry32(20261007)
  const pines: InstanceItem[] = []
  const oaks: InstanceItem[] = []
  const talls: InstanceItem[] = []
  const bushes: InstanceItem[] = []
  const flowers: InstanceItem[] = []
  const rocks: InstanceItem[] = []
  const reeds: InstanceItem[] = []

  const pushTree = (list: InstanceItem[], x: number, z: number, scale: number) => {
    const y = heightAt(x, z)
    list.push({ x, y, z, rot: rand() * Math.PI * 2, scale })
  }

  const canTree = (x: number, z: number, roadGap: number) => {
    if (Math.abs(x) > HALF - 4 || Math.abs(z) > HALF - 4) return false
    if (distanceToRoad(x, z) < roadGap) return false
    if (isWater(x, z)) return false
    if (nearCastle(x, z, 7)) return false
    const y = heightAt(x, z)
    if (y < -0.15 || y > 6.2) return false
    return true
  }

  const groves: { x: number; z: number; r: number; kind: 'pine' | 'oak' | 'bush'; n: number }[] = [
    { x: -16 * MAP_SCALE, z: -34 * MAP_SCALE, r: 14 * MAP_SCALE, kind: 'pine', n: 14 },
    { x: 16 * MAP_SCALE, z: 8 * MAP_SCALE, r: 11 * MAP_SCALE, kind: 'oak', n: 9 },
    { x: -44 * MAP_SCALE, z: 16 * MAP_SCALE, r: 11 * MAP_SCALE, kind: 'oak', n: 8 },
    { x: 56 * MAP_SCALE, z: -34 * MAP_SCALE, r: 11 * MAP_SCALE, kind: 'pine', n: 8 },
    { x: -16 * MAP_SCALE, z: 52 * MAP_SCALE, r: 10 * MAP_SCALE, kind: 'pine', n: 7 },
    { x: 36 * MAP_SCALE, z: 18 * MAP_SCALE, r: 9 * MAP_SCALE, kind: 'bush', n: 8 },
  ]

  for (const grove of groves) {
    let guard = 0
    let placed = 0
    while (placed < grove.n && guard < 80) {
      guard += 1
      const x = grove.x + (rand() - 0.5) * grove.r * 2
      const z = grove.z + (rand() - 0.5) * grove.r * 2
      const gap = (grove.kind === 'bush' ? 4.4 : 5.6) * MAP_SCALE
      if (!canTree(x, z, gap)) continue
      const scale = 0.75 + rand() * 0.7
      if (grove.kind === 'pine') pushTree(pines, x, z, scale)
      if (grove.kind === 'oak') pushTree(oaks, x, z, scale)
      if (grove.kind === 'bush') pushTree(bushes, x, z, 0.6 + rand() * 0.5)
      placed += 1
    }
  }

  let guard = 0
  while (pines.length < 70 && guard < 2500) {
    guard += 1
    const x = (rand() - 0.5) * HALF * 1.7
    const z = (rand() - 0.5) * HALF * 1.7
    if (!canTree(x, z, 5.8 * MAP_SCALE)) continue
    if (z > 10 * MAP_SCALE && rand() > 0.45) continue
    pushTree(pines, x, z, 0.8 + rand() * 0.85)
  }

  guard = 0
  while (oaks.length < 48 && guard < 2500) {
    guard += 1
    const x = (rand() - 0.5) * HALF * 1.7
    const z = (rand() - 0.5) * HALF * 1.7
    if (!canTree(x, z, 5.8 * MAP_SCALE)) continue
    pushTree(oaks, x, z, 0.75 + rand() * 0.7)
  }

  guard = 0
  while (talls.length < 18 && guard < 2000) {
    guard += 1
    const x = (rand() - 0.5) * HALF * 1.6
    const z = (rand() - 0.5) * HALF * 1.6
    if (!canTree(x, z, 7 * MAP_SCALE)) continue
    pushTree(talls, x, z, 1.1 + rand() * 0.45)
  }

  guard = 0
  while (bushes.length < 80 && guard < 2500) {
    guard += 1
    const x = (rand() - 0.5) * HALF * 1.7
    const z = (rand() - 0.5) * HALF * 1.7
    if (!canTree(x, z, 4.3 * MAP_SCALE)) continue
    pushTree(bushes, x, z, 0.45 + rand() * 0.55)
  }

  guard = 0
  while (flowers.length < 70 && guard < 2000) {
    guard += 1
    const x = (rand() - 0.5) * HALF * 1.6
    const z = (rand() - 0.5) * HALF * 1.6
    if (distanceToRoad(x, z) < 6 * MAP_SCALE) continue
    if (isWater(x, z) || nearCastle(x, z, 6)) continue
    const y = heightAt(x, z)
    if (y < 0 || y > 1.8) continue
    flowers.push({ x, y: y + 0.05, z, rot: rand() * 6, scale: 0.35 + rand() * 0.4 })
  }

  for (const peak of PEAKS) {
    for (let i = 0; i < 7; i += 1) {
      const x = peak.x + (rand() - 0.5) * peak.radius * 0.7
      const z = peak.z + (rand() - 0.5) * peak.radius * 0.7
      if (distanceToRoad(x, z) < 6 * MAP_SCALE) continue
      rocks.push({
        x,
        y: heightAt(x, z),
        z,
        rot: rand() * 6,
        scale: 1.4 + rand() * 1.8,
      })
    }
  }

  guard = 0
  while (rocks.length < 55 && guard < 2000) {
    guard += 1
    const x = (rand() - 0.5) * HALF * 1.8
    const z = (rand() - 0.5) * HALF * 1.8
    const y = heightAt(x, z)
    const road = distanceToRoad(x, z)
    const lining = road > 4.6 * MAP_SCALE && road < 8 * MAP_SCALE && y < 2
    const slope = y > 2.4
    if (!lining && !slope) continue
    if (isWater(x, z) || nearCastle(x, z, 6)) continue
    rocks.push({ x, y, z, rot: rand() * 6, scale: lining ? 0.35 + rand() * 0.35 : 0.7 + rand() * 1.1 })
  }

  for (const lake of LAKES) {
    for (let i = 0; i < 14; i += 1) {
      const angle = rand() * Math.PI * 2
      const x = lake.x + Math.cos(angle) * lake.rx * 0.92
      const z = lake.z + Math.sin(angle) * lake.rz * 0.92
      if (distanceToRoad(x, z) < 3 * MAP_SCALE) continue
      reeds.push({ x, y: -0.1, z, rot: rand() * 6, scale: 0.7 + rand() * 0.5 })
    }
  }

  guard = 0
  while (reeds.length < 36 && guard < 400) {
    guard += 1
    const t = rand()
    const x = (rand() - 0.5) * HALF * 1.5
    const z = (rand() - 0.5) * HALF * 1.6
    if (Math.abs(distanceToRiver(x, z) - 3.1 * MAP_SCALE) > 1.1 * MAP_SCALE) continue
    if (lakeFactor(x, z) > 0) continue
    if (distanceToRoad(x, z) < 3 * MAP_SCALE) continue
    reeds.push({ x, y: -0.15, z, rot: t * 6, scale: 0.6 + rand() * 0.5 })
  }

  return { pines, oaks, talls, bushes, flowers, rocks, reeds }
}

let cache: ReturnType<typeof build> | null = null

export function getNature() {
  if (!cache) cache = build()
  return cache
}
