import { assetFiles } from '../../config/assets.ts'
import { useGameStore } from '../../store/gameStore.ts'

type UiSound = 'click' | 'open' | 'close' | 'route' | 'arrive' | 'deny'

/**
 * Ветер и щелчки интерфейса собираются в браузере.
 * Музыка и звук шагов — отдельные файлы из public/audio.
 */
class AudioManager {
  private ctx: AudioContext | null = null
  private sfx: GainNode | null = null
  private windGain: GainNode | null = null
  private waterGain: GainNode | null = null
  private music: HTMLAudioElement | null = null
  private musicReady = false
  private musicVolumeNow = 0
  private warnedMusic = false
  private hooves: HTMLAudioElement | null = null
  private hoovesBroken = false
  private hoofTimer = 0
  private wasMoving = false
  private birdTimer = 4
  private started = false
  waterAmount = 0

  constructor() {
    if (typeof window === 'undefined') return
    const onGesture = () => {
      this.unlock()
    }
    window.addEventListener('pointerdown', onGesture)
    window.addEventListener('keydown', onGesture)
  }

  unlock() {
    if (!this.started) {
      const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctx) return

      const ctx = new Ctx()
      const master = ctx.createGain()
      const sfx = ctx.createGain()
      master.gain.value = 1
      sfx.gain.value = 1
      sfx.connect(master)
      master.connect(ctx.destination)

      this.ctx = ctx
      this.sfx = sfx
      this.started = true
      this.startWind()
      this.tryMusic()
      this.tryHooves()
    }
    void this.ctx?.resume()
    this.startMusicPlayback()
    this.primeHooves()
  }

  private startWind() {
    if (!this.ctx || !this.sfx) return
    const buffer = this.noise(2)
    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 420
    const gain = this.ctx.createGain()
    gain.gain.value = 0.045
    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfx)
    source.start()
    this.windGain = gain

    const water = this.ctx.createBufferSource()
    water.buffer = buffer
    water.loop = true
    const waterFilter = this.ctx.createBiquadFilter()
    waterFilter.type = 'lowpass'
    waterFilter.frequency.value = 240
    const waterGain = this.ctx.createGain()
    waterGain.gain.value = 0
    water.connect(waterFilter)
    waterFilter.connect(waterGain)
    waterGain.connect(this.sfx)
    water.start()
    this.waterGain = waterGain
  }

  private noise(seconds: number): AudioBuffer {
    const ctx = this.ctx
    if (!ctx) throw new Error('Audio is not ready')
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
    return buffer
  }

  private tryMusic() {
    if (!assetFiles.music || this.music) return
    const music = new Audio(assetFiles.music)
    music.loop = true
    music.preload = 'auto'
    music.volume = useGameStore.getState().musicVolume
    music.addEventListener('canplay', () => {
      this.musicReady = true
    })
    music.addEventListener('error', () => {
      this.musicReady = false
      if (!this.warnedMusic) {
        this.warnedMusic = true
        console.info(`[audio] Не удалось открыть ${assetFiles.music}`)
      }
    })
    this.music = music
  }

  /** Вызывать по клику. Браузер разрешает музыку только в момент нажатия. */
  startMusicPlayback() {
    const music = this.music
    const state = useGameStore.getState()
    if (!music || !state.musicOn) return
    this.musicReady = true
    this.musicVolumeNow = state.musicVolume
    music.volume = state.musicVolume
    void music.play().catch((error: unknown) => {
      console.info('[audio] Браузер не пустил музыку. Нажми в окно игры ещё раз.', error)
    })
  }

  stopMusic() {
    this.music?.pause()
  }

  private tryHooves() {
    if (!assetFiles.hooves || this.hooves) return
    const clip = new Audio(assetFiles.hooves)
    clip.loop = true
    clip.preload = 'auto'
    clip.volume = 0
    clip.addEventListener('error', () => {
      this.hoovesBroken = true
      console.info(`[audio] Не удалось открыть ${assetFiles.hooves}`)
    })
    this.hooves = clip
  }

  /** Первый play() должен случиться по клику, иначе браузер потом не даст звук. */
  private primeHooves() {
    const clip = this.hooves
    if (!clip || !clip.paused) return
    clip.volume = 0
    void clip.play().then(() => {
      if (clip.volume === 0) {
        clip.pause()
        clip.currentTime = 0
      }
    }).catch(() => {})
  }

  play(kind: UiSound) {
    if (!this.ctx || !this.sfx || !useGameStore.getState().sfxOn) return
    const now = this.ctx.currentTime
    if (kind === 'click') this.blip(now, 640, 0.04, 0.05)
    if (kind === 'route') this.blip(now, 520, 0.07, 0.06)
    if (kind === 'arrive') {
      this.blip(now, 480, 0.08, 0.05)
      this.blip(now + 0.09, 720, 0.1, 0.05)
    }
    if (kind === 'open') {
      this.blip(now, 420, 0.1, 0.05)
      this.blip(now + 0.08, 640, 0.12, 0.04)
    }
    if (kind === 'close') this.blip(now, 300, 0.08, 0.04)
    if (kind === 'deny') this.blip(now, 180, 0.08, 0.04)
  }

  private blip(when: number, freq: number, duration: number, volume: number) {
    if (!this.ctx || !this.sfx) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(volume, when)
    gain.gain.exponentialRampToValueAtTime(0.001, when + duration)
    osc.connect(gain)
    gain.connect(this.sfx)
    osc.start(when)
    osc.stop(when + duration + 0.02)
  }

  private hoof(fast: boolean) {
    if (!this.ctx || !this.sfx || !useGameStore.getState().sfxOn) return
    const now = this.ctx.currentTime
    const source = this.ctx.createBufferSource()
    source.buffer = this.noise(0.08)
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = fast ? 1400 : 900
    filter.Q.value = 0.7
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(fast ? 0.45 : 0.32, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfx)
    source.start(now)
    source.stop(now + 0.08)
  }

  updateHoof(speed: number, dt: number) {
    if (!this.started) return
    if (this.ctx?.state === 'suspended') void this.ctx.resume()

    const moving = speed > 0.45
    const clip = this.hooves
    if (clip && !this.hoovesBroken) {
      this.playHoofFile(clip, speed, moving)
      return
    }

    if (!this.ctx) return
    if (this.wasMoving && !moving) this.snort()
    this.wasMoving = moving
    if (!moving) {
      this.hoofTimer = 0
      return
    }
    this.hoofTimer -= dt
    const interval = speed > 6.4 ? 0.25 : speed > 3.6 ? 0.38 : 0.52
    if (this.hoofTimer <= 0) {
      this.hoofTimer = interval
      this.hoof(speed > 6.4)
    }
  }

  private playHoofFile(clip: HTMLAudioElement, speed: number, moving: boolean) {
    const state = useGameStore.getState()
    if (!moving || !state.sfxOn) {
      if (!clip.paused) {
        clip.pause()
        clip.currentTime = 0
      }
      return
    }

    const rate = speed > 6.4 ? 1.35 : speed > 3.6 ? 1.05 : 0.8
    try {
      clip.playbackRate = rate
    } catch {
      // Файл ещё не успел загрузиться.
    }
    clip.volume = Math.max(0, Math.min(1, state.sfxVolume * 0.7))
    if (clip.paused) {
      void clip.play().catch(() => {})
    }
  }

  private snort() {
    if (!this.ctx || !this.sfx || !useGameStore.getState().sfxOn) return
    const now = this.ctx.currentTime
    const source = this.ctx.createBufferSource()
    source.buffer = this.noise(0.18)
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 500
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.05, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfx)
    source.start(now)
    source.stop(now + 0.18)
  }

  tick(dt: number) {
    if (!this.ctx || !this.sfx) return
    const state = useGameStore.getState()
    const sfxTarget = state.sfxOn ? state.sfxVolume : 0
    this.sfx.gain.value += (sfxTarget - this.sfx.gain.value) * Math.min(1, dt * 4)
    if (this.waterGain) {
      const target = state.sfxOn ? this.waterAmount * 0.08 * state.sfxVolume : 0
      this.waterGain.gain.value += (target - this.waterGain.gain.value) * Math.min(1, dt * 2)
    }
    if (this.windGain) {
      const nightCut = state.timeOfDay === 'night' ? 0.7 : 1
      this.windGain.gain.value = 0.04 * nightCut * (state.sfxOn ? state.sfxVolume : 0)
    }

    const musicTarget = this.musicReady && state.musicOn ? state.musicVolume : 0
    this.musicVolumeNow += (musicTarget - this.musicVolumeNow) * Math.min(1, dt * 2)
    if (this.music) this.music.volume = Math.max(0, Math.min(1, this.musicVolumeNow))

    this.birdTimer -= dt
    if (this.birdTimer <= 0) {
      this.birdTimer = 5 + Math.random() * 7
      if (state.timeOfDay === 'morning' || state.timeOfDay === 'day') this.blip(this.ctx.currentTime, 1400 + Math.random() * 800, 0.12, 0.02)
    }
  }
}

export const audio = new AudioManager()
