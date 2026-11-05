import { useMemo } from 'react'
import { ConeGeometry, CylinderGeometry, SphereGeometry } from 'three'
import { bushMaterial, canopyMaterial, pineMaterial, trunkMaterial } from '../materials.ts'
import { getNature } from './scatter.ts'
import { Instances } from './Instances.tsx'

export function Forests() {
  const nature = getNature()
  const shapes = useMemo(() => {
    const trunk = new CylinderGeometry(0.18, 0.26, 1.3, 5)
    trunk.translate(0, 0.65, 0)
    const pine = new ConeGeometry(1.05, 2.4, 6)
    pine.translate(0, 2.15, 0)
    const pineTop = new ConeGeometry(0.72, 1.6, 6)
    pineTop.translate(0, 3.15, 0)
    const oak = new SphereGeometry(1.15, 7, 5)
    oak.translate(0, 2.35, 0)
    const tall = new SphereGeometry(1.35, 7, 5)
    tall.translate(0, 3.4, 0)
    const bush = new SphereGeometry(0.55, 6, 5)
    bush.translate(0, 0.4, 0)
    const flower = new SphereGeometry(0.16, 5, 4)
    flower.translate(0, 0.2, 0)
    return { trunk, pine, pineTop, oak, tall, bush, flower }
  }, [])

  return (
    <group>
      <Instances items={nature.pines} castShadow>
        <primitive object={shapes.trunk} attach="geometry" />
        <primitive object={trunkMaterial} attach="material" />
      </Instances>
      <Instances items={nature.pines}>
        <primitive object={shapes.pine} attach="geometry" />
        <primitive object={pineMaterial} attach="material" />
      </Instances>
      <Instances items={nature.pines}>
        <primitive object={shapes.pineTop} attach="geometry" />
        <primitive object={pineMaterial} attach="material" />
      </Instances>
      <Instances items={nature.oaks} castShadow>
        <primitive object={shapes.trunk} attach="geometry" />
        <primitive object={trunkMaterial} attach="material" />
      </Instances>
      <Instances items={nature.oaks}>
        <primitive object={shapes.oak} attach="geometry" />
        <primitive object={canopyMaterial} attach="material" />
      </Instances>
      <Instances items={nature.talls} castShadow>
        <primitive object={shapes.trunk} attach="geometry" />
        <primitive object={trunkMaterial} attach="material" />
      </Instances>
      <Instances items={nature.talls}>
        <primitive object={shapes.tall} attach="geometry" />
        <primitive object={canopyMaterial} attach="material" />
      </Instances>
      <Instances items={nature.bushes}>
        <primitive object={shapes.bush} attach="geometry" />
        <primitive object={bushMaterial} attach="material" />
      </Instances>
      <Instances items={nature.flowers}>
        <primitive object={shapes.flower} attach="geometry" />
        <meshStandardMaterial color="#d45d78" />
      </Instances>
    </group>
  )
}
