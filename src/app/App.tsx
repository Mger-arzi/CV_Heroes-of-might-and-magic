import { useEffect, useState } from 'react'
import { GameCanvas } from '../game/GameCanvas.tsx'
import { closeCastle } from '../game/commands.ts'
import { timeFromClock } from '../game/lighting/timeOfDay.ts'
import { useGameStore } from '../store/gameStore.ts'
import { GameHUD } from '../ui/GameHUD.tsx'
import { LoadingScreen } from '../ui/LoadingScreen.tsx'
import { PortfolioModal } from '../ui/modals/PortfolioModal.tsx'
import { ErrorBoundary } from './ErrorBoundary.tsx'

export function App() {
  const phase = useGameStore((state) => state.phase)
  const openCastleId = useGameStore((state) => state.openCastleId)
  const phone = usePhone()
  const [playOnPhone, setPlayOnPhone] = useState(false)
  const webgl = useState(hasWebGL)[0]

  useEffect(() => {
    const apply = () => {
      const state = useGameStore.getState()
      if (state.timeMode === 'auto') state.setTimeOfDay(timeFromClock())
    }
    const timer = window.setInterval(apply, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  if (phone && !playOnPhone) {
    return (
      <div className="loading">
        <div className="loading-card">
          <h1>Kingdom of Code</h1>
          <p>The rideable world is made for a computer. On a phone the controls and the picture are limited.</p>
          <button type="button" className="game-btn gold" onClick={() => setPlayOnPhone(true)}>
            Open anyway
          </button>
        </div>
      </div>
    )
  }

  if (!webgl) {
    return (
      <div className="loading">
        <div className="loading-card">
          <h1>WebGL is unavailable</h1>
          <p>This browser cannot draw the 3D kingdom. Open the page in Chrome, Edge or Firefox.</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="game-root">
        <GameCanvas />
        <GameHUD />
        {(phase === 'loading' || phase === 'ready') && <LoadingScreen />}
        {openCastleId && <button type="button" className="dim" aria-label="Close" onClick={closeCastle} />}
        {openCastleId && <PortfolioModal castleId={openCastleId} />}
      </div>
    </ErrorBoundary>
  )
}

function usePhone() {
  const [phone, setPhone] = useState(() => window.matchMedia('(pointer: coarse) and (max-width: 1024px)').matches)
  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse) and (max-width: 1024px)')
    const update = () => setPhone(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return phone
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}
