import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from 'three'
import { useGameStore } from '../store/gameStore.ts'
import { GameCamera } from './camera/GameCamera.tsx'
import { Hero } from './hero/HeroModel.tsx'
import { HeroController } from './hero/HeroController.tsx'
import { DayNightCycle } from './lighting/DayNightCycle.tsx'
import { World } from './world/World.tsx'

export function GameCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [40, 70, 40], fov: 32, near: 0.1, far: 700 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = true
        gl.shadowMap.type = PCFSoftShadowMap
        gl.toneMapping = ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        gl.outputColorSpace = SRGBColorSpace
        useGameStore.getState().markReady()
      }}
    >
      <Suspense fallback={null}>
        <DayNightCycle />
        <World />
        <Hero />
        <HeroController />
        <GameCamera />
      </Suspense>
    </Canvas>
  )
}
