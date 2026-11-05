import type { CastleConfig, Point, RoadKind } from '../types/game.ts'

/**
 * S умножает координаты дорог, рек и замков. Сами замки не уменьшаются.
 * Карта заполняет экран: по краям кадра остаётся узкая полоса травы.
 */
const S = 0.58

function place(x: number, z: number): Point {
  return { x: x * S, z: z * S }
}

export const MAP_SCALE = S
export const HALF = 40
export const WORLD_SIZE = HALF * 2

export const INTERACT_RADIUS = 7.6
export const PLAZA_RADIUS = 5.2
export const CASTLE_BLOCK_RADIUS = 3.3

export const SPAWN: Point = place(2, 10)

export const ROAD_NODES: Record<string, Point> = {
  spawn: place(2, 10),
  north: place(0, -14),
  west: place(-22, 6),
  nw: place(-36, -16),
  p1: place(-48, -36),
  east: place(24, 2),
  p2: place(46, -8),
  expMid: place(28, -20),
  south: place(4, 28),
  bridgeA: place(-6, 20),
  bridgeB: place(-18, 32),
  sw: place(-36, 40),
  p3: place(-48, 50),
  p4mid: place(16, 42),
  p4: place(18, 54),
  se: place(30, 30),
}

export interface RoadEdgeConfig {
  a: string
  b: string
  kind: RoadKind
  /** Насколько дорога выгибается в сторону. 0 = прямая. */
  bend: number
}

export const ROAD_EDGES: RoadEdgeConfig[] = [
  { a: 'spawn', b: 'north', kind: 'dirt', bend: 5 * S },
  { a: 'spawn', b: 'west', kind: 'dirt', bend: -3 * S },
  { a: 'west', b: 'nw', kind: 'path', bend: -6 * S },
  { a: 'nw', b: 'p1', kind: 'stone', bend: 4 * S },
  { a: 'spawn', b: 'east', kind: 'dirt', bend: 4 * S },
  { a: 'east', b: 'p2', kind: 'stone', bend: -3 * S },
  { a: 'east', b: 'expMid', kind: 'dirt', bend: 6 * S },
  { a: 'north', b: 'expMid', kind: 'path', bend: 5 * S },
  { a: 'spawn', b: 'south', kind: 'dirt', bend: -4 * S },
  { a: 'south', b: 'bridgeA', kind: 'dirt', bend: 2 * S },
  { a: 'bridgeA', b: 'bridgeB', kind: 'bridge', bend: 0 },
  { a: 'bridgeB', b: 'sw', kind: 'path', bend: -7 * S },
  { a: 'sw', b: 'p3', kind: 'dirt', bend: -3 * S },
  { a: 'south', b: 'p4mid', kind: 'dirt', bend: 4 * S },
  { a: 'p4mid', b: 'p4', kind: 'stone', bend: 2 * S },
  { a: 'south', b: 'se', kind: 'dirt', bend: -5 * S },
  { a: 'east', b: 'se', kind: 'path', bend: 6 * S },
  { a: 'west', b: 'bridgeA', kind: 'path', bend: -4 * S },
]

export const WALK_RADIUS: Record<RoadKind, number> = {
  dirt: 4.3 * S,
  stone: 4 * S,
  path: 3.55 * S,
  bridge: 3.5 * S,
}

export const ROAD_HALF_WIDTH: Record<RoadKind, number> = {
  dirt: 1.45 * S,
  stone: 1.62 * S,
  path: 0.92 * S,
  bridge: 1.5 * S,
}

export const RIVER: Point[] = [
  place(-64, -74),
  place(-66, -28),
  place(-50, -2),
  place(-28, 14),
  place(-12, 26),
  place(2, 38),
  place(6, 58),
  place(-4, 78),
]

export const RIVER_HALF = 2.15 * S

export const LAKES = [
  { x: -70 * S, z: 0, rx: 13 * S, rz: 9 * S },
  { x: 66 * S, z: 16 * S, rx: 6.5 * S, rz: 4.5 * S },
]

export const CASTLES: CastleConfig[] = [
  {
    id: 'castle-projects-1',
    title: 'Castle of Projects I',
    section: 'project',
    projectId: 'project-01',
    style: 'azure',
    approach: ROAD_NODES.p1,
    position: place(-54.2, -42.2),
    size: 16,
  },
  {
    id: 'castle-projects-2',
    title: 'Castle of Projects II',
    section: 'project',
    projectId: 'project-02',
    style: 'timber',
    approach: ROAD_NODES.p2,
    position: place(53.2, -12.6),
    size: 16,
  },
  {
    id: 'castle-projects-3',
    title: 'Castle of Projects III',
    section: 'project',
    projectId: 'project-03',
    style: 'sand',
    approach: ROAD_NODES.p3,
    position: place(-55.2, 54.6),
    size: 16,
  },
  {
    id: 'castle-projects-4',
    title: 'Castle of Projects IV',
    section: 'project',
    projectId: 'project-04',
    style: 'river',
    approach: ROAD_NODES.p4,
    position: place(18, 62),
  },
]

export interface SiteConfig {
  id: string
  title: string
  section: 'experience' | 'skills' | 'contact'
  position: Point
  model: string
  /** Самая длинная сторона модели, в мировых единицах. */
  size: number
}

export const SITES: SiteConfig[] = [
  {
    id: 'site-experience',
    title: 'Experience',
    section: 'experience',
    position: place(40, -46),
    model: '/models/landmarks/bell-tower.glb',
    size: 8.4,
  },
  {
    id: 'site-skills',
    title: 'Skills',
    section: 'skills',
    position: place(0, -48),
    model: '/models/landmarks/temple.glb',
    size: 9.2,
  },
  {
    id: 'site-contact',
    title: 'Contact',
    section: 'contact',
    position: place(50, 38),
    model: '/models/landmarks/market.glb',
    size: 10,
  },
]

export const LANDMARKS = [
  { kind: 'ruins' as const, ...place(18, -34) },
  { kind: 'camp' as const, ...place(-30, 16) },
  { kind: 'mill' as const, ...place(40, 56) },
  { kind: 'well' as const, ...place(14, 16) },
  { kind: 'statue' as const, ...place(-12, -4) },
  { kind: 'arch' as const, ...place(12, 30) },
]

export const PEAKS = [
  { ...place(-76, -72), radius: 20 * S, height: 13 },
  { ...place(22, -80), radius: 14 * S, height: 7 },
  { ...place(76, -64), radius: 18 * S, height: 11 },
  { ...place(78, 70), radius: 20 * S, height: 13 },
  { ...place(-78, 64), radius: 16 * S, height: 9 },
  { ...place(-82, -8), radius: 14 * S, height: 7 },
]
