import type { TimeOfDay } from '../../types/game.ts'

export function timeFromClock(date = new Date()): TimeOfDay {
  const hour = date.getHours()
  if (hour >= 5 && hour < 10) return 'morning'
  if (hour >= 10 && hour < 17) return 'day'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

export const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: 'Morning',
  day: 'Day',
  evening: 'Evening',
  night: 'Night',
}
