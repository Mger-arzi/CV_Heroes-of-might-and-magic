import { Component, Suspense, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { Box3, LoopRepeat, Matrix4, Mesh, Vector3, type Group, type Material } from 'three'
import { assetFiles } from '../../config/assets.ts'
import type { HeroAnim } from '../../types/game.ts'
import { motion } from '../motion.ts'
import { ProceduralHero } from './Hero.tsx'
import { RiderFigure } from './RiderFigure.tsx'

const TARGET_HEIGHT = 2.35
const seat = new Vector3()

const CLIP_HINTS: Record<HeroAnim, string[]> = {
  idle: ['idle'],
  walk: ['walk'],
  trot: ['walk'],
  gallop: ['gallop'],
  turn: ['idle'],
  stop: ['idle'],
}

if (assetFiles.heroModel) useGLTF.preload(assetFiles.heroModel)

export function Hero() {
  if (!assetFiles.heroModel) return <ProceduralHero />
  return (
    <Suspense fallback={<ProceduralHero />}>
      <HeroModelError fallback={<ProceduralHero />}>
        <ExternalHero />
      </HeroModelError>
    </Suspense>
  )
}

function ExternalHero() {
  const gltf = useGLTF(assetFiles.heroModel)
  const root = useRef<Group>(null)
  const rider = useRef<Group>(null)
  const { actions, mixer } = useAnimations(gltf.animations, gltf.scene)
  const current = useRef('')

  useLayoutEffect(() => {
    for (const action of Object.values(actions)) action?.stop()
  }, [actions])

  useLayoutEffect(() => {
    const scene = gltf.scene
    scene.scale.set(1, 1, 1)
    scene.position.set(0, 0, 0)
    scene.rotation.set(0, 0, 0)
    scene.parent?.updateWorldMatrix(true, false)
    scene.updateMatrixWorld(true)
    scene.traverse((obj) => {
      const mesh = obj as Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) soften(material)
    })
    const box = new Box3().setFromObject(scene)
    if (scene.parent) box.applyMatrix4(new Matrix4().copy(scene.parent.matrixWorld).invert())
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const scale = size.y > 0.05 ? TARGET_HEIGHT / size.y : 1
    scene.scale.setScalar(scale)
    scene.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
  }, [gltf.scene])

  useFrame((_, delta) => {
    const group = root.current
    if (!group) return
    const moving = motion.speed > 0.35
    const gallop = motion.anim === 'gallop' && moving
    group.position.set(motion.x, motion.y, motion.z)
    group.rotation.y = Math.PI - motion.yaw
    gltf.scene.rotation.x = 0
    if (gltf.animations.length > 0) mixer.update(delta)

    const saddle = gltf.scene.getObjectByName('Torso2')
    if (saddle && rider.current) {
      saddle.getWorldPosition(seat)
      group.worldToLocal(seat)
      rider.current.position.set(seat.x, seat.y + 0.47, seat.z + 0.02)
      rider.current.rotation.set(gallop ? 0.22 : 0.08, 0, 0)
    }

    const next = pickClip(Object.keys(actions), motion.speed < 0.3 ? 'idle' : motion.anim)
    if (next !== current.current) {
      if (current.current) actions[current.current]?.fadeOut(0.18)
      const action = next ? actions[next] : null
      action?.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.18).play()
      current.current = next ?? ''
    }
    const playing = current.current ? actions[current.current] : null
    if (playing) {
      const running = motion.anim === 'gallop' || motion.anim === 'trot' || motion.anim === 'walk'
      playing.timeScale = running ? Math.max(0.65, Math.min(1.6, motion.speed / 5.2)) : 1
    }
  })

  return (
    <group ref={root} scale={assetFiles.heroScale}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} raycast={() => null}>
        <circleGeometry args={[1.45, 28]} />
        <meshBasicMaterial color="#f0d48a" transparent opacity={0.42} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]} raycast={() => null}>
        <ringGeometry args={[1.45, 1.72, 32]} />
        <meshBasicMaterial color="#ffe7a3" transparent opacity={0.95} depthWrite={false} />
      </mesh>
      <primitive object={gltf.scene} />
      <group ref={rider}>
        <RiderFigure />
      </group>
    </group>
  )
}

function soften(material: Material) {
  if (!('metalness' in material) || !('roughness' in material)) return
  const shaded = material as Material & { metalness: number; roughness: number }
  shaded.metalness = 0.04
  shaded.roughness = 0.82
}

function pickClip(names: string[], anim: HeroAnim): string | null {
  const hints = CLIP_HINTS[anim]
  for (const hint of hints) {
    const found = names.find((name) => name.split('|').pop()?.toLowerCase() === hint)
    if (found) return found
  }
  return null
}

class HeroModelError extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    console.warn('[hero] Не удалось загрузить модель, используется встроенная.', error.message)
  }

  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}
