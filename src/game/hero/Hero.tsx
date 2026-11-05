import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { mat } from '../materials.ts'
import { motion } from '../motion.ts'

const horse = mat('#6d4424', 0.8)
const horseDark = mat('#3a2a22', 0.85)
const armor = mat('#c5ccd4', 0.45, 0.35)
const cape = mat('#7d1f2d', 0.7)
const gold = mat('#d4b15a', 0.4, 0.45)
const steel = mat('#8d97a3', 0.35, 0.5)

/**
 * Временная модель всадника.
 * Свою модель можно подключить в config/assets.ts через heroModel.
 * Игровая логика от модели не зависит.
 */
export function MountedRider() {
  return (
    <group scale={2}>
      <mesh position={[0, 0.14, 0]} material={armor} castShadow>
        <boxGeometry args={[0.38, 0.14, 0.26]} />
      </mesh>
      <mesh position={[-0.18, -0.02, 0.08]} rotation={[0.7, 0.1, 0.2]} material={armor} castShadow>
        <boxGeometry args={[0.12, 0.32, 0.12]} />
      </mesh>
      <mesh position={[0.18, -0.02, 0.08]} rotation={[0.7, -0.1, -0.2]} material={armor} castShadow>
        <boxGeometry args={[0.12, 0.32, 0.12]} />
      </mesh>
      <mesh position={[0, 0.4, 0.02]} material={armor} castShadow>
        <boxGeometry args={[0.32, 0.36, 0.2]} />
      </mesh>
      <mesh position={[0, 0.68, 0.05]} material={steel} castShadow>
        <sphereGeometry args={[0.12, 8, 6]} />
      </mesh>
      <mesh position={[0, 0.8, 0.05]} material={gold}>
        <coneGeometry args={[0.055, 0.14, 5]} />
      </mesh>
      <mesh position={[0, 0.36, -0.12]} rotation={[0.35, 0, 0]} material={cape} castShadow>
        <boxGeometry args={[0.3, 0.42, 0.035]} />
      </mesh>
      <mesh position={[0.2, 0.32, 0.14]} rotation={[0.55, 0, -0.15]} material={steel} castShadow>
        <boxGeometry args={[0.035, 0.46, 0.035]} />
      </mesh>
    </group>
  )
}

export function ProceduralHero() {
  const root = useRef<Group>(null)
  const body = useRef<Group>(null)
  const head = useRef<Group>(null)
  const tail = useRef<Group>(null)
  const capeRef = useRef<Group>(null)
  const frontLeft = useRef<Group>(null)
  const frontRight = useRef<Group>(null)
  const backLeft = useRef<Group>(null)
  const backRight = useRef<Group>(null)

  useFrame((state) => {
    const rootGroup = root.current
    const bodyGroup = body.current
    if (!rootGroup || !bodyGroup) return

    rootGroup.position.set(motion.x, motion.y, motion.z)
    rootGroup.rotation.y = motion.yaw

    const gallop = motion.anim === 'gallop'
    const moving = motion.speed > 0.35
    const amp = gallop ? 0.9 : motion.anim === 'trot' ? 0.55 : moving ? 0.35 : 0.08
    const bob = Math.abs(Math.sin(motion.gait)) * (gallop ? 0.07 : moving ? 0.03 : 0.015)
    bodyGroup.position.y = bob
    bodyGroup.rotation.z = Math.sin(state.clock.elapsedTime * 1.4) * 0.03

    const swing = (ref: { current: Group | null }, offset: number) => {
      if (!ref.current) return
      ref.current.rotation.x = Math.sin(motion.gait + offset) * amp
    }
    if (gallop) {
      swing(frontLeft, 0)
      swing(frontRight, 0.7)
      swing(backLeft, 1.5)
      swing(backRight, 2.2)
    } else {
      swing(frontLeft, 0)
      swing(backRight, 0)
      swing(frontRight, Math.PI)
      swing(backLeft, Math.PI)
    }

    if (head.current) head.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.2) * 0.08
    if (tail.current) tail.current.rotation.x = -0.4 + Math.sin(state.clock.elapsedTime * 2.4) * 0.25
    if (capeRef.current) {
      capeRef.current.rotation.x = 0.15 + motion.speed * 0.03
      capeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.08
    }
  })

  return (
    <group ref={root}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} raycast={() => null}>
        <circleGeometry args={[0.95, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <group ref={body}>
        <mesh position={[0, 0.95, 0]} rotation={[0, 0, Math.PI / 2]} material={horse} castShadow>
          <capsuleGeometry args={[0.34, 0.95, 4, 8]} />
        </mesh>
        <mesh position={[0, 1.15, 0.15]} material={horseDark}>
          <boxGeometry args={[0.36, 0.12, 0.7]} />
        </mesh>
        <group position={[0, 1.15, -0.72]}>
          <mesh position={[0, 0.28, -0.15]} rotation={[0.7, 0, 0]} material={horse} castShadow>
            <capsuleGeometry args={[0.16, 0.35, 3, 6]} />
          </mesh>
          <group ref={head} position={[0, 0.55, -0.38]}>
            <mesh material={horse} castShadow>
              <boxGeometry args={[0.28, 0.26, 0.55]} />
            </mesh>
            <mesh position={[0, 0.12, -0.18]} material={horseDark}>
              <boxGeometry args={[0.12, 0.28, 0.2]} />
            </mesh>
          </group>
        </group>
        <group ref={tail} position={[0, 1.05, 0.72]}>
          <mesh position={[0, -0.15, 0.28]} material={horseDark}>
            <boxGeometry args={[0.08, 0.08, 0.55]} />
          </mesh>
        </group>
        <Leg pivot={frontLeft} x={-0.22} z={-0.42} />
        <Leg pivot={frontRight} x={0.22} z={-0.42} />
        <Leg pivot={backLeft} x={-0.22} z={0.48} />
        <Leg pivot={backRight} x={0.22} z={0.48} />
        <group position={[0, 1.35, -0.05]}>
          <mesh material={armor} castShadow>
            <boxGeometry args={[0.46, 0.48, 0.32]} />
          </mesh>
          <mesh position={[0, 0.42, 0]} material={steel} castShadow>
            <sphereGeometry args={[0.2, 8, 6]} />
          </mesh>
          <mesh position={[0, 0.52, 0]} material={gold}>
            <coneGeometry args={[0.08, 0.22, 5]} />
          </mesh>
          <group ref={capeRef} position={[0, 0.1, 0.2]}>
            <mesh material={cape}>
              <boxGeometry args={[0.5, 0.7, 0.06]} />
            </mesh>
          </group>
          <mesh position={[0.28, -0.05, 0.05]} rotation={[0.2, 0, -0.4]} material={steel}>
            <boxGeometry args={[0.06, 0.7, 0.06]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function Leg({ pivot, x, z }: { pivot: { current: Group | null }; x: number; z: number }) {
  return (
    <group ref={pivot} position={[x, 0.78, z]}>
      <mesh position={[0, -0.32, 0]} material={horse} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.62, 5]} />
      </mesh>
    </group>
  )
}
