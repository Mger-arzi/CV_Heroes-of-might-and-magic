import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { Box3, LoopRepeat, Vector3, type Group } from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { assetFiles } from '../config/assets.ts'

export function HorseIcon() {
  if (!assetFiles.heroModel) return <span className="portrait">♞</span>
  return (
    <span className="portrait" aria-hidden="true">
      <Canvas camera={{ position: [4.2, 2.1, 4.4], fov: 26, near: 0.1, far: 40 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={1.1} />
        <directionalLight position={[2, 3, 2]} intensity={1.6} />
        <Suspense fallback={null}>
          <Preview />
        </Suspense>
      </Canvas>
    </span>
  )
}

function Preview() {
  const gltf = useGLTF(assetFiles.heroModel)
  const horse = useMemo(() => clone(gltf.scene), [gltf.scene])
  const pivot = useRef<Group>(null)
  const camera = useThree((state) => state.camera)
  const { actions } = useAnimations(gltf.animations, horse)

  useLayoutEffect(() => {
    horse.scale.set(1, 1, 1)
    horse.position.set(0, 0, 0)
    horse.updateMatrixWorld(true)
    const box = new Box3().setFromObject(horse)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const scale = size.y > 0.05 ? 1.4 / size.y : 1
    horse.scale.setScalar(scale)
    horse.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
    camera.position.set(3.6, 1.7, 3.8)
    camera.lookAt(0, 0.7, 0)
    const idle = Object.keys(actions).find((name) => name.split('|').pop()?.toLowerCase() === 'idle')
    if (idle) actions[idle]?.reset().setLoop(LoopRepeat, Infinity).play()
  }, [actions, camera, horse])

  useFrame((_, delta) => {
    if (pivot.current) pivot.current.rotation.y += delta * 0.35
  })

  return (
    <group ref={pivot}>
      <primitive object={horse} />
    </group>
  )
}
