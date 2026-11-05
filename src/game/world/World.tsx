import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { useGameStore } from '../../store/gameStore.ts'
import { Castles } from '../castles/Castle.tsx'
import { Sites } from '../sites/Sites.tsx'
import { Characters } from '../characters/Characters.tsx'
import { Environment } from './Environment.tsx'
import { Forests } from './Forests.tsx'
import { surfaceY } from './height.ts'
import { Mountains } from './Mountains.tsx'
import { Roads } from './Roads.tsx'
import { Terrain } from './Terrain.tsx'
import { Water } from './Water.tsx'

export function World() {
  return (
    <group>
      <Terrain />
      <Water />
      <Roads />
      <Forests />
      <Mountains />
      <Environment />
      <Characters />
      <Castles />
      <Sites />
      <RouteLine />
      <DestinationMarker />
    </group>
  )
}

function RouteLine() {
  const path = useGameStore((state) => state.path)
  const points = useMemo(
    () => path.map((point) => [point.x, surfaceY(point.x, point.z) + 0.22, point.z] as [number, number, number]),
    [path],
  )
  if (points.length < 2) return null
  return <Line points={points} color="#e6c56a" lineWidth={2} transparent opacity={0.8} />
}

function DestinationMarker() {
  const dest = useGameStore((state) => state.destination)
  if (!dest) return null
  const y = surfaceY(dest.x, dest.z)
  return (
    <group position={[dest.x, y + 1.1, dest.z]}>
      <mesh raycast={() => null}>
        <coneGeometry args={[0.28, 0.7, 5]} />
        <meshStandardMaterial color="#e6c56a" emissive="#a07820" emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}
