import { CASTLES, SITES, SPAWN } from '../config/worldConfig.ts'
import { timeFromClock } from '../game/lighting/timeOfDay.ts'
import type { GamePhase, HeroSnapshot, Point, TimeMode, TimeOfDay } from '../types/game.ts'
import { create } from 'zustand'

interface GameStore {
  phase: GamePhase
  worldReady: boolean
  timeMode: TimeMode
  timeOfDay: TimeOfDay
  openCastleId: string | null
  nearbyCastleId: string | null
  hoveredCastleId: string | null
  hero: HeroSnapshot
  destination: Point | null
  path: Point[]
  musicOn: boolean
  sfxOn: boolean
  musicVolume: number
  sfxVolume: number
  settingsOpen: boolean
  timeOpen: boolean
  markReady: () => void
  setPhase: (phase: GamePhase) => void
  setTimeMode: (mode: TimeMode) => void
  setTimeOfDay: (time: TimeOfDay) => void
  setOpenCastle: (id: string | null) => void
  setNearbyCastle: (id: string | null) => void
  setHoveredCastle: (id: string | null) => void
  syncHero: (hero: HeroSnapshot) => void
  setRoute: (path: Point[], destination: Point | null) => void
  toggleSettings: () => void
  toggleTimePanel: () => void
  closePanels: () => void
  setMusicOn: (value: boolean) => void
  setSfxOn: (value: boolean) => void
  setMusicVolume: (value: number) => void
  setSfxVolume: (value: number) => void
}

const initialHero: HeroSnapshot = {
  x: SPAWN.x,
  z: SPAWN.z,
  yaw: 0,
  speed: 0,
  anim: 'idle',
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'loading',
  worldReady: false,
  timeMode: 'auto',
  timeOfDay: timeFromClock(),
  openCastleId: null,
  nearbyCastleId: null,
  hoveredCastleId: null,
  hero: initialHero,
  destination: null,
  path: [],
  musicOn: true,
  sfxOn: true,
  musicVolume: 0.1,
  sfxVolume: 0.4,
  settingsOpen: false,
  timeOpen: false,

  markReady: () => {
    const phase = get().phase
    set({ worldReady: true, phase: phase === 'loading' ? 'ready' : phase })
  },

  setPhase: (phase) => set({ phase }),
  setTimeMode: (timeMode) => set({ timeMode }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),

  setOpenCastle: (openCastleId) => set({ openCastleId, settingsOpen: false, timeOpen: false }),

  setNearbyCastle: (nearbyCastleId) => {
    if (get().nearbyCastleId !== nearbyCastleId) set({ nearbyCastleId })
  },

  setHoveredCastle: (hoveredCastleId) => {
    if (get().hoveredCastleId !== hoveredCastleId) set({ hoveredCastleId })
  },

  syncHero: (hero) => {
    const prev = get().hero
    const samePlace = Math.hypot(prev.x - hero.x, prev.z - hero.z) < 0.04
    const sameYaw = Math.abs(prev.yaw - hero.yaw) < 0.02
    if (samePlace && sameYaw && prev.anim === hero.anim && Math.abs(prev.speed - hero.speed) < 0.15) return
    set({ hero })
  },

  setRoute: (path, destination) => set({ path, destination }),

  toggleSettings: () => set({ settingsOpen: !get().settingsOpen, timeOpen: false }),
  toggleTimePanel: () => set({ timeOpen: !get().timeOpen, settingsOpen: false }),
  closePanels: () => set({ settingsOpen: false, timeOpen: false }),

  setMusicOn: (musicOn) => set({ musicOn }),
  setSfxOn: (sfxOn) => set({ sfxOn }),
  setMusicVolume: (musicVolume) => set({ musicVolume }),
  setSfxVolume: (sfxVolume) => set({ sfxVolume }),
}))

export function castleById(id: string | null) {
  if (!id) return undefined
  return CASTLES.find((castle) => castle.id === id) ?? SITES.find((site) => site.id === id)
}
