import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { PerspectiveCamera } from 'three'
import { Vector3 } from 'three'
import { HALF } from '../../config/worldConfig.ts'
import { useGameStore } from '../../store/gameStore.ts'
import { clamp, lerp } from '../math.ts'
import { motion } from '../motion.ts'

interface Pose {
  px: number
  py: number
  pz: number
  lx: number
  ly: number
  lz: number
}

export function GameCamera() {
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const look = useRef(new Vector3(0, 0, 0))
  const desiredPos = useRef(new Vector3())
  const desiredLook = useRef(new Vector3())

  useEffect(() => {
    const element = gl.domElement
    let lastX = 0
    let lastY = 0
    let moved = false

    const onDown = (event: PointerEvent) => {
      motion.suppressClick = false
      if (event.button === 1) {
        event.preventDefault()
        motion.orbiting = true
        moved = false
        lastX = event.clientX
        lastY = event.clientY
        return
      }
      if (event.button !== 0 && event.button !== 2) return
      motion.panning = true
      moved = false
      lastX = event.clientX
      lastY = event.clientY
    }
    const onMove = (event: PointerEvent) => {
      if (!motion.panning && !motion.orbiting) return
      const dx = event.clientX - lastX
      const dy = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY
      if (Math.hypot(dx, dy) > 3) moved = true
      const state = useGameStore.getState()
      if (state.phase !== 'playing') return
      if (motion.orbiting) {
        motion.orbit += dx * 0.008
        return
      }
      if (state.openCastleId) return
      motion.panX = clamp(motion.panX - (dx - dy) * 0.03, -8, 8)
      motion.panZ = clamp(motion.panZ - (dx + dy) * 0.03, -8, 8)
    }
    const onUp = () => {
      if (moved) motion.suppressClick = true
      motion.panning = false
      motion.orbiting = false
      moved = false
    }
    const blockWheelClick = (event: MouseEvent) => {
      if (event.button === 1) event.preventDefault()
    }
    const onWheel = (event: WheelEvent) => {
      const state = useGameStore.getState()
      if (state.phase !== 'playing' || state.openCastleId) return
      event.preventDefault()
      motion.zoom = clamp(motion.zoom + event.deltaY * 0.0009, 0.92, 1.15)
    }
    const onMenu = (event: Event) => event.preventDefault()

    element.addEventListener('pointerdown', onDown)
    element.addEventListener('mousedown', blockWheelClick)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    element.addEventListener('wheel', onWheel, { passive: false })
    element.addEventListener('contextmenu', onMenu)
    return () => {
      element.removeEventListener('pointerdown', onDown)
      element.removeEventListener('mousedown', blockWheelClick)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      element.removeEventListener('wheel', onWheel)
      element.removeEventListener('contextmenu', onMenu)
    }
  }, [gl])

  useFrame((_, delta) => {
    const state = useGameStore.getState()
    const pose = cameraPose(state.phase, state.openCastleId !== null)
    desiredPos.current.set(pose.px, pose.py, pose.pz)
    desiredLook.current.set(pose.lx, pose.ly, pose.lz)
    const view = camera as PerspectiveCamera

    if (motion.snapCamera || state.phase === 'loading' || state.phase === 'ready') {
      view.position.copy(desiredPos.current)
      look.current.copy(desiredLook.current)
      motion.snapCamera = false
    } else {
      const blend = 1 - Math.exp(-3.1 * delta)
      view.position.lerp(desiredPos.current, blend)
      look.current.lerp(desiredLook.current, blend)
    }
    view.lookAt(look.current)

    if (!motion.panning && !motion.focus) {
      const back = 1 - Math.exp(-4 * delta)
      motion.panX = lerp(motion.panX, 0, back)
      motion.panZ = lerp(motion.panZ, 0, back)
    }

    if (state.phase === 'intro') {
      motion.intro += delta / 7.2
      if (motion.intro >= 1) state.setPhase('playing')
    }
  })

  return null
}

function followPose(x: number, z: number, zoom: number, wide = true): Pose {
  const dist = (wide ? 98 : 28) * zoom
  const lookX = wide ? x * 0.22 - 3 : x
  const lookZ = wide ? z * 0.22 + 1 : z
  const spin = Math.PI / 4 + motion.orbit
  const radius = dist * 1.02
  return {
    px: lookX + Math.sin(spin) * radius,
    py: dist * 1.05,
    pz: lookZ + Math.cos(spin) * radius,
    lx: lookX,
    ly: 0,
    lz: lookZ,
  }
}

function mixPose(a: Pose, b: Pose, t: number): Pose {
  const k = t * t * (3 - 2 * t)
  return {
    px: lerp(a.px, b.px, k),
    py: lerp(a.py, b.py, k),
    pz: lerp(a.pz, b.pz, k),
    lx: lerp(a.lx, b.lx, k),
    ly: lerp(a.ly, b.ly, k),
    lz: lerp(a.lz, b.lz, k),
  }
}

function cameraPose(phase: string, modal: boolean): Pose {
  if (phase === 'loading' || phase === 'ready') {
    return { px: 6, py: 78, pz: 10, lx: 0, ly: 0, lz: 0 }
  }
  if (phase === 'intro') return introPose(Math.min(motion.intro, 1))

  const focus = modal ? motion.focus : null
  const edge = HALF - 8
  const x = clamp((focus?.x ?? motion.x) + (focus ? 0 : motion.panX), -edge, edge)
  const z = clamp((focus?.z ?? motion.z) + (focus ? 0 : motion.panZ), -edge, edge)
  return followPose(x, z, focus ? motion.zoom * 0.9 : motion.zoom, !focus)
}

function introPose(t: number): Pose {
  const hero = followPose(motion.x, motion.z, 1)
  const keys: { t: number; pose: Pose }[] = [
    { t: 0, pose: { px: 6, py: 78, pz: 10, lx: 0, ly: 0, lz: 0 } },
    { t: 0.4, pose: { px: -16, py: 46, pz: -6, lx: -12, ly: 1, lz: -14 } },
    { t: 0.72, pose: { px: 14, py: 40, pz: 12, lx: 10, ly: 1, lz: 8 } },
    { t: 1, pose: hero },
  ]
  let index = 0
  while (index < keys.length - 2 && t > keys[index + 1].t) index += 1
  const from = keys[index]
  const to = keys[index + 1]
  return mixPose(from.pose, to.pose, (t - from.t) / (to.t - from.t))
}
