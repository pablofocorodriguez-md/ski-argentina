import type { AppLanguage } from '../i18n/lang'

// Argentine ski season periods based on typical calendar dates.
// High: first 2 weeks of July (winter school break) + last week of July
// Mid: rest of July, August
// Low: June, September, October

export type SeasonPeriod = 'low' | 'mid' | 'high'

export function detectSeasonPeriod(date: Date): SeasonPeriod {
  const month = date.getMonth() // 0-indexed
  const day = date.getDate()

  // July (month 6)
  if (month === 6) {
    // First 2 weeks + last week = high season (school holidays)
    if (day <= 20 || day >= 25) return 'high'
    return 'mid'
  }

  // August (month 7) = mid season
  if (month === 7) return 'mid'

  // June (month 5), September (month 8), October (month 9) = low season
  if (month === 5 || month === 8 || month === 9) return 'low'

  // Outside ski season
  return 'low'
}

export function detectPeriodFromRange(startDate: string, endDate: string): SeasonPeriod {
  if (!startDate || !endDate) return 'mid'

  const start = new Date(startDate + 'T12:00:00')
  const end = new Date(endDate + 'T12:00:00')

  // Check each day in the range, return the most common period
  const counts: Record<SeasonPeriod, number> = { low: 0, mid: 0, high: 0 }
  const current = new Date(start)

  while (current <= end) {
    counts[detectSeasonPeriod(current)]++
    current.setDate(current.getDate() + 1)
  }

  if (counts.high >= counts.mid && counts.high >= counts.low) return 'high'
  if (counts.mid >= counts.low) return 'mid'
  return 'low'
}

export function calculateSkiDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate + 'T12:00:00')
  const end = new Date(endDate + 'T12:00:00')
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff)
}

export function getPeriodLabel(period: SeasonPeriod, lang: AppLanguage): string {
  const labels: Record<SeasonPeriod, Record<string, string>> = {
    low: { es: 'Temporada baja', en: 'Low season', pt: 'Baixa temporada' },
    mid: { es: 'Temporada media', en: 'Mid season', pt: 'Média temporada' },
    high: { es: 'Temporada alta', en: 'High season', pt: 'Alta temporada' },
  }
  return labels[period][lang]
}
