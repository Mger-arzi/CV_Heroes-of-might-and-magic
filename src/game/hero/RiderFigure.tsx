import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import {
  Box3,
  LoopRepeat,
  Mesh,
  Quaternion,
  Vector3,
  type Group,
  type Material,
  type Object3D,
  type SkinnedMesh,
} from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'

const URL = '/models/adventurer.glb'
const HEIGHT = 1.55

// Bends from the bind pose, in the bone's local axes: thigh forward, knee down, knees apart.
const POSE: Array<[string, number, number, number]> = [
  ['UpperLegL', 1.1, 0, 1.05],
  ['UpperLegR', -1.1, 0, -1.05],
  ['LowerLegL', -1.25, 0, 0],
  ['LowerLegR', 1.25, 0, 0],
]

useGLTF.preload(URL)

export function RiderFigure() {
  const gltf = useGLTF(URL)
  const actor = useMemo(() => clone(gltf.scene) as Group, [gltf.scene])
  const animations = useMemo(() => {
    for (const clip of gltf.animations) {
      clip.tracks = clip.tracks.filter((track) => {
        const bone = track.name.split('|').pop()?.split('.')[0] ?? ''
        return bone !== 'Hips' && !bone.startsWith('UpperLeg') && !bone.startsWith('LowerLeg') && !bone.startsWith('Foot')
      })
    }
    return gltf.animations
  }, [gltf.animations])
  const { actions, mixer } = useAnimations(animations, actor)
  const legs = useRef<Object3D[]>([])

  useLayoutEffect(() => {
    actor.scale.set(1, 1, 1)
    actor.position.set(0, 0, 0)
    actor.rotation.set(0, 0, 0)
    actor.updateMatrixWorld(true)
    actor.traverse((obj) => {
      const mesh = obj as Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) {
        if (!('metalness' in material) || !('roughness' in material)) continue
        const shaded = material as Material & { metalness: number; roughness: number }
        shaded.metalness = 0.06
        shaded.roughness = Math.max(shaded.roughness, 0.7)
      }
    })
    const skinned = actor.getObjectByName('Adventurer_Legs_1') as SkinnedMesh | undefined
    skinned?.skeleton.pose()
    const box = new Box3().setFromObject(actor)
    const size = box.getSize(new Vector3())
    const scale = size.y > 0.05 ? HEIGHT / size.y : 1
    actor.scale.setScalar(scale)
    actor.updateMatrixWorld(true)
    const hips = actor.getObjectByName('Hips')
    if (hips && actor.parent) {
      const hip = new Vector3()
      hips.getWorldPosition(hip)
      actor.parent.worldToLocal(hip)
      actor.position.sub(hip)
    }
    legs.current = POSE.flatMap(([name, bendX, bendY, bendZ]) => {
      const bone = actor.getObjectByName(name)
      if (!bone) return []
      bone.userData.rest = bone.quaternion.clone()
      bone.userData.bendX = bendX
      bone.userData.bendY = bendY
      bone.userData.bendZ = bendZ
      return [bone]
    })
    const clip = actions['CharacterArmature|Idle_Sword'] ?? actions['CharacterArmature|Idle']
    clip?.reset().setLoop(LoopRepeat, Infinity).play()
  }, [actions, actor])

  useFrame((_, delta) => {
    mixer.update(delta)
    for (const bone of legs.current) {
      const rest = bone.userData.rest as Quaternion | undefined
      if (!rest) continue
      bone.quaternion.copy(rest)
      bone.rotateX(bone.userData.bendX as number)
      bone.rotateY(bone.userData.bendY as number)
      bone.rotateZ(bone.userData.bendZ as number)
    }
  })

  return <primitive object={actor} />
}
