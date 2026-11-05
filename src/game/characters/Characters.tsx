import { Component, Suspense, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { Box3, LoopRepeat, Mesh, Vector3, type AnimationClip, type Group, type Material, type SkinnedMesh } from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { LANDMARKS, ROAD_NODES } from '../../config/worldConfig.ts'
import type { Point } from '../../types/game.ts'
import { surfaceY } from '../world/height.ts'

const TARGET_HEIGHT = 1.75
const foot = new Vector3()

const soldier = offset(ROAD_NODES.west, 1.7, 1.15)
const officer = offset(mark('well'), -1.7, -1.45)
const king = offset(mark('ruins'), 2.05, 1.15)

const CHARACTERS = [
  { url: '/models/characters/soldier.glb', ...soldier, face: ROAD_NODES.west },
  { url: '/models/characters/officer.glb', ...officer, face: mark('well') },
  { url: '/models/characters/king.glb', ...king, face: mark('ruins') },
]

const WALKERS = [
  { url: '/models/characters/soldier.glb', route: [ROAD_NODES.spawn, ROAD_NODES.north, ROAD_NODES.expMid], along: 0.2 },
  { url: '/models/characters/officer.glb', route: [ROAD_NODES.east, ROAD_NODES.p2], along: 0.55 },
  { url: '/models/characters/king.glb', route: [ROAD_NODES.south, ROAD_NODES.se, ROAD_NODES.east], along: 0.35 },
  { url: '/models/characters/soldier.glb', route: [ROAD_NODES.west, ROAD_NODES.nw, ROAD_NODES.p1], along: 0.7 },
  { url: '/models/characters/officer.glb', route: [ROAD_NODES.east, ROAD_NODES.expMid, ROAD_NODES.north], along: 0.4 },
  { url: '/models/characters/king.glb', route: [ROAD_NODES.south, ROAD_NODES.p4mid, ROAD_NODES.p4], along: 0.15 },
  { url: '/models/characters/soldier.glb', route: [ROAD_NODES.bridgeA, ROAD_NODES.bridgeB, ROAD_NODES.sw], along: 0.6 },
  { url: '/models/characters/officer.glb', route: [ROAD_NODES.spawn, ROAD_NODES.east, ROAD_NODES.se], along: 0.8 },
]

for (const url of new Set([...CHARACTERS, ...WALKERS].map((item) => item.url))) useGLTF.preload(url)

export function Characters() {
  return (
    <group>
      {CHARACTERS.map((item) => (
        <Suspense key={item.url} fallback={null}>
          <CharacterError>
            <Character {...item} />
          </CharacterError>
        </Suspense>
      ))}
      {WALKERS.map((item, index) => (
        <Suspense key={`${item.url}-${index}`} fallback={null}>
          <CharacterError>
            <Walker url={item.url} route={item.route} along={item.along} />
          </CharacterError>
        </Suspense>
      ))}
    </group>
  )
}

function Character({ url, x, z, face }: { url: string; x: number; z: number; face: Point }) {
  const gltf = useGLTF(url)
  const grounded = useRef(false)
  // Клип сдвигает таз. Без этого персонаж уходит с места.
  const scene = gltf.scene as Group & { userData: { rootLocked?: boolean } }
  lockRoot(scene, gltf.animations)
  const { actions, mixer } = useAnimations(gltf.animations, gltf.scene)
  const yaw = Math.PI - Math.atan2(face.x - x, -(face.z - z))
  const ground = surfaceY(x, z)

  useLayoutEffect(() => {
    const scene = gltf.scene
    scene.scale.set(1, 1, 1)
    scene.position.set(0, 0, 0)
    scene.rotation.set(0, 0, 0)
    scene.updateMatrixWorld(true)
    scene.traverse((obj) => {
      const mesh = obj as Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) toneMaterial(material)
    })
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    if (size.y > 0.05) scene.scale.setScalar(TARGET_HEIGHT / size.y)
  }, [gltf.scene])

  useLayoutEffect(() => {
    const clip = actions.retarget ?? Object.values(actions)[0]
    clip?.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.2).play()
  }, [actions])

  useFrame((_, delta) => {
    mixer.update(delta)
    if (grounded.current) return
    let lowest = Infinity
    gltf.scene.traverse((obj) => {
      const mesh = obj as SkinnedMesh
      if (!mesh.isSkinnedMesh) return
      for (const bone of mesh.skeleton.bones) {
        if (!/toe|foot/i.test(bone.name)) continue
        bone.getWorldPosition(foot)
        lowest = Math.min(lowest, foot.y)
      }
    })
    if (!Number.isFinite(lowest)) return
    gltf.scene.position.y += ground - lowest
    grounded.current = true
  })

  return (
    <group position={[x, ground, z]} rotation={[0, yaw, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} raycast={() => null}>
        <circleGeometry args={[0.42, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <primitive object={gltf.scene} />
    </group>
  )
}

function Walker({ url, route, along }: { url: string; route: Point[]; along: number }) {
  const gltf = useGLTF(url)
  const actor = useMemo(() => clone(gltf.scene) as Group, [gltf.scene])
  const group = useRef<Group>(null)
  const grounded = useRef(false)
  const trip = useRef(startAlong(route, along))
  lockRoot(gltf.scene, gltf.animations)
  const { actions, mixer } = useAnimations(gltf.animations, actor)

  useLayoutEffect(() => {
    prepareActor(actor)
    const clip = actions.retarget ?? Object.values(actions)[0]
    clip?.reset().setLoop(LoopRepeat, Infinity).play()
  }, [actions, actor])

  useFrame((_, delta) => {
    mixer.update(delta)
    const root = group.current
    if (!root) return
    const tripState = trip.current
    if (tripState.pause > 0) {
      tripState.pause -= delta
    } else {
      const target = route[tripState.index]
      const dx = target.x - tripState.x
      const dz = target.z - tripState.z
      const distance = Math.hypot(dx, dz)
      if (distance < 0.45) {
        tripState.x = target.x
        tripState.z = target.z
        tripState.index = (tripState.index + 1) % route.length
        tripState.pause = 0.7
      } else {
        const step = Math.min(1.55 * delta, distance)
        tripState.x += (dx / distance) * step
        tripState.z += (dz / distance) * step
        root.rotation.y = Math.PI - Math.atan2(dx, -dz)
      }
    }
    const ground = surfaceY(tripState.x, tripState.z)
    root.position.set(tripState.x, ground, tripState.z)
    if (grounded.current) return
    let lowest = Infinity
    actor.traverse((obj) => {
      const mesh = obj as SkinnedMesh
      if (!mesh.isSkinnedMesh) return
      for (const bone of mesh.skeleton.bones) {
        if (!/toe|foot/i.test(bone.name)) continue
        bone.getWorldPosition(foot)
        lowest = Math.min(lowest, foot.y)
      }
    })
    if (!Number.isFinite(lowest)) return
    actor.position.y += ground - lowest
    grounded.current = true
  })

  return (
    <group ref={group}>
      <primitive object={actor} />
    </group>
  )
}

function startAlong(route: Point[], along: number) {
  const from = Math.min(route.length - 1, Math.max(0, Math.floor(along)))
  const next = (from + 1) % route.length
  const t = along - Math.floor(along)
  return {
    index: next,
    pause: 0,
    x: route[from].x + (route[next].x - route[from].x) * t,
    z: route[from].z + (route[next].z - route[from].z) * t,
  }
}

function lockRoot(scene: Group, clips: AnimationClip[]) {
  const marked = scene as Group & { userData: { rootLocked?: boolean } }
  if (marked.userData.rootLocked) return
  for (const clip of clips) {
    clip.tracks = clip.tracks.filter((track) => !track.name.startsWith('Hip.position'))
  }
  marked.userData.rootLocked = true
}

function prepareActor(scene: Group) {
  scene.scale.set(1, 1, 1)
  scene.position.set(0, 0, 0)
  scene.rotation.set(0, 0, 0)
  scene.updateMatrixWorld(true)
  scene.traverse((obj) => {
    const mesh = obj as Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = true
    mesh.receiveShadow = true
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) toneMaterial(material)
  })
  const box = new Box3().setFromObject(scene)
  const size = box.getSize(new Vector3())
  if (size.y > 0.05) scene.scale.setScalar(TARGET_HEIGHT / size.y)
}

function toneMaterial(material: Material) {
  if (!('metalness' in material)) return
  const shaded = material as Material & {
    map: unknown
    color: { set: (hex: string) => void }
    metalness: number
    roughness: number
  }
  if (!shaded.map) shaded.color.set('#7f9a45')
  shaded.metalness = shaded.map ? 0.12 : 0
  shaded.roughness = shaded.map ? Math.max(shaded.roughness, 0.62) : 0.84
}

function mark(kind: (typeof LANDMARKS)[number]['kind']): Point {
  const found = LANDMARKS.find((item) => item.kind === kind)
  if (!found) throw new Error(`Нет ориентира ${kind}`)
  return found
}

function offset(point: Point, dx: number, dz: number) {
  return { x: point.x + dx, z: point.z + dz }
}

class CharacterError extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    console.warn('[characters] Модель не загрузилась.', error.message)
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}
