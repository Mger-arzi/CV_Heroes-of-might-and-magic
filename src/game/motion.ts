import { SPAWN } from '../config/worldConfig.ts'
import type { HeroAnim, Point } from '../types/game.ts'

/**
 * Позиция героя живёт здесь, а не в React state.
 * Так камера и анимация не перерисовывают всё приложение каждый кадр.
 */
export const motion = {
  x: SPAWN.x,
  z: SPAWN.z,
  y: 0,
  yaw: 0,
  speed: 0,
  anim: 'idle' as HeroAnim,
  gait: 0,
  path: [] as Point[],
  pathIndex: 0,
  dest: null as Point | null,
  focus: null as Point | null,
  zoom: 1,
  panX: 0,
  panZ: 0,
  orbit: 0,
  panning: false,
  orbiting: false,
  suppressClick: false,
  snapCamera: false,
  intro: 0,
}

export const visual = {
  night: 0,
  mist: 0.15,
  time: { value: 0 },
}
