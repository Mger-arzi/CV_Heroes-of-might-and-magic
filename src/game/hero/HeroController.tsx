import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CASTLES, INTERACT_RADIUS } from '../../config/worldConfig.ts'
import { useGameStore } from '../../store/gameStore.ts'
import type { HeroAnim } from '../../types/game.ts'
import { audio } from '../audio/AudioManager.ts'
import { cancelRoute, closeCastle, openCastle } from '../commands.ts'
import { clamp } from '../math.ts'
import { motion } from '../motion.ts'
import { isWalkable } from '../navigation/RoadGraph.ts'
import { distanceToRiver, lakeFactor } from '../navigation/waterMath.ts'
import { surfaceY } from '../world/height.ts'

const keys = { forward: false, back: false, left: false, right: false }

export function HeroController() {
  const syncTimer = useRef(0)

  useEffect(() => {
    const down = (event: KeyboardEvent) => setKey(event, true)
    const up = (event: KeyboardEvent) => setKey(event, false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      keys.forward = false
      keys.back = false
      keys.left = false
      keys.right = false
    }
  }, [])

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05)
    const state = useGameStore.getState()
    audio.tick(step)

    if (state.phase !== 'playing' || state.openCastleId) {
      motion.speed = Math.max(0, motion.speed - 16 * step)
      motion.anim = 'idle'
      motion.y = surfaceY(motion.x, motion.z)
      audio.updateHoof(0, step)
      rememberHero(syncTimer, step)
      return
    }

    const keyboard = keys.forward || keys.back || keys.left || keys.right
    if (keyboard) cancelRoute()
    if (keys.left) motion.yaw -= 2.15 * step
    if (keys.right) motion.yaw += 2.15 * step

    if (keyboard) rideWithKeys(step)
    else if (motion.path.length > 0) followPath(step)
    else motion.speed = Math.max(0, motion.speed - 11 * step)

    motion.anim = chooseAnim(keyboard)
    motion.gait += step * (motion.speed > 0.25 ? motion.speed * 1.15 : 1.05)
    motion.y = surfaceY(motion.x, motion.z)
    updateNearby()
    audio.waterAmount = distanceToRiver(motion.x, motion.z) < 12 || lakeFactor(motion.x, motion.z) > 0 ? 1 : 0
    audio.updateHoof(motion.speed, step)
    rememberHero(syncTimer, step)
  })

  return null
}

function setKey(event: KeyboardEvent, pressed: boolean) {
  const tag = (event.target as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (event.code === 'ArrowUp' || event.code === 'KeyW') keys.forward = pressed
  if (event.code === 'ArrowDown' || event.code === 'KeyS') keys.back = pressed
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') keys.left = pressed
  if (event.code === 'ArrowRight' || event.code === 'KeyD') keys.right = pressed
  if (event.code.startsWith('Arrow') || event.code === 'Space') event.preventDefault()
  if (!pressed || event.repeat) return
  if (event.code === 'Escape') closeCastle()
  if (event.code === 'Enter') {
    const store = useGameStore.getState()
    if (store.nearbyCastleId && !store.openCastleId) openCastle(store.nearbyCastleId)
  }
}

function rideWithKeys(step: number) {
  let throttle = 0
  if (keys.forward) throttle += 1
  if (keys.back) throttle -= 1
  const desired = throttle > 0 ? 8.2 : throttle < 0 ? 3.1 : 0
  approachSpeed(desired, step)
  if (throttle !== 0) stepHero(throttle < 0 ? -1 : 1, step)
}

function followPath(step: number) {
  const path = motion.path
  let index = motion.pathIndex
  while (index < path.length - 1 && Math.hypot(path[index].x - motion.x, path[index].z - motion.z) < 0.95) {
    index += 1
  }
  motion.pathIndex = index
  const target = path[Math.min(index, path.length - 1)]
  const dx = target.x - motion.x
  const dz = target.z - motion.z
  const desiredYaw = Math.atan2(dx, -dz)
  let diff = desiredYaw - motion.yaw
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  const maxTurn = 2.6 * step
  motion.yaw += clamp(diff, -maxTurn, maxTurn)

  const distance = Math.hypot(dx, dz)
  const align = 1 - Math.min(1, Math.abs(diff) / 0.65)
  const ending = index >= path.length - 1
  const slow = ending && distance < 2.4 ? distance / 2.4 : 1
  approachSpeed(8.2 * align * slow, step)
  stepHero(1, step)

  if (ending && distance < 1.15) {
    motion.path = []
    motion.pathIndex = 0
    motion.dest = null
    motion.speed = 0
    useGameStore.getState().setRoute([], null)
    audio.play('arrive')
  }
}

function approachSpeed(desired: number, step: number) {
  const delta = desired - motion.speed
  const limit = Math.abs(delta) > 0 ? (delta > 0 ? 7 : 12) * step : 0
  motion.speed += clamp(delta, -limit, limit)
  if (motion.speed < 0.02) motion.speed = 0
}

function stepHero(sign: number, step: number) {
  const distance = motion.speed * step * sign
  const nx = motion.x + Math.sin(motion.yaw) * distance
  const nz = motion.z - Math.cos(motion.yaw) * distance
  if (isWalkable(nx, nz)) {
    motion.x = nx
    motion.z = nz
    return
  }
  if (isWalkable(nx, motion.z)) motion.x = nx
  else if (isWalkable(motion.x, nz)) motion.z = nz
  else motion.speed *= 0.55
}

function chooseAnim(keyboard: boolean): HeroAnim {
  const turning = keys.left || keys.right
  if (turning && motion.speed < 1.1) return 'turn'
  if (motion.speed < 0.3) return motion.speed > 0.05 || keyboard ? 'stop' : 'idle'
  if (motion.speed < 3.3) return 'walk'
  if (motion.speed < 6) return 'trot'
  return 'gallop'
}

function updateNearby() {
  let best: string | null = null
  let bestDistance = INTERACT_RADIUS
  for (const castle of CASTLES) {
    const distance = Math.hypot(motion.x - castle.approach.x, motion.z - castle.approach.z)
    if (distance < bestDistance) {
      bestDistance = distance
      best = castle.id
    }
  }
  useGameStore.getState().setNearbyCastle(best)
  if (best && best !== arrivedCastle) {
    arrivedCastle = best
    openCastle(best)
    return
  }
  if (!best) arrivedCastle = null
}

let arrivedCastle: string | null = null

function rememberHero(timer: { current: number }, step: number) {
  timer.current += step
  if (timer.current < 0.12) return
  timer.current = 0
  useGameStore.getState().syncHero({
    x: motion.x,
    z: motion.z,
    yaw: motion.yaw,
    speed: motion.speed,
    anim: motion.anim,
  })
}
