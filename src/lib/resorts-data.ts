import type { Resort, AirlineRoute, DrivingRoute } from '../types/database'

// Import resort data from JSON files (single source of truth)
import catedralData from '../../data/resorts/cerro-catedral.json'
import lenasData from '../../data/resorts/las-lenas.json'
import chapelcoData from '../../data/resorts/chapelco.json'
import castorData from '../../data/resorts/cerro-castor.json'
import bayoData from '../../data/resorts/cerro-bayo.json'
import hoyaData from '../../data/resorts/la-hoya.json'
import caviahueData from '../../data/resorts/caviahue.json'

const allData = [catedralData, lenasData, chapelcoData, castorData, bayoData, hoyaData, caviahueData]

export interface ResortCalculatorAvailability {
  enabled: boolean
  status: string
  message_es: string
  message_en: string
  message_pt: string
}

export const resortCalculatorAvailability: Record<string, ResortCalculatorAvailability> = Object.fromEntries(
  allData.map(d => [d.id, d.calculator2026])
)

export function isResortCalculable(resortId: string): boolean {
  return resortCalculatorAvailability[resortId]?.enabled ?? false
}

export function getResortAvailabilityMessage(resortId: string, lang: 'es' | 'en' | 'pt'): string {
  const data = resortCalculatorAvailability[resortId]
  if (!data) return ''
  if (lang === 'en') return data.message_en
  if (lang === 'pt') return data.message_pt
  return data.message_es
}

// Transform JSON data into Resort objects
export const resorts: Resort[] = allData.map(d => ({
  id: d.id,
  slug: d.slug,
  name: d.name,
  name_en: d.name,
  city_es: d.location.city_es,
  city_en: d.location.city_en,
  province_es: d.location.province_es,
  province_en: d.location.province_en,
  airport_code: d.location.airportCode,
  latitude: d.location.latitude,
  longitude: d.location.longitude,
  base_elevation: d.mountain.baseElevation,
  summit_elevation: d.mountain.summitElevation,
  vertical_drop: d.mountain.verticalDrop,
  total_trails: d.mountain.totalTrails,
  beginner_trails: d.mountain.beginnerTrails,
  intermediate_trails: d.mountain.intermediateTrails,
  advanced_trails: d.mountain.advancedTrails,
  expert_trails: d.mountain.expertTrails,
  total_lifts: d.mountain.totalLifts,
  skiable_area_ha: d.mountain.skiableAreaHa,
  season_start_es: d.season.start_es,
  season_start_en: d.season.start_en,
  season_end_es: d.season.end_es,
  season_end_en: d.season.end_en,
  avg_annual_snowfall_cm: d.season.avgAnnualSnowfallCm,
  profile_es: d.profile.profile_es,
  profile_en: d.profile.profile_en,
  description_es: d.profile.description_es,
  description_en: d.profile.description_en,
  website_url: d.links.website,
  trail_map_url: d.links.trailMap,
  webcam_url: d.links.webcam,
  google_maps_url: d.links.googleMaps,
  hero_image_url: null,
  instagram_url: d.links.instagram,
  facebook_url: d.links.facebook,
  created_at: '',
}))

// Transform airline data
let airlineCounter = 0
export const airlineRoutes: AirlineRoute[] = allData.flatMap(d =>
  d.access.airlines.map(a => ({
    id: `a${++airlineCounter}`,
    airline_name: a.name,
    airline_logo_url: null,
    origin_code: 'EZE',
    destination_code: a.destination,
    resort_id: d.id,
    deep_link_url: a.name === 'Aerolíneas Argentinas' ? 'https://www.aerolineas.com.ar/'
      : a.name === 'Flybondi' ? 'https://www.flybondi.com/'
      : a.name === 'JetSmart' ? 'https://www.jetsmart.com/ar/'
      : a.name === 'LADE' ? 'https://www.lade.com.ar/'
      : '',
    google_flights_url: a.destination !== 'LGS'
      ? `https://www.google.com/travel/flights?q=flights+from+BUE+to+${a.destination}`
      : null,
    is_reliable: a.reliable,
    notes_es: a.notes_es,
    notes_en: a.notes_en,
  }))
)

// Transform driving data
export const drivingRoutes: DrivingRoute[] = allData.map(d => ({
  id: `d${d.id}`,
  origin_name: d.access.driving.originName,
  resort_id: d.id,
  distance_km: d.access.driving.distanceKm,
  estimated_hours: d.access.driving.estimatedHours,
  toll_estimate_ars: d.access.driving.tollEstimateArs,
  toll_estimate_usd: d.access.driving.tollEstimateUsd,
}))

export function getResortBySlug(slug: string): Resort | undefined {
  return resorts.find(r => r.slug === slug)
}

export function getAirlineRoutesForResort(resortId: string): AirlineRoute[] {
  return airlineRoutes.filter(r => r.resort_id === resortId)
}

export function getDrivingRouteForResort(resortId: string): DrivingRoute | undefined {
  return drivingRoutes.find(r => r.resort_id === resortId)
}
