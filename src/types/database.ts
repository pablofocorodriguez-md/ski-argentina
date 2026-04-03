export interface Database {
  public: {
    Tables: {
      resorts: {
        Row: Resort
        Insert: Omit<Resort, 'id' | 'created_at'>
        Update: Partial<Omit<Resort, 'id'>>
      }
      lift_passes: {
        Row: LiftPass
        Insert: Omit<LiftPass, 'id'>
        Update: Partial<Omit<LiftPass, 'id'>>
      }
      equipment_rental: {
        Row: EquipmentRental
        Insert: Omit<EquipmentRental, 'id'>
        Update: Partial<Omit<EquipmentRental, 'id'>>
      }
      lessons: {
        Row: Lesson
        Insert: Omit<Lesson, 'id'>
        Update: Partial<Omit<Lesson, 'id'>>
      }
      airline_routes: {
        Row: AirlineRoute
        Insert: Omit<AirlineRoute, 'id'>
        Update: Partial<Omit<AirlineRoute, 'id'>>
      }
      driving_routes: {
        Row: DrivingRoute
        Insert: Omit<DrivingRoute, 'id'>
        Update: Partial<Omit<DrivingRoute, 'id'>>
      }
      fuel_config: {
        Row: FuelConfig
        Insert: Omit<FuelConfig, 'id'>
        Update: Partial<Omit<FuelConfig, 'id'>>
      }
      exchange_rates: {
        Row: ExchangeRate
        Insert: Omit<ExchangeRate, 'id'>
        Update: Partial<Omit<ExchangeRate, 'id'>>
      }
      resort_photos: {
        Row: ResortPhoto
        Insert: Omit<ResortPhoto, 'id'>
        Update: Partial<Omit<ResortPhoto, 'id'>>
      }
      email_leads: {
        Row: EmailLead
        Insert: Omit<EmailLead, 'id' | 'created_at'>
        Update: Partial<Omit<EmailLead, 'id'>>
      }
      search_logs: {
        Row: SearchLog
        Insert: Omit<SearchLog, 'id' | 'created_at'>
        Update: Partial<Omit<SearchLog, 'id'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export interface Resort {
  id: string
  slug: string
  name: string
  name_en: string
  city_es: string
  city_en: string
  province_es: string
  province_en: string
  airport_code: string
  latitude: number
  longitude: number
  base_elevation: number
  summit_elevation: number
  vertical_drop: number
  total_trails: number
  beginner_trails: number
  intermediate_trails: number
  advanced_trails: number
  expert_trails: number
  total_lifts: number
  skiable_area_ha: number | null
  season_start_es: string
  season_start_en: string
  season_end_es: string
  season_end_en: string
  avg_annual_snowfall_cm: number | null
  profile_es: string
  profile_en: string
  description_es: string
  description_en: string
  website_url: string
  trail_map_url: string | null
  webcam_url: string | null
  google_maps_url: string
  hero_image_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  created_at: string
}

export interface LiftPass {
  id: string
  resort_id: string
  season: string
  period: 'low' | 'mid' | 'high'
  rider_type: 'adult' | 'child' | 'senior'
  days: number
  price_ars: number
  price_usd: number
}

export interface EquipmentRental {
  id: string
  resort_id: string
  season: string
  level: 'basic' | 'intermediate' | 'advanced'
  price_per_day_ars: number
  price_per_day_usd: number
}

export interface Lesson {
  id: string
  resort_id: string
  season: string
  type: 'group' | 'private'
  duration_hours: number
  price_ars: number
  price_usd: number
}

export interface AirlineRoute {
  id: string
  airline_name: string
  airline_logo_url: string | null
  origin_code: string
  destination_code: string
  resort_id: string
  deep_link_url: string | null
  google_flights_url: string | null
  is_reliable: boolean
  notes_es: string | null
  notes_en: string | null
}

export interface DrivingRoute {
  id: string
  origin_name: string
  resort_id: string
  distance_km: number
  estimated_hours: number
  toll_estimate_ars: number
  toll_estimate_usd: number
}

export interface FuelConfig {
  id: string
  fuel_price_per_liter_ars: number
  fuel_price_per_liter_usd: number
  avg_consumption_km_per_liter: number
  updated_at: string
}

export interface ExchangeRate {
  id: string
  currency_pair: string
  rate: number
  updated_at: string
}

export interface ResortPhoto {
  id: string
  resort_id: string
  url: string
  alt_es: string
  alt_en: string
  sort_order: number
}

export interface EmailLead {
  id: string
  email: string
  snapshot: Record<string, unknown>
  created_at: string
}

export interface SearchLog {
  id: string
  resort_ids: string[]
  params: Record<string, unknown>
  language: string
  currency: string
  created_at: string
}
