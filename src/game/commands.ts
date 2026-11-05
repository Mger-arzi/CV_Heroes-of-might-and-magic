import { CASTLES, SPAWN } from '../config/worldConfig.ts'
import { audio } from '../game/audio/AudioManager.ts'
import { motion } from '../game/motion.ts'
import { findRoute } from '../game/navigation/Pathfinding.ts'
import { nearestRoadPoint } from '../game/navigation/RoadGraph.ts'
import { castleById, useGameStore } from '../store/gameStore.ts'
import type { Point } from '../types/game.ts'

function publishPath(path: Point[], destination: Point | null) {
  motion.path = path
  motion.pathIndex = 0
  motion.dest = destination
  useGameStore.getState().setRoute(path, destination)
}

export function cancelRoute() {
  if (motion.path.length === 0 && !motion.dest) return
  publishPath([], null)
}

export function commandMoveTo(x: number, z: number) {
  const state = useGameStore.getState()
  if (state.phase !== 'playing' || state.openCastleId) return

  let goal: Point = { x, z }
  let nearCastle = false
  for (const castle of CASTLES) {
    const toApproach = Math.hypot(x - castle.approach.x, z - castle.approach.z)
    const toKeep = Math.hypot(x - castle.position.x, z - castle.position.z)
    if (toApproach < 8 || toKeep < 8) {
      goal = castle.approach
      nearCastle = true
      break
    }
  }

  const snapped = nearestRoadPoint(goal.x, goal.z)
  if (!snapped || (!nearCastle && snapped.dist > 6)) {
    audio.play('deny')
    return
  }

  const path = findRoute({ x: motion.x, z: motion.z }, { x: snapped.x, z: snapped.z })
  if (path.length < 1) {
    audio.play('deny')
    return
  }
  publishPath(path, { x: snapped.x, z: snapped.z })
  audio.play('route')
}

export function returnHome() {
  const state = useGameStore.getState()
  if (state.openCastleId) return
  const path = findRoute({ x: motion.x, z: motion.z }, SPAWN)
  if (path.length < 1) {
    motion.x = SPAWN.x
    motion.z = SPAWN.z
    motion.speed = 0
    motion.snapCamera = true
    publishPath([], null)
    return
  }
  publishPath(path, SPAWN)
  audio.play('route')
}

export function openCastle(id: string) {
  const castle = castleById(id)
  const state = useGameStore.getState()
  if (!castle || state.phase !== 'playing' || state.openCastleId) return
  cancelRoute()
  motion.speed = 0
  motion.focus = { x: castle.position.x, z: castle.position.z }
  state.setOpenCastle(id)
  audio.play('open')
}

export function closeCastle() {
  if (!useGameStore.getState().openCastleId) return
  motion.focus = null
  useGameStore.getState().setOpenCastle(null)
  audio.play('close')
}
