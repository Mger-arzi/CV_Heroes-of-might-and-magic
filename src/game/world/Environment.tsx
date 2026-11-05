import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CylinderGeometry, type Group, type Mesh } from 'three'
import { LANDMARKS } from '../../config/worldConfig.ts'
import { lanternMaterial, mat } from '../materials.ts'
import { isWater } from '../navigation/waterMath.ts'
import { POLY_EDGES } from '../navigation/RoadGraph.ts'
import { surfaceY } from './height.ts'
import { Instances } from './Instances.tsx'

const stone = mat('#7d7872')
const dark = mat('#4c463f')
const wood = mat('#6a4630')
const cloth = mat('#7d2430', 0.7)

export function Environment() {
  const lanterns = useMemo(() => {
    const items: { x: number; y: number; z: number; rot: number; scale: number }[] = []
    for (const edge of POLY_EDGES) {
      if (edge.kind === 'path' || edge.kind === 'bridge') continue
      for (let i = 4; i < edge.points.length - 1; i += 8) {
        const point = edge.points[i]
        const prev = edge.points[i - 1]
        const dx = point.x - prev.x
        const dz = point.z - prev.z
        const len = Math.hypot(dx, dz) || 1
        const x = point.x + (dz / len) * 2.3
        const z = point.z - (dx / len) * 2.3
        if (isWater(x, z)) continue
        items.push({ x, y: surfaceY(x, z), z, rot: 0, scale: 1 })
      }
    }
    return items
  }, [])

  const bulb = useMemo(() => {
    const geometry = new CylinderGeometry(0.12, 0.16, 0.22, 5)
    geometry.translate(0, 1.55, 0)
    return geometry
  }, [])
  const pole = useMemo(() => {
    const geometry = new CylinderGeometry(0.06, 0.08, 1.4, 5)
    geometry.translate(0, 0.7, 0)
    return geometry
  }, [])

  return (
    <group>
      <Instances items={lanterns}>
        <primitive object={pole} attach="geometry" />
        <primitive object={dark} attach="material" />
      </Instances>
      <Instances items={lanterns}>
        <primitive object={bulb} attach="geometry" />
        <primitive object={lanternMaterial} attach="material" />
      </Instances>
      {LANDMARKS.map((item) => (
        <Landmark key={`${item.kind}-${item.x}`} kind={item.kind} x={item.x} z={item.z} />
      ))}
    </group>
  )
}

function Landmark({ kind, x, z }: { kind: (typeof LANDMARKS)[number]['kind']; x: number; z: number }) {
  const y = surfaceY(x, z)
  if (kind === 'ruins') return <Ruins x={x} y={y} z={z} />
  if (kind === 'camp') return <Camp x={x} y={y} z={z} />
  if (kind === 'mill') return <Mill x={x} y={y} z={z} />
  if (kind === 'well') return <Well x={x} y={y} z={z} />
  if (kind === 'statue') return <Statue x={x} y={y} z={z} />
  return <Arch x={x} y={y} z={z} />
}

function Ruins({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 1.1, 0]} material={stone} castShadow>
        <cylinderGeometry args={[1.1, 1.25, 2.2, 7]} />
      </mesh>
      <mesh position={[0.8, 0.45, 0.4]} rotation={[0, 0.4, 0.4]} material={stone} castShadow>
        <boxGeometry args={[1.4, 0.35, 0.4]} />
      </mesh>
    </group>
  )
}

function Camp({ x, y, z }: { x: number; y: number; z: number }) {
  const fire = useRef<Mesh>(null)
  const smoke = useRef<Mesh>(null)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (fire.current) fire.current.scale.y = 0.8 + Math.sin(t * 10) * 0.25
    if (smoke.current) {
      const puff = (t * 0.18) % 1
      smoke.current.position.y = 1.2 + puff * 1.8
      smoke.current.scale.setScalar(0.25 + puff)
      const material = smoke.current.material
      if ('opacity' in material) material.opacity = (1 - puff) * 0.28
    }
  })
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.15, 0]} material={dark}>
        <cylinderGeometry args={[0.7, 0.8, 0.2, 8]} />
      </mesh>
      <mesh ref={fire} position={[0, 0.45, 0]} material={mat('#ff7a2a', 0.4)}>
        <coneGeometry args={[0.28, 0.7, 6]} />
      </mesh>
      <mesh ref={smoke} position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.35, 6, 5]} />
        <meshStandardMaterial color="#d9d4cc" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <mesh position={[1.1, 0.35, 0.4]} material={wood} castShadow>
        <boxGeometry args={[0.8, 0.25, 0.25]} />
      </mesh>
      <Flag x={-0.9} />
    </group>
  )
}

function Mill({ x, y, z }: { x: number; y: number; z: number }) {
  const blades = useRef<Group>(null)
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z += dt * 0.45
  })
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 1.5, 0]} material={stone} castShadow>
        <cylinderGeometry args={[1.15, 1.3, 3, 8]} />
      </mesh>
      <mesh position={[0, 3.35, 0]} material={mat('#6d2e2a', 0.75)} castShadow>
        <coneGeometry args={[1.7, 1.3, 8]} />
      </mesh>
      <group ref={blades} position={[0, 2.2, 1.35]}>
        <mesh material={wood}>
          <boxGeometry args={[3.4, 0.16, 0.08]} />
        </mesh>
        <mesh material={wood}>
          <boxGeometry args={[0.16, 3.4, 0.08]} />
        </mesh>
      </group>
    </group>
  )
}

function Well({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.45, 0]} material={stone} castShadow>
        <cylinderGeometry args={[0.7, 0.8, 0.9, 8]} />
      </mesh>
      <mesh position={[0, 1.15, 0]} material={wood}>
        <boxGeometry args={[0.12, 0.9, 0.12]} />
      </mesh>
      <mesh position={[0.55, 1.15, 0]} material={wood}>
        <boxGeometry args={[0.12, 0.9, 0.12]} />
      </mesh>
      <mesh position={[0.28, 1.6, 0]} material={dark}>
        <boxGeometry args={[0.9, 0.1, 0.12]} />
      </mesh>
    </group>
  )
}

function Statue({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.25, 0]} material={stone} castShadow>
        <boxGeometry args={[0.9, 0.4, 0.9]} />
      </mesh>
      <mesh position={[0, 1.15, 0]} material={stone} castShadow>
        <capsuleGeometry args={[0.28, 0.7, 3, 6]} />
      </mesh>
    </group>
  )
}

function Arch({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[-0.8, 1.1, 0]} material={stone} castShadow>
        <boxGeometry args={[0.35, 2.2, 0.35]} />
      </mesh>
      <mesh position={[0.8, 1.1, 0]} material={stone} castShadow>
        <boxGeometry args={[0.35, 2.2, 0.35]} />
      </mesh>
      <mesh position={[0, 2.25, 0]} material={stone} castShadow>
        <boxGeometry args={[2, 0.35, 0.4]} />
      </mesh>
    </group>
  )
}

function Flag({ x }: { x: number }) {
  const clothRef = useRef<Mesh>(null)
  useFrame((state) => {
    if (clothRef.current) clothRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2 + x) * 0.35
  })
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 1.2, 0]} material={dark}>
        <cylinderGeometry args={[0.04, 0.04, 2.2, 4]} />
      </mesh>
      <mesh ref={clothRef} position={[0.35, 1.9, 0]} material={cloth}>
        <planeGeometry args={[0.7, 0.45]} />
      </mesh>
    </group>
  )
}
