import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, ShaderMaterial, type Mesh } from 'three'
import { useRef } from 'react'
import { LAKES, RIVER } from '../../config/worldConfig.ts'
import { commandMoveTo } from '../commands.ts'
import { mat, waterUniforms } from '../materials.ts'
import { motion } from '../motion.ts'
import { CircleGeometry } from 'three'
import { getNature } from './scatter.ts'
import { Instances } from './Instances.tsx'
import { buildRibbon } from './ribbon.ts'

const vertexShader = `
  uniform float uTime;
  void main() {
    vec3 pos = position;
    pos.y += sin(position.x * 0.45 + uTime * 1.3) * 0.07;
    pos.y += cos(position.z * 0.35 + uTime) * 0.05;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  uniform vec3 uShallow;
  uniform vec3 uDeep;
  void main() {
    vec3 color = mix(uShallow, uDeep, 0.62);
    gl_FragColor = vec4(color, 0.9);
  }
`

export function Water() {
  const river = useMemo(() => buildRibbon([RIVER], 2.7, () => -0.32), [])
  const lakes = useMemo(
    () =>
      LAKES.map((lake) => {
        const geometry = new CircleGeometry(1, 28)
        geometry.rotateX(-Math.PI / 2)
        geometry.scale(lake.rx, 1, lake.rz)
        return { key: `${lake.x}-${lake.z}`, geometry, x: lake.x, z: lake.z }
      }),
    [],
  )
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: waterUniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    [],
  )

  useEffect(
    () => () => {
      river.dispose()
      material.dispose()
      lakes.forEach((lake) => lake.geometry.dispose())
    },
    [river, material, lakes],
  )

  return (
    <group>
      <mesh geometry={river} material={material} onClick={onWaterClick} />
      {lakes.map((lake) => (
        <mesh key={lake.key} geometry={lake.geometry} material={material} position={[lake.x, -0.5, lake.z]} onClick={onWaterClick} />
      ))}
      <Instances items={getNature().reeds}>
        <coneGeometry args={[0.12, 1.1, 4]} />
        <meshStandardMaterial color="#6a8f4e" roughness={0.9} />
      </Instances>
      <Waterfall />
    </group>
  )
}

function onWaterClick(event: { stopPropagation: () => void; point: { x: number; z: number } }) {
  event.stopPropagation()
  if (motion.suppressClick) {
    motion.suppressClick = false
    return
  }
  commandMoveTo(event.point.x, event.point.z)
}

function Waterfall() {
  const ref = useRef<Mesh>(null)
  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    mesh.position.y = 1.35 + Math.sin(state.clock.elapsedTime * 5) * 0.04
  })

  return (
    <mesh ref={ref} position={[LAKES[0].x, 1.35, LAKES[0].z]} material={mat('#4f8ed8', 0.25, 0.05)}>
      <planeGeometry args={[1.5, 3]} />
    </mesh>
  )
}
