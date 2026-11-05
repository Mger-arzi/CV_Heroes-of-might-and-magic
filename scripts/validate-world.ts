import { CASTLES, LANDMARKS, MAP_SCALE, SPAWN } from '../src/config/worldConfig.ts'
import { isWalkable, distanceToRoad } from '../src/game/navigation/RoadGraph.ts'
import { findRoute } from '../src/game/navigation/Pathfinding.ts'
import { isWater } from '../src/game/navigation/waterMath.ts'

const problems: string[] = []

if (!isWalkable(SPAWN.x, SPAWN.z)) problems.push('spawn is not walkable')
if (isWater(SPAWN.x, SPAWN.z)) problems.push('spawn is in water')

for (const castle of CASTLES) {
  if (!isWalkable(castle.approach.x, castle.approach.z)) {
    problems.push(`${castle.id} approach is not walkable`)
  }
  if (isWalkable(castle.position.x, castle.position.z)) {
    problems.push(`${castle.id} building is walkable`)
  }
  const route = findRoute(SPAWN, castle.approach)
  if (route.length < 2) problems.push(`${castle.id} has no route, length ${route.length}`)
  route.forEach((point, index) => {
    if (!isWalkable(point.x, point.z)) {
      problems.push(`${castle.id} route point ${index} is blocked (${point.x.toFixed(1)}, ${point.z.toFixed(1)})`)
    }
  })
}

for (const item of LANDMARKS) {
  const gap = distanceToRoad(item.x, item.z)
  if (gap < 3.2 * MAP_SCALE) problems.push(`${item.kind} is too close to a road (${gap.toFixed(1)})`)
}

if (problems.length === 0) console.log('world ok')
else {
  console.log(problems.join('\n'))
  process.exitCode = 1
}
