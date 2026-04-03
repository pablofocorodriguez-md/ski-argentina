// Pricing data for season 2026.
// All prices are read from data/resorts/*.json (single source of truth).

import catedralData from '../../data/resorts/cerro-catedral.json'
import lenasData from '../../data/resorts/las-lenas.json'
import chapelcoData from '../../data/resorts/chapelco.json'
import castorData from '../../data/resorts/cerro-castor.json'
import bayoData from '../../data/resorts/cerro-bayo.json'
import hoyaData from '../../data/resorts/la-hoya.json'
import caviahueData from '../../data/resorts/caviahue.json'
import type { AppLanguage } from '../i18n/lang'

const allData = [catedralData, lenasData, chapelcoData, castorData, bayoData, hoyaData, caviahueData]

const exchangeRate = 1200

const resortDataMap = Object.fromEntries(allData.map(d => [d.id, d]))

export const resortPricingStatus: Record<string, boolean> = Object.fromEntries(
  allData.map(d => [d.id, d.pricing2026.confirmed])
)

export function arePricesConfirmed(resortId: string): boolean {
  return resortPricingStatus[resortId] ?? false
}

// ──────────────────────────────────────────────
// EQUIPMENT OPTIONS
// ──────────────────────────────────────────────

export interface EquipmentOption {
  key: string
  label_es: string
  label_en: string
  source?: string
  perDay: { basic: number; intermediate: number; advanced: number }
}

export function getEquipmentOptions(resortId: string): EquipmentOption[] {
  const data = resortDataMap[resortId]
  if (!data) return []
  const pricing = data.pricing2026 as Record<string, unknown>

  if ('equipment' in pricing && typeof pricing.equipment === 'object' && pricing.equipment !== null) {
    const eq = pricing.equipment as Record<string, {
      label_es?: string; label_en?: string; source?: string
      perDay: Record<string, number>
    }>
    return Object.entries(eq).map(([key, tier]) => ({
      key,
      label_es: tier.label_es ?? `Rental ${key}`,
      label_en: tier.label_en ?? `${key} rental`,
      source: tier.source,
      perDay: {
        basic: tier.perDay.basic ?? 0,
        intermediate: tier.perDay.intermediate ?? 0,
        advanced: tier.perDay.advanced ?? 0,
      },
    }))
  }

  if ('equipmentPerDay' in pricing) {
    const flat = pricing.equipmentPerDay as Record<string, number>
    return [{
      key: 'default',
      label_es: 'Rental del centro',
      label_en: 'Resort rental',
      perDay: { basic: flat.basic ?? 0, intermediate: flat.intermediate ?? 0, advanced: flat.advanced ?? 0 },
    }]
  }

  return []
}

// ──────────────────────────────────────────────
// LIFT PASSES
// ──────────────────────────────────────────────

const seniorDiscount = 0.7

function multiDayFactor(days: number): number {
  if (days === 1) return 1
  if (days <= 3) return 0.92
  if (days <= 5) return 0.86
  if (days <= 7) return 0.80
  return 0.75
}

export function getLiftPassPrice(
  resortId: string,
  period: 'low' | 'mid' | 'high',
  riderType: 'adult' | 'child' | 'senior',
  days: number,
  currency: 'ARS' | 'USD'
): number {
  const data = resortDataMap[resortId]
  if (!data) return 0
  const lp = data.pricing2026.liftPassPerDay
  let perDay = lp.adult[period]
  if (riderType === 'child') perDay = lp.child[period]
  if (riderType === 'senior') perDay = lp.adult[period] * seniorDiscount
  const total = perDay * days * multiDayFactor(days)
  return currency === 'USD' ? Math.round(total / exchangeRate) : Math.round(total)
}

// ──────────────────────────────────────────────
// EQUIPMENT RENTAL
// ──────────────────────────────────────────────

export function getEquipmentPrice(
  resortId: string,
  level: 'basic' | 'intermediate' | 'advanced',
  days: number,
  currency: 'ARS' | 'USD',
  locationKey: string = 'default'
): number {
  const options = getEquipmentOptions(resortId)
  const tier = options.find(o => o.key === locationKey) ?? options[0]
  if (!tier) return 0
  const perDay = tier.perDay[level] ?? 0
  const total = perDay * days
  return currency === 'USD' ? Math.round(total / exchangeRate) : Math.round(total)
}

// ──────────────────────────────────────────────
// LESSONS
// ──────────────────────────────────────────────

export function getLessonPrice(
  resortId: string,
  type: 'group' | 'private',
  days: number,
  currency: 'ARS' | 'USD'
): number {
  const data = resortDataMap[resortId]
  if (!data) return 0
  const total = data.pricing2026.lessonsPerClass[type] * days
  return currency === 'USD' ? Math.round(total / exchangeRate) : Math.round(total)
}

