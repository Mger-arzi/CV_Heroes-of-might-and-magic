import { useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { MeshBasicMaterial, type Mesh } from 'three'
import { CASTLES, INTERACT_RADIUS } from '../../config/worldConfig.ts'
import type { CastleConfig } from '../../types/game.ts'
import { commandMoveTo, openCastle } from '../commands.ts'
import { motion } from '../motion.ts'
import { useGameStore } from '../../store/gameStore.ts'
import { surfaceY } from '../world/height.ts'
import { GlbCastle } from './GlbCastle.tsx'

const BASE_WIDTH = 11
const LABEL_Y = 8.2

export function Castles() {
  return (
    <group>
      {CASTLES.map((castle) => (
        <Castle key={castle.id} castle={castle} />
      ))}
    </group>
  )
}

function Castle({ castle }: { castle: CastleConfig }) {
  const [showLabel, setShowLabel] = useState(false)
  const [near, setNear] = useState(false)
  const hover = useRef(false)
  const ring = useRef<Mesh>(null)
  const gl = useThree((state) => state.gl)
  const ringMaterial = useMemo(
    () => new MeshBasicMaterial({ color: '#f0d48a', transparent: true, opacity: 0, depthWrite: false }),
    [],
  )
  const yaw = Math.atan2(castle.approach.x - castle.position.x, castle.approach.z - castle.position.z)
  const y = surfaceY(castle.position.x, castle.position.z)
  const fit = (castle.size ?? BASE_WIDTH) / BASE_WIDTH

  useFrame((state) => {
    const distance = Math.hypot(motion.x - castle.approach.x, motion.z - castle.approach.z)
    const isNear = distance <= INTERACT_RADIUS
    const visible = isNear || hover.current
    if (isNear !== near) setNear(isNear)
    if (visible !== showLabel) setShowLabel(visible)
    if (ring.current) {
      ring.current.material = ringMaterial
      ringMaterial.opacity = visible ? 0.55 + Math.sin(state.clock.elapsedTime * 3) * 0.2 : 0
    }
  })

  return (
    <group>
      <group
        position={[castle.position.x, y, castle.position.z]}
        rotation={[0, yaw, 0]}
        onClick={(event) => {
          event.stopPropagation()
          const state = useGameStore.getState()
          if (state.phase !== 'playing' || state.openCastleId) return
          const distance = Math.hypot(motion.x - castle.approach.x, motion.z - castle.approach.z)
          if (distance <= INTERACT_RADIUS) openCastle(castle.id)
          else commandMoveTo(castle.approach.x, castle.approach.z)
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          hover.current = true
          gl.domElement.style.cursor = 'pointer'
          useGameStore.getState().setHoveredCastle(castle.id)
        }}
        onPointerOut={() => {
          hover.current = false
          gl.domElement.style.cursor = 'auto'
          if (useGameStore.getState().hoveredCastleId === castle.id) {
            useGameStore.getState().setHoveredCastle(null)
          }
        }}
      >
        <GlbCastle style={castle.style} width={castle.size} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} raycast={() => null}>
          <circleGeometry args={[6.6 * fit, 32]} />
          <meshBasicMaterial color="#6d7278" transparent opacity={0.5} depthWrite={false} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]} raycast={() => null}>
          <ringGeometry args={[6.6 * fit, 7.6 * fit, 40]} />
          <meshBasicMaterial color="#aeb4ba" transparent opacity={0.95} depthWrite={false} />
        </mesh>
        <mesh position={[0, 5.5 * fit, 0]}>
          <cylinderGeometry args={[5.4 * fit, 5.4 * fit, 12 * fit, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {showLabel && (
          <Html position={[0, LABEL_Y * fit, 0]} center distanceFactor={30} style={{ pointerEvents: 'none' }}>
            <div className="castle-label">
              <strong>{castle.title}</strong>
              {near && <span>The gates are open</span>}
            </div>
          </Html>
        )}
      </group>
      <mesh
        ref={ring}
        position={[castle.approach.x, surfaceY(castle.approach.x, castle.approach.z) + 0.08, castle.approach.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={ringMaterial}
        raycast={() => null}
      >
        <ringGeometry args={[1.7, 2.15, 28]} />
      </mesh>
    </group>
  )
}
