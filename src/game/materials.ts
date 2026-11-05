import { CanvasTexture, Color, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace } from 'three'
import { visual } from './motion.ts'

const cache = new Map<string, MeshStandardMaterial>()

export function mat(color: string, roughness = 0.86, metalness = 0.04): MeshStandardMaterial {
  const key = `${color}-${roughness}-${metalness}`
  const saved = cache.get(key)
  if (saved) return saved
  const material = new MeshStandardMaterial({ color, roughness, metalness })
  cache.set(key, material)
  return material
}

export const grassMaterial = new MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.96,
  metalness: 0,
})

function createBrickMap() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#6a7078'
  ctx.fillRect(0, 0, 128, 64)
  ctx.fillStyle = '#c5c9ce'
  const mortar = 5
  const brickW = 64
  const brickH = 32
  for (let row = 0; row < 2; row += 1) {
    const offset = row * brickW * 0.5
    for (let col = -1; col < 3; col += 1) {
      ctx.fillRect(col * brickW + offset + mortar / 2, row * brickH + mortar / 2, brickW - mortar, brickH - mortar)
    }
  }
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function roadSurface() {
  return new MeshStandardMaterial({
    color: '#f2f3f4',
    map: brickMap,
    roughness: 0.94,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  })
}

function roadEdge(color: string) {
  return new MeshStandardMaterial({
    color,
    roughness: 1,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  })
}

const brickMap = createBrickMap()

export const dirtMaterial = roadSurface()
export const pathMaterial = roadSurface()
export const stoneRoadMaterial = roadSurface()

export const dirtEdgeMaterial = roadEdge('#4e545c')
export const pathEdgeMaterial = roadEdge('#454b52')
export const stoneEdgeMaterial = roadEdge('#3e444b')

export const windowMaterial = new MeshStandardMaterial({
  color: '#ffd7ae',
  emissive: '#ff9a3c',
  emissiveIntensity: 0.25,
  roughness: 0.4,
})

export const crystalMaterial = new MeshStandardMaterial({
  color: '#9aebff',
  emissive: '#3ec8ff',
  emissiveIntensity: 0.7,
  roughness: 0.2,
  metalness: 0.15,
})

export const lanternMaterial = new MeshStandardMaterial({
  color: '#ffd39a',
  emissive: '#ff9a2e',
  emissiveIntensity: 0.4,
  roughness: 0.35,
})

export const waterUniforms = {
  uTime: visual.time,
  uShallow: { value: new Color('#3d86e0') },
  uDeep: { value: new Color('#164a9c') },
}

export const canopyMaterial = new MeshStandardMaterial({
  color: '#3f7a3b',
  roughness: 0.9,
})

export const pineMaterial = new MeshStandardMaterial({
  color: '#2f6840',
  roughness: 0.88,
})

export const trunkMaterial = new MeshStandardMaterial({
  color: '#6b4a32',
  roughness: 0.95,
})

export const bushMaterial = new MeshStandardMaterial({
  color: '#4d7c3a',
  roughness: 0.95,
})

function addWind(material: MeshStandardMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = visual.time
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      '#include <common>\nuniform float uTime;',
    )
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float sway = sin(uTime * 1.3 + position.y * 1.4) * 0.045 * position.y;
      transformed.x += sway;
      transformed.z += cos(uTime + position.y) * 0.03 * position.y;`,
    )
  }
}

addWind(canopyMaterial)
addWind(pineMaterial)
addWind(bushMaterial)

export function syncGlow(night: number) {
  windowMaterial.emissiveIntensity = 0.15 + night * 1.25
  crystalMaterial.emissiveIntensity = 0.35 + night * 1.4
  lanternMaterial.emissiveIntensity = 0.15 + night * 1.7
}
