import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { crystalMaterial, mat, windowMaterial } from '../materials.ts'

export function Tower({
  position,
  height,
  radius,
  stone,
  roof,
  sides = 8,
}: {
  position: [number, number, number]
  height: number
  radius: number
  stone: string
  roof: string
  sides?: number
}) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} material={mat(stone)} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 1.08, height, sides]} />
      </mesh>
      <mesh position={[0, height + 0.8, 0]} material={mat(roof, 0.72)} castShadow>
        <coneGeometry args={[radius * 1.4, 1.7, sides]} />
      </mesh>
      <mesh position={[0, height * 0.62, radius * 0.92]} material={windowMaterial}>
        <boxGeometry args={[0.28, 0.42, 0.06]} />
      </mesh>
    </group>
  )
}

export function Keep({
  position,
  height,
  radius,
  stone,
  roof,
  sides = 8,
}: {
  position: [number, number, number]
  height: number
  radius: number
  stone: string
  roof: string
  sides?: number
}) {
  return <Tower position={position} height={height} radius={radius} stone={stone} roof={roof} sides={sides} />
}

export function Wall({
  position,
  size,
  stone,
}: {
  position: [number, number, number]
  size: [number, number, number]
  stone: string
}) {
  return (
    <mesh position={position} material={mat(stone)} castShadow receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  )
}

export function Gate({
  position,
  width,
  height,
  stone,
}: {
  position: [number, number, number]
  width: number
  height: number
  stone: string
}) {
  const material = mat(stone)
  return (
    <group position={position}>
      <mesh position={[-width / 2, height / 2, 0]} material={material} castShadow>
        <boxGeometry args={[0.45, height, 0.7]} />
      </mesh>
      <mesh position={[width / 2, height / 2, 0]} material={material} castShadow>
        <boxGeometry args={[0.45, height, 0.7]} />
      </mesh>
      <mesh position={[0, height, 0]} material={material} castShadow>
        <boxGeometry args={[width + 0.45, 0.4, 0.75]} />
      </mesh>
    </group>
  )
}

export function Banner({
  position,
  color,
  seed,
}: {
  position: [number, number, number]
  color: string
  seed: number
}) {
  const cloth = useRef<Mesh>(null)
  useFrame((state) => {
    if (!cloth.current) return
    cloth.current.rotation.y = Math.sin(state.clock.elapsedTime * 2.1 + seed) * 0.4
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} material={mat('#3c3834')}>
        <cylinderGeometry args={[0.04, 0.04, 1.6, 4]} />
      </mesh>
      <mesh ref={cloth} position={[0.38, 1.15, 0]} material={mat(color, 0.65)}>
        <planeGeometry args={[0.7, 1]} />
      </mesh>
    </group>
  )
}

export function Crystal({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.4
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.4 + position[0]) * 0.12
  })
  return (
    <mesh ref={ref} position={position} scale={scale} material={crystalMaterial}>
      <octahedronGeometry args={[0.45, 0]} />
    </mesh>
  )
}
