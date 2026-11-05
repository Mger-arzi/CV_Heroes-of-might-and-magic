import { Suspense, useLayoutEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import { Box3, Matrix4, Mesh, Vector3, type Material } from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { SITES, type SiteConfig } from '../../config/worldConfig.ts'
import { openCastle } from '../commands.ts'
import { useGameStore } from '../../store/gameStore.ts'
import { surfaceY } from '../world/height.ts'

for (const site of SITES) useGLTF.preload(site.model)

export function Sites() {
  return (
    <group>
      {SITES.map((site) => (
        <Suspense key={site.id} fallback={null}>
          <Site site={site} />
        </Suspense>
      ))}
    </group>
  )
}

function Site({ site }: { site: SiteConfig }) {
  const y = surfaceY(site.position.x, site.position.z)
  const yaw = Math.atan2(-site.position.x, -site.position.z)
  const [hover, setHover] = useState(false)
  const gl = useThree((state) => state.gl)

  const open = () => {
    const state = useGameStore.getState()
    if (state.phase !== 'playing' || state.openCastleId) return
    openCastle(site.id)
  }

  return (
    <group
      position={[site.position.x, y, site.position.z]}
      rotation={[0, yaw, 0]}
      onClick={(event) => {
        event.stopPropagation()
        open()
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHover(true)
        gl.domElement.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHover(false)
        gl.domElement.style.cursor = 'auto'
      }}
    >
      <SiteModel url={site.model} size={site.size} />
      <mesh position={[0, site.size * 0.45, 0]}>
        <cylinderGeometry args={[site.size * 0.42, site.size * 0.48, site.size, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} raycast={() => null}>
        <ringGeometry args={[site.size * 0.46, site.size * 0.54, 40]} />
        <meshBasicMaterial color={hover ? '#fff1c2' : '#f0d48a'} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <Html position={[0, site.size + 0.7, 0]} center distanceFactor={28} style={{ pointerEvents: 'none' }}>
        <div className="castle-label">
          <strong>{site.title}</strong>
          {hover && <span>Click to open</span>}
        </div>
      </Html>
    </group>
  )
}

function SiteModel({ url, size }: { url: string; size: number }) {
  const gltf = useGLTF(url)
  const model = useMemo(() => clone(gltf.scene), [gltf.scene])

  useLayoutEffect(() => {
    model.scale.set(1, 1, 1)
    model.position.set(0, 0, 0)
    model.rotation.set(0, 0, 0)
    model.parent?.updateWorldMatrix(true, false)
    model.updateMatrixWorld(true)
    model.traverse((obj) => {
      const mesh = obj as Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) soften(material)
    })
    const box = new Box3().setFromObject(model)
    if (model.parent) box.applyMatrix4(new Matrix4().copy(model.parent.matrixWorld).invert())
    const bounds = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const scale = size / Math.max(bounds.x, bounds.y, bounds.z, 0.01)
    model.scale.setScalar(scale)
    model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
  }, [model, size])

  return <primitive object={model} />
}

function soften(material: Material) {
  if ('side' in material) (material as Material & { side: number }).side = 2
  if (!('metalness' in material) || !('roughness' in material)) return
  const shaded = material as Material & { metalness: number; roughness: number }
  shaded.metalness = 0.05
  shaded.roughness = Math.max(shaded.roughness, 0.72)
}
