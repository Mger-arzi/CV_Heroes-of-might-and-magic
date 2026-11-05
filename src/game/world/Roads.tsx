import { useEffect, useMemo } from 'react'
import type { RoadKind } from '../../types/game.ts'
import {
  dirtEdgeMaterial,
  dirtMaterial,
  pathEdgeMaterial,
  pathMaterial,
  stoneEdgeMaterial,
  stoneRoadMaterial,
} from '../materials.ts'
import { ROAD_HALF_WIDTH } from '../../config/worldConfig.ts'
import { POLY_EDGES } from '../navigation/RoadGraph.ts'
import { surfaceY } from './height.ts'
import { buildRibbon } from './ribbon.ts'

function lines(kind: RoadKind) {
  return POLY_EDGES.filter((edge) => edge.kind === kind).map((edge) => edge.points)
}

export function Roads() {
  const geometry = useMemo(() => {
    const roadY = (x: number, z: number) => surfaceY(x, z) + 0.04
    const edgeY = (x: number, z: number) => surfaceY(x, z) + 0.01
    const stoneLines = [...lines('stone'), ...lines('bridge')]
    return {
      dirt: buildRibbon(lines('dirt'), ROAD_HALF_WIDTH.dirt, roadY),
      dirtEdge: buildRibbon(lines('dirt'), ROAD_HALF_WIDTH.dirt + 0.16, edgeY),
      path: buildRibbon(lines('path'), ROAD_HALF_WIDTH.path, roadY),
      pathEdge: buildRibbon(lines('path'), ROAD_HALF_WIDTH.path + 0.12, edgeY),
      stone: buildRibbon(stoneLines, ROAD_HALF_WIDTH.stone, roadY),
      stoneEdge: buildRibbon(stoneLines, ROAD_HALF_WIDTH.stone + 0.16, edgeY),
    }
  }, [])

  useEffect(
    () => () => {
      Object.values(geometry).forEach((item) => item.dispose())
    },
    [geometry],
  )

  return (
    <group>
      <mesh geometry={geometry.dirtEdge} material={dirtEdgeMaterial} receiveShadow />
      <mesh geometry={geometry.dirt} material={dirtMaterial} receiveShadow />
      <mesh geometry={geometry.pathEdge} material={pathEdgeMaterial} receiveShadow />
      <mesh geometry={geometry.path} material={pathMaterial} receiveShadow />
      <mesh geometry={geometry.stoneEdge} material={stoneEdgeMaterial} receiveShadow />
      <mesh geometry={geometry.stone} material={stoneRoadMaterial} receiveShadow />
      <BridgeRails />
    </group>
  )
}

function BridgeRails() {
  const edge = POLY_EDGES.find((item) => item.kind === 'bridge')
  if (!edge) return null

  const posts = edge.points.filter((_, index) => index % 2 === 0)
  return (
    <group>
      {posts.map((point, index) => {
        const next = edge.points[Math.min(edge.points.length - 1, index * 2 + 1)]
        const dx = next.x - point.x
        const dz = next.z - point.z
        const len = Math.hypot(dx, dz) || 1
        const ox = (-dz / len) * 1.45
        const oz = (dx / len) * 1.45
        return (
          <group key={`${point.x}-${point.z}`}>
            <Post x={point.x + ox} z={point.z + oz} />
            <Post x={point.x - ox} z={point.z - oz} />
          </group>
        )
      })}
    </group>
  )
}

function Post({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 1.15, z]} castShadow material={stoneEdgeMaterial}>
      <boxGeometry args={[0.18, 1.3, 0.18]} />
    </mesh>
  )
}
