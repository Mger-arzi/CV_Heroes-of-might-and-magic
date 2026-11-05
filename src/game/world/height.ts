import { CASTLES, MAP_SCALE, PEAKS, SITES } from '../../config/worldConfig.ts'
import { smoothstep } from '../math.ts'
import { distanceToBridge, distanceToRoad } from '../navigation/RoadGraph.ts'
import { distanceToRiver, lakeFactor } from '../navigation/waterMath.ts'

function blob(x: number, z: number, cx: number, cz: number, radius: number, height: number): number {
  const d = Math.hypot(x - cx, z - cz) / radius
  if (d >= 1) return 0
  const t = 1 - d
  return t * t * height
}

/** Высота земли. Дороги и площадки замков почти плоские, горы остаются по краям. */
export function heightAt(x: number, z: number): number {
  let h =
    Math.sin(x * 0.045) * Math.cos(z * 0.038) * 1.15 +
    Math.sin((x + z) * 0.02) * 0.55

  for (const peak of PEAKS) {
    h += blob(x, z, peak.x, peak.z, peak.radius, peak.height)
  }

  const roadFlat = 8 * MAP_SCALE
  const road = distanceToRoad(x, z)
  if (road < roadFlat) {
    const t = smoothstep(0, roadFlat, road)
    h = h * (0.08 + 0.92 * t)
  }

  for (const castle of CASTLES) {
    const pad = ((castle.size ?? 11) / 11) * 7
    const d = Math.hypot(x - castle.position.x, z - castle.position.z)
    if (d < pad) {
      const t = smoothstep(pad * 0.46, pad, d)
      h = h * t + 0.3 * (1 - t)
    }
  }

  for (const site of SITES) {
    const d = Math.hypot(x - site.position.x, z - site.position.z)
    if (d < 8) {
      const t = smoothstep(3.6, 8, d)
      h = h * t + 0.35 * (1 - t)
    }
  }

  const bank = 8 * MAP_SCALE
  const onBridge = distanceToBridge(x, z) < 5.2 * MAP_SCALE
  if (!onBridge) {
    const river = distanceToRiver(x, z)
    if (river < bank) {
      const t = smoothstep(2.2 * MAP_SCALE, bank, river)
      h = Math.min(h, -0.65 + t * (h + 0.65))
    }
    const lake = lakeFactor(x, z)
    if (lake > 0) h = Math.min(h, -0.85)
  }

  return h
}

export function surfaceY(x: number, z: number): number {
  if (distanceToBridge(x, z) < 4.6 * MAP_SCALE) return 0.46
  return heightAt(x, z) + 0.12
}