export function getLessonPrices(resortId: string): { group: number; private: number } | null {
  const data = resortDataMap[resortId]
  if (!data) return null
  return {
    group: data.pricing2026.lessonsPerClass.group,
    private: data.pricing2026.lessonsPerClass.private,
  }
}

// ──────────────────────────────────────────────
// PASSENGER & TRIP MODEL
// ──────────────────────────────────────────────

export type EquipmentLevel = 'none' | 'basic' | 'intermediate' | 'advanced'
export type LessonType = 'none' | 'group' | 'private'

export interface Passenger {
  label: string              // "Adulto 1", "Menor 1", etc.
  type: 'adult' | 'child'
  equipmentLevel: EquipmentLevel
  lessonType: LessonType
}

export interface Trip {
  id: string
  resortId: string
  skiDays: number
  adults: number
  children: number
  passengers: Passenger[]
  period: 'low' | 'mid' | 'high'
  startDate?: string
  endDate?: string
  equipmentLocationKey: string
  customEquipmentPerDay: number
  transportType: 'flight' | 'car'
  flightPricePerPerson: number
  carFuelCost: number
  accommodationPerNight: number
  currency: 'ARS' | 'USD'
}

export interface TripCostBreakdown {
  resortId: string
  liftPass: number
  equipment: number
  equipmentLocationKey: string
  lessons: number
  transport: number
  accommodation: number
  total: number
  totalPerPerson: number
  pricesConfirmed: boolean
}

export interface TripWithResult {
  trip: Trip
  result: TripCostBreakdown
}

/** Build passengers array from adults/children count */
export function buildPassengers(adults: number, children: number, lang: AppLanguage): Passenger[] {
  const adultLabel = lang === 'en' ? 'Adult' : 'Adulto'
  const childLabel = lang === 'en' ? 'Child' : lang === 'pt' ? 'Criança' : 'Menor'
  const passengers: Passenger[] = []
  for (let i = 1; i <= adults; i++) {
    passengers.push({
      label: `${adultLabel} ${i}`,
      type: 'adult',
      equipmentLevel: 'none',
      lessonType: 'none',
    })
  }
  for (let i = 1; i <= children; i++) {
    passengers.push({
      label: `${childLabel} ${i}`,
      type: 'child',
      equipmentLevel: 'none',
      lessonType: 'none',
    })
  }
  return passengers
}

export function calculateTripCost(trip: Trip): TripCostBreakdown {
  const totalPeople = trip.passengers.length || (trip.adults + trip.children)

  // Lift passes — per passenger by type
  let liftPass = 0
  for (const p of trip.passengers) {
    liftPass += getLiftPassPrice(trip.resortId, trip.period, p.type, trip.skiDays, trip.currency)
  }

  // Equipment — per passenger by their level
  let equipment = 0
  for (const p of trip.passengers) {
    if (p.equipmentLevel !== 'none') {
      if (trip.equipmentLocationKey === 'custom') {
        equipment += Math.round(trip.customEquipmentPerDay * trip.skiDays)
      } else {
        equipment += getEquipmentPrice(
          trip.resortId, p.equipmentLevel, trip.skiDays, trip.currency, trip.equipmentLocationKey
        )
      }
    }
  }

  // Lessons — per passenger by their type
  let lessons = 0
  for (const p of trip.passengers) {
    if (p.lessonType !== 'none') {
      lessons += getLessonPrice(trip.resortId, p.lessonType, trip.skiDays, trip.currency)
    }
  }

  // Transport
  let transport = 0
  if (trip.transportType === 'flight') {
    transport = trip.flightPricePerPerson * totalPeople
  } else {
    transport = trip.carFuelCost
  }

  // Accommodation
  const accommodation = trip.accommodationPerNight * trip.skiDays

  const total = liftPass + equipment + lessons + transport + accommodation
  const totalPerPerson = totalPeople > 0 ? Math.round(total / totalPeople) : 0

  return {
    resortId: trip.resortId,
    liftPass,
    equipment,
    equipmentLocationKey: trip.equipmentLocationKey,
    lessons,
    transport,
    accommodation,
    total,
    totalPerPerson,
    pricesConfirmed: arePricesConfirmed(trip.resortId),
  }
}

export function createEmptyTrip(currency: 'ARS' | 'USD', lang: AppLanguage = 'es'): Trip {
  return {
    id: crypto.randomUUID(),
    resortId: '',
    skiDays: 5,
    adults: 2,
    children: 0,
    passengers: buildPassengers(2, 0, lang),
    period: 'mid',
    equipmentLocationKey: 'default',
    customEquipmentPerDay: 0,
    transportType: 'flight',
    flightPricePerPerson: 0,
    carFuelCost: 0,
    accommodationPerNight: 0,
    currency,
  }
}
