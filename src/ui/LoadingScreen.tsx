import { portfolioData } from '../config/portfolioData.ts'
import { audio } from '../game/audio/AudioManager.ts'
import { motion } from '../game/motion.ts'
import { useGameStore } from '../store/gameStore.ts'

export function LoadingScreen() {
  const worldReady = useGameStore((state) => state.worldReady)
  const site = portfolioData.site
  const profile = portfolioData.profile

  const start = () => {
    audio.unlock()
    audio.play('click')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      motion.snapCamera = true
      useGameStore.getState().setPhase('playing')
      return
    }
    motion.intro = 0
    useGameStore.getState().setPhase('intro')
  }

  return (
    <div className="loading">
      <div className="loading-card">
        <CastleMark />
        <p className="eyebrow">{profile.role}</p>
        <h1>{site.title}</h1>
        <p className="slogan">{site.slogan}</p>
        <p className="profile-name">{profile.name}</p>
        <p className="profile-copy">{profile.description}</p>
        <ul className="stack">
          {profile.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {worldReady ? (
          <button type="button" className="game-btn gold" onClick={start}>
            Begin the journey
          </button>
        ) : (
          <div className="loading-status">
            <span className="spinner" />
            <span>{site.loadingText}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function CastleMark() {
  return (
    <svg className="castle-mark" viewBox="0 0 120 80" aria-hidden="true">
      <path d="M10 70 V34 H24 V22 H34 V34 H46 V16 H58 V34 H74 V22 H84 V34 H98 V70 Z" />
      <path d="M46 70 V48 H62 V70" />
    </svg>
  )
}
