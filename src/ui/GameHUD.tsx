import { portfolioData } from '../config/portfolioData.ts'
import { audio } from '../game/audio/AudioManager.ts'
import { motion } from '../game/motion.ts'
import { TIME_LABELS, timeFromClock } from '../game/lighting/timeOfDay.ts'
import { castleById, useGameStore } from '../store/gameStore.ts'
import type { HeroAnim, TimeOfDay } from '../types/game.ts'
import { HorseIcon } from './HorseIcon.tsx'
import { InteractionHint } from './InteractionHint.tsx'
import { Minimap } from './Minimap.tsx'

const STATUS: Record<HeroAnim, string> = {
  idle: 'Exploring the kingdom',
  walk: 'Walking the road',
  trot: 'Riding',
  gallop: 'Galloping',
  turn: 'Turning',
  stop: 'Slowing down',
}

const TIMES: TimeOfDay[] = ['morning', 'day', 'evening', 'night']

export function GameHUD() {
  const phase = useGameStore((state) => state.phase)
  const hero = useGameStore((state) => state.hero)
  const nearbyId = useGameStore((state) => state.nearbyCastleId)
  const settingsOpen = useGameStore((state) => state.settingsOpen)
  const timeOpen = useGameStore((state) => state.timeOpen)
  const musicOn = useGameStore((state) => state.musicOn)
  const sfxOn = useGameStore((state) => state.sfxOn)
  const timeOfDay = useGameStore((state) => state.timeOfDay)
  const timeMode = useGameStore((state) => state.timeMode)
  const musicVolume = useGameStore((state) => state.musicVolume)
  const sfxVolume = useGameStore((state) => state.sfxVolume)
  const nearby = castleById(nearbyId)
  const profile = portfolioData.profile

  if (phase === 'loading' || phase === 'ready') return null

  const skip = () => {
    audio.play('click')
    motion.intro = 1
    motion.snapCamera = true
    useGameStore.getState().setPhase('playing')
  }

  return (
    <div className="hud">
      {phase === 'intro' && (
        <button type="button" className="game-btn skip" onClick={skip}>
          Skip intro
        </button>
      )}
      {phase === 'playing' && (
        <>
          <section className="panel hero-card">
            <HorseIcon />
            <div>
              <strong>{profile.name}</strong>
              <p>{nearby ? `At the gates of ${nearby.title}` : STATUS[hero.anim]}</p>
            </div>
          </section>

          <section className="panel top-actions">
            <button type="button" className="game-btn tiny" onClick={() => click(() => useGameStore.getState().toggleTimePanel())}>
              {timeMode === 'auto' ? 'Auto' : TIME_LABELS[timeOfDay]}
            </button>
            <button type="button" className="game-btn tiny" onClick={() => click(() => useGameStore.getState().setSfxOn(!sfxOn))}>
              {sfxOn ? 'Sound on' : 'Sound off'}
            </button>
            <button type="button" className="game-btn tiny" onClick={() => click(toggleMusic)}>
              {musicOn ? 'Music on' : 'Music off'}
            </button>
            <button type="button" className="game-btn tiny" onClick={() => click(() => useGameStore.getState().toggleSettings())}>
              Settings
            </button>
          </section>

          {timeOpen && (
            <section className="panel time-panel">
              <button type="button" className="game-btn tiny" onClick={() => pickTime('auto')}>
                Auto
              </button>
              {TIMES.map((time) => (
                <button key={time} type="button" className="game-btn tiny" onClick={() => pickTime(time)}>
                  {TIME_LABELS[time]}
                </button>
              ))}
            </section>
          )}

          {settingsOpen && (
            <section className="panel settings">
              <label>
                Music
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={musicVolume}
                  onChange={(event) => useGameStore.getState().setMusicVolume(Number(event.target.value))}
                />
              </label>
              <label>
                Sound
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={sfxVolume}
                  onChange={(event) => useGameStore.getState().setSfxVolume(Number(event.target.value))}
                />
              </label>
              <p className="muted">Music file: public/audio/geroi-3-main-menu.mp3</p>
            </section>
          )}

          <Minimap />
          <InteractionHint />
          <p className="controls">WASD or arrows to ride · Click a road or castle · Scroll to zoom · Hold the mouse wheel and drag to turn · Esc to close</p>
        </>
      )}
    </div>
  )
}

function click(action: () => void) {
  audio.play('click')
  action()
}

function toggleMusic() {
  const next = !useGameStore.getState().musicOn
  useGameStore.getState().setMusicOn(next)
  if (next) audio.unlock()
  else audio.stopMusic()
}

function pickTime(value: 'auto' | TimeOfDay) {
  audio.play('click')
  const store = useGameStore.getState()
  if (value === 'auto') {
    store.setTimeMode('auto')
    store.setTimeOfDay(timeFromClock())
  } else {
    store.setTimeMode('manual')
    store.setTimeOfDay(value)
  }
  store.closePanels()
}
