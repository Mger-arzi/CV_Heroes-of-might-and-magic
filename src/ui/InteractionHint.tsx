import { castleById, useGameStore } from '../store/gameStore.ts'

export function InteractionHint() {
  const nearbyId = useGameStore((state) => state.nearbyCastleId)
  const openId = useGameStore((state) => state.openCastleId)
  const castle = castleById(nearbyId)
  if (!castle || openId) return null

  return (
    <div className="hint">
      <strong>{castle.title}</strong>
      <span>Press Enter to look inside</span>
    </div>
  )
}
