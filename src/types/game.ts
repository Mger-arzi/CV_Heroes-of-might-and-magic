export type GamePhase = 'loading' | 'ready' | 'intro' | 'playing'

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night'

export type TimeMode = 'auto' | 'manual'

export type HeroAnim = 'idle' | 'walk' | 'trot' | 'gallop' | 'turn' | 'stop'

export type RoadKind = 'dirt' | 'stone' | 'path' | 'bridge'

export type CastleStyle =
  | 'azure'
  | 'timber'
  | 'sand'
  | 'river'
  | 'fortress'
  | 'mage'
  | 'ivory'

export type CastleSection = 'project' | 'experience' | 'skills' | 'contact'

export interface Point {
  x: number
  z: number
}

export interface HeroSnapshot {
  x: number
  z: number
  yaw: number
  speed: number
  anim: HeroAnim
}

export interface CastleConfig {
  id: string
  title: string
  section: CastleSection
  projectId?: string
  style: CastleStyle
  approach: Point
  position: Point
  /** Ширина модели в мировых единицах. */
  size?: number
}
