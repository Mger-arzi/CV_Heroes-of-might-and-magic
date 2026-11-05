import { useRef, type MouseEvent } from 'react'
import { CASTLES, HALF, LAKES, RIVER, SITES, WORLD_SIZE } from '../config/worldConfig.ts'
import { audio } from '../game/audio/AudioManager.ts'
import { commandMoveTo, returnHome } from '../game/commands.ts'
import { POLY_EDGES } from '../game/navigation/RoadGraph.ts'
import { useGameStore } from '../store/gameStore.ts'

export function Minimap() {
  const hero = useGameStore((state) => state.hero)
  const destination = useGameStore((state) => state.destination)
  const svgRef = useRef<SVGSVGElement>(null)
  const yaw = (hero.yaw * 180) / Math.PI

  const onClick = (event: MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * WORLD_SIZE - HALF
    const z = ((event.clientY - rect.top) / rect.height) * WORLD_SIZE - HALF
    audio.play('click')
    commandMoveTo(x, z)
  }

  return (
    <div className="minimap">
      <svg ref={svgRef} viewBox={`${-HALF} ${-HALF} ${WORLD_SIZE} ${WORLD_SIZE}`} onClick={onClick}>
        <rect x={-HALF} y={-HALF} width={WORLD_SIZE} height={WORLD_SIZE} className="map-ground" />
        {LAKES.map((lake) => (
          <ellipse key={`${lake.x}-${lake.z}`} cx={lake.x} cy={lake.z} rx={lake.rx} ry={lake.rz} className="map-water" />
        ))}
        <polyline points={RIVER.map((point) => `${point.x},${point.z}`).join(' ')} className="map-river" />
        {POLY_EDGES.map((edge) => (
          <polyline
            key={`${edge.a}-${edge.b}`}
            points={edge.points.map((point) => `${point.x},${point.z}`).join(' ')}
            className="map-road"
          />
        ))}
        {CASTLES.map((castle) => (
          <rect
            key={castle.id}
            x={castle.position.x - 3}
            y={castle.position.z - 3}
            width={6}
            height={6}
            className="map-castle"
          />
        ))}
        {SITES.map((site) => (
          <circle key={site.id} cx={site.position.x} cy={site.position.z} r={2.4} className="map-goal" />
        ))}
        {destination && <circle cx={destination.x} cy={destination.z} r={3.2} className="map-goal" />}
        <polygon points="0,-5 3.4,4.2 -3.4,4.2" className="map-hero" transform={`translate(${hero.x} ${hero.z}) rotate(${yaw})`} />
      </svg>
      <button
        type="button"
        className="game-btn tiny"
        onClick={() => {
          audio.play('click')
          returnHome()
        }}
      >
        Return
      </button>
    </div>
  )
}
