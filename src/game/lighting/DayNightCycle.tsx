import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Fog, type DirectionalLight, type HemisphereLight, type Scene } from 'three'
import { useThree } from '@react-three/fiber'
import type { TimeOfDay } from '../../types/game.ts'
import { syncGlow, waterUniforms } from '../materials.ts'
import { motion, visual } from '../motion.ts'
import { useGameStore } from '../../store/gameStore.ts'

interface SkyPreset {
  sun: string
  ambient: string
  fog: string
  sky: string
  ground: string
  intensity: number
  ambientIntensity: number
  offset: [number, number, number]
  near: number
  far: number
  night: number
  mist: number
  shallow: string
  deep: string
}

const PRESETS: Record<TimeOfDay, SkyPreset> = {
  morning: {
    sun: '#ffe0b0',
    ambient: '#c9d6e6',
    fog: '#d7e4dc',
    sky: '#d5e6f4',
    ground: '#6d8a52',
    intensity: 1.05,
    ambientIntensity: 0.46,
    offset: [34, 22, 10],
    near: 150,
    far: 320,
    night: 0.18,
    mist: 0.34,
    shallow: '#5aa6e6',
    deep: '#1d5cad',
  },
  day: {
    sun: '#fff4dc',
    ambient: '#e7f0ff',
    fog: '#c5dff0',
    sky: '#e8f3ff',
    ground: '#6b9048',
    intensity: 1.32,
    ambientIntensity: 0.55,
    offset: [16, 46, 12],
    near: 170,
    far: 340,
    night: 0,
    mist: 0.04,
    shallow: '#3d86e0',
    deep: '#164a9c',
  },
  evening: {
    sun: '#ffb15e',
    ambient: '#f0c4a4',
    fog: '#e8b48a',
    sky: '#ffc7a0',
    ground: '#6a5438',
    intensity: 0.95,
    ambientIntensity: 0.38,
    offset: [-26, 16, 10],
    near: 140,
    far: 300,
    night: 0.38,
    mist: 0.12,
    shallow: '#6f94d4',
    deep: '#243e86',
  },
  night: {
    sun: '#8aa4ff',
    ambient: '#1b2740',
    fog: '#10192a',
    sky: '#243456',
    ground: '#1a2218',
    intensity: 0.28,
    ambientIntensity: 0.22,
    offset: [-14, 34, -10],
    near: 120,
    far: 280,
    night: 1,
    mist: 0.2,
    shallow: '#2f6cb0',
    deep: '#102048',
  },
}

export function DayNightCycle() {
  const sun = useRef<DirectionalLight>(null)
  const hemi = useRef<HemisphereLight>(null)
  const scene = useThree((state) => state.scene)
  const colors = useRef({
    sun: new Color(PRESETS.day.sun),
    ambient: new Color(PRESETS.day.ambient),
    fog: new Color(PRESETS.day.fog),
    sky: new Color(PRESETS.day.sky),
    ground: new Color(PRESETS.day.ground),
    shallow: new Color(PRESETS.day.shallow),
    deep: new Color(PRESETS.day.deep),
  })
  const scratch = useRef(new Color())
  const strength = useRef({ intensity: 1.2, ambient: 0.5, near: 50, far: 180, night: 0, mist: 0 })

  useFrame((_, delta) => {
    const light = sun.current
    const sky = hemi.current
    if (!light || !sky) return
    const preset = PRESETS[useGameStore.getState().timeOfDay]
    const blend = 1 - Math.exp(-1.4 * delta)
    const bag = colors.current
    const next = scratch.current
    bag.sun.lerp(next.set(preset.sun), blend)
    bag.ambient.lerp(next.set(preset.ambient), blend)
    bag.fog.lerp(next.set(preset.fog), blend)
    bag.sky.lerp(next.set(preset.sky), blend)
    bag.ground.lerp(next.set(preset.ground), blend)
    bag.shallow.lerp(next.set(preset.shallow), blend)
    bag.deep.lerp(next.set(preset.deep), blend)
    if (light.target.parent !== scene) scene.add(light.target)
    strength.current.intensity = lerpNum(strength.current.intensity, preset.intensity, blend)
    strength.current.ambient = lerpNum(strength.current.ambient, preset.ambientIntensity, blend)
    strength.current.near = lerpNum(strength.current.near, preset.near, blend)
    strength.current.far = lerpNum(strength.current.far, preset.far, blend)
    strength.current.night = lerpNum(strength.current.night, preset.night, blend)
    strength.current.mist = lerpNum(strength.current.mist, preset.mist, blend)

    light.color.copy(bag.sun)
    light.intensity = strength.current.intensity
    light.position.set(motion.x + preset.offset[0], preset.offset[1], motion.z + preset.offset[2])
    light.target.position.set(motion.x, 0, motion.z)
    light.target.updateMatrixWorld()
    sky.color.copy(bag.sky)
    sky.groundColor.copy(bag.ground)
    sky.intensity = strength.current.ambient

    const fog = scene.fog as Fog
    fog.color.copy(bag.fog)
    fog.near = strength.current.near
    fog.far = strength.current.far
    paintBackground(scene, bag.fog)
    waterUniforms.uShallow.value.copy(bag.shallow)
    waterUniforms.uDeep.value.copy(bag.deep)
    visual.night = strength.current.night
    visual.mist = strength.current.mist
    visual.time.value += delta
    syncGlow(visual.night)
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={['#e8f3ff', '#6b9048', 0.55]} />
      <ambientLight color="#e7f0ff" intensity={0.25} />
      <directionalLight
        ref={sun}
        castShadow
        intensity={1.3}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
        shadow-bias={-0.0006}
        shadow-normalBias={0.04}
      />
      <fog attach="fog" args={['#c5dff0', 170, 340]} />
      <Mist />
    </>
  )
}

function paintBackground(scene: Scene, color: Color) {
  if (!scene.background || !(scene.background instanceof Color)) scene.background = color.clone()
  else scene.background.copy(color)
}

function lerpNum(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function Mist() {
  const ref = useRef<import('three').Mesh>(null)
  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    mesh.position.set(motion.x, 1.2, motion.z)
    const material = mesh.material
    if ('opacity' in material) material.opacity = visual.mist * 0.35
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.2, 0]}>
      <circleGeometry args={[16, 24]} />
      <meshBasicMaterial color="#e7eee4" transparent opacity={0.08} depthWrite={false} />
    </mesh>
  )
}
