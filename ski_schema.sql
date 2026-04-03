-- ============================================================
-- SKI TRIP COST CALCULATOR — SUPABASE SCHEMA
-- Argentine Ski Resorts
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- 0. Extensions
-- gen_random_uuid() is available by default in Supabase (pgcrypto)

-- ============================================================
-- 1. TABLES
-- ============================================================

-- 1.1 resorts
CREATE TABLE resorts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text        NOT NULL UNIQUE,
  name            text        NOT NULL,
  name_en         text        NOT NULL,
  city_es         text        NOT NULL,
  city_en         text        NOT NULL,
  province_es     text        NOT NULL,
  province_en     text        NOT NULL,
  airport_code    text        NOT NULL,
  latitude        numeric     NOT NULL,
  longitude       numeric     NOT NULL,
  base_elevation      integer NOT NULL,
  summit_elevation    integer NOT NULL,
  vertical_drop       integer NOT NULL,
  total_trails        integer NOT NULL,
  beginner_trails     integer NOT NULL,
  intermediate_trails integer NOT NULL,
  advanced_trails     integer NOT NULL,
  total_lifts         integer NOT NULL,
  skiable_area_ha     integer,
  season_start_es text NOT NULL,
  season_start_en text NOT NULL,
  season_end_es   text NOT NULL,
  season_end_en   text NOT NULL,
  avg_annual_snowfall_cm integer,
  profile_es      text NOT NULL,
  profile_en      text NOT NULL,
  description_es  text NOT NULL,
  description_en  text NOT NULL,
  website_url     text NOT NULL,
  trail_map_url   text,
  webcam_url      text,
  google_maps_url text NOT NULL,
  hero_image_url  text,
  instagram_url   text,
  facebook_url    text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 1.2 lift_passes
CREATE TABLE lift_passes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id   uuid        NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  season      text        NOT NULL,
  period      text        NOT NULL CHECK (period IN ('low', 'mid', 'high')),
  rider_type  text        NOT NULL CHECK (rider_type IN ('adult', 'child', 'senior')),
  days        integer     NOT NULL CHECK (days BETWEEN 1 AND 14),
  price_ars   numeric     NOT NULL,
  price_usd   numeric     NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 1.3 equipment_rental
CREATE TABLE equipment_rental (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id           uuid        NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  season              text        NOT NULL,
  level               text        NOT NULL CHECK (level IN ('basic', 'intermediate', 'advanced')),
  price_per_day_ars   numeric     NOT NULL,
  price_per_day_usd   numeric     NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- 1.4 lessons
CREATE TABLE lessons (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id       uuid        NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  season          text        NOT NULL,
  type            text        NOT NULL CHECK (type IN ('group', 'private')),
  duration_hours  numeric     NOT NULL,
  price_ars       numeric     NOT NULL,
  price_usd       numeric     NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 1.5 airline_routes
CREATE TABLE airline_routes (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  airline_name      text        NOT NULL,
  airline_logo_url  text,
  origin_code       text        NOT NULL,
  destination_code  text        NOT NULL,
  resort_id         uuid        NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  deep_link_url     text,
  google_flights_url text,
  is_reliable       boolean     NOT NULL DEFAULT true,
  notes_es          text,
  notes_en          text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- 1.6 driving_routes
CREATE TABLE driving_routes (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_name       text        NOT NULL,
  resort_id         uuid        NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  distance_km       numeric     NOT NULL,
  estimated_hours   numeric     NOT NULL,
  toll_estimate_ars numeric     NOT NULL,
  toll_estimate_usd numeric     NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- 1.7 fuel_config
CREATE TABLE fuel_config (
  id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  fuel_price_per_liter_ars    numeric     NOT NULL,
  fuel_price_per_liter_usd    numeric     NOT NULL,
  avg_consumption_km_per_liter numeric    NOT NULL DEFAULT 10,
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- 1.8 exchange_rates
CREATE TABLE exchange_rates (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_pair   text        NOT NULL,
  rate            numeric     NOT NULL,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 1.9 resort_photos
CREATE TABLE resort_photos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id   uuid        NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  url         text        NOT NULL,
  alt_es      text        NOT NULL,
  alt_en      text        NOT NULL,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 1.10 accommodation_ranges
CREATE TABLE accommodation_ranges (
  id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id                   uuid        NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  season                      text        NOT NULL,
  type_es                     text        NOT NULL,
  type_en                     text        NOT NULL,
  price_per_night_low_ars     numeric     NOT NULL,
  price_per_night_high_ars    numeric     NOT NULL,
  price_per_night_low_usd     numeric     NOT NULL,
  price_per_night_high_usd    numeric     NOT NULL,
  created_at                  timestamptz NOT NULL DEFAULT now()
);

-- 1.11 email_leads
CREATE TABLE email_leads (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        NOT NULL,
  snapshot    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 1.12 search_logs
CREATE TABLE search_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_ids  text[]      NOT NULL,
  params      jsonb,
  language    text        NOT NULL,
  currency    text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX idx_lift_passes_resort_id       ON lift_passes(resort_id);
CREATE INDEX idx_equipment_rental_resort_id  ON equipment_rental(resort_id);
CREATE INDEX idx_lessons_resort_id           ON lessons(resort_id);
CREATE INDEX idx_airline_routes_resort_id    ON airline_routes(resort_id);
CREATE INDEX idx_driving_routes_resort_id    ON driving_routes(resort_id);
CREATE INDEX idx_resort_photos_resort_id     ON resort_photos(resort_id);
CREATE INDEX idx_accommodation_ranges_resort ON accommodation_ranges(resort_id);
CREATE INDEX idx_resorts_slug                ON resorts(slug);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on every table
ALTER TABLE resorts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE lift_passes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_rental     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons              ENABLE ROW LEVEL SECURITY;
ALTER TABLE airline_routes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE driving_routes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_config          ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE resort_photos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs          ENABLE ROW LEVEL SECURITY;

-- Public READ policies on content tables
CREATE POLICY "Public read resorts"              ON resorts              FOR SELECT USING (true);
CREATE POLICY "Public read lift_passes"          ON lift_passes          FOR SELECT USING (true);
CREATE POLICY "Public read equipment_rental"     ON equipment_rental     FOR SELECT USING (true);
CREATE POLICY "Public read lessons"              ON lessons              FOR SELECT USING (true);
CREATE POLICY "Public read airline_routes"       ON airline_routes       FOR SELECT USING (true);
CREATE POLICY "Public read driving_routes"       ON driving_routes       FOR SELECT USING (true);
CREATE POLICY "Public read fuel_config"          ON fuel_config          FOR SELECT USING (true);
CREATE POLICY "Public read exchange_rates"       ON exchange_rates       FOR SELECT USING (true);
CREATE POLICY "Public read resort_photos"        ON resort_photos        FOR SELECT USING (true);
CREATE POLICY "Public read accommodation_ranges" ON accommodation_ranges FOR SELECT USING (true);

-- Public INSERT policies on anonymous-write tables
CREATE POLICY "Public insert email_leads" ON email_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert search_logs" ON search_logs FOR INSERT WITH CHECK (true);

-- ============================================================
-- 4. SEED DATA — RESORTS
-- ============================================================

INSERT INTO resorts (
  slug, name, name_en, city_es, city_en, province_es, province_en,
  airport_code, latitude, longitude,
  base_elevation, summit_elevation, vertical_drop,
  total_trails, beginner_trails, intermediate_trails, advanced_trails,
  total_lifts, skiable_area_ha,
  season_start_es, season_start_en, season_end_es, season_end_en,
  avg_annual_snowfall_cm,
  profile_es, profile_en,
  description_es, description_en,
  website_url, trail_map_url, webcam_url, google_maps_url, hero_image_url,
  instagram_url, facebook_url
) VALUES

-- 1. Cerro Catedral
(
  'cerro-catedral',
  'Cerro Catedral',
  'Cerro Catedral',
  'San Carlos de Bariloche', 'San Carlos de Bariloche',
  'Río Negro', 'Río Negro',
  'BRC', -41.1647, -71.4411,
  1030, 2100, 1070,
  120, 30, 50, 40,
  39, 600,
  'Mediados de junio', 'Mid-June',
  'Principios de octubre', 'Early October',
  400,
  'El centro de esquí más grande de Sudamérica, ideal para todos los niveles.',
  'The largest ski resort in South America, suitable for all skill levels.',
  'Cerro Catedral ofrece más de 120 pistas y 39 medios de elevación en la Patagonia argentina. Su amplia infraestructura incluye escuelas de esquí, gastronomía de montaña, y una vibrante vida nocturna en la base. La vista al Lago Nahuel Huapi es espectacular.',
  'Cerro Catedral offers over 120 trails and 39 lifts in Argentine Patagonia. Its extensive infrastructure includes ski schools, mountain dining, and vibrant nightlife at the base. The views over Nahuel Huapi Lake are spectacular.',
  'https://catedralaltapatagonia.com/',
  'https://catedralaltapatagonia.com/mapa-de-pistas',
  'https://catedralaltapatagonia.com/webcams',
  'https://maps.google.com/?q=-41.1647,-71.4411',
  NULL,
  'https://www.instagram.com/cerrocatedralok/',
  'https://www.facebook.com/cerrocatedral/'
),

-- 2. Las Leñas
(
  'las-lenas',
  'Las Leñas',
  'Las Leñas',
  'Malargüe', 'Malargüe',
  'Mendoza', 'Mendoza',
  'MDZ', -35.1636, -70.0708,
  2240, 3430, 1190,
  52, 8, 18, 26,
  14, 450,
  'Mediados de junio', 'Mid-June',
  'Principios de octubre', 'Early October',
  350,
  'Terreno extremo y nieve polvo de clase mundial para esquiadores avanzados.',
  'Extreme terrain and world-class powder snow for advanced skiers.',
  'Las Leñas es famoso por su terreno fuera de pista y nieve polvo de excelente calidad. Con el desnivel esquiable más grande de Argentina y pistas empinadas de nivel avanzado, atrae a esquiadores expertos de todo el mundo. El resort ofrece alojamiento ski-in/ski-out.',
  'Las Leñas is famous for its off-piste terrain and excellent powder snow quality. With the highest vertical drop in Argentina and steep advanced runs, it attracts expert skiers from around the world. The resort offers ski-in/ski-out accommodation.',
  'https://laslenas.com/',
  'https://laslenas.com/mapa-de-pistas',
  NULL,
  'https://maps.google.com/?q=-35.1636,-70.0708',
  NULL,
  'https://www.instagram.com/laslenasresort/',
  'https://www.facebook.com/laslenasresort/'
),

-- 3. Chapelco
(
  'chapelco',
  'Chapelco',
  'Chapelco',
  'San Martín de los Andes', 'San Martín de los Andes',
  'Neuquén', 'Neuquén',
  'CPC', -40.1978, -71.2614,
  1250, 1980, 730,
  31, 8, 13, 10,
  12, 140,
  'Mediados de junio', 'Mid-June',
  'Finales de septiembre', 'Late September',
  300,
  'Centro familiar con excelente infraestructura y vistas al Lago Lácar.',
  'Family-friendly resort with excellent infrastructure and views of Lácar Lake.',
  'Chapelco combina pistas bien mantenidas con un entorno natural excepcional. Es ideal para familias y esquiadores intermedios, con un parque de nieve para snowboard y actividades para niños. La encantadora ciudad de San Martín de los Andes queda a solo 19 km.',
  'Chapelco combines well-groomed trails with an exceptional natural setting. It is ideal for families and intermediate skiers, with a snow park for snowboarders and kids activities. The charming town of San Martín de los Andes is just 19 km away.',
  'https://www.cerro-chapelco.com.ar/',
  'https://www.cerro-chapelco.com.ar/mapa-de-pistas',
  'https://www.cerro-chapelco.com.ar/webcams',
  'https://maps.google.com/?q=-40.1978,-71.2614',
  NULL,
  'https://www.instagram.com/cerro_chapelco/',
  'https://www.facebook.com/cerrochapelco/'
),

-- 4. Cerro Castor
(
  'cerro-castor',
  'Cerro Castor',
  'Cerro Castor',
  'Ushuaia', 'Ushuaia',
  'Tierra del Fuego', 'Tierra del Fuego',
  'USH', -54.7503, -68.3172,
  195, 1057, 862,
  34, 10, 14, 10,
  13, 80,
  'Finales de junio', 'Late June',
  'Mediados de octubre', 'Mid-October',
  450,
  'El centro de esquí más austral del mundo con la temporada más larga de Argentina.',
  'The southernmost ski resort in the world with the longest season in Argentina.',
  'Cerro Castor, a solo 26 km de Ushuaia, ofrece la temporada más larga del país gracias a su ubicación austral y bajas temperaturas. Sus pistas están bien distribuidas para todos los niveles y la calidad de nieve es consistente durante toda la temporada.',
  'Cerro Castor, just 26 km from Ushuaia, offers the longest season in the country thanks to its southern location and low temperatures. Its trails are well distributed across all levels and snow quality is consistent throughout the season.',
  'https://www.cerrocastor.com/',
  'https://www.cerrocastor.com/mapa-de-pistas',
  'https://www.cerrocastor.com/webcams',
  'https://maps.google.com/?q=-54.7503,-68.3172',
  NULL,
  'https://www.instagram.com/cerrocastor/',
  'https://www.facebook.com/cerrocastor/'
),

-- 5. Cerro Bayo
(
  'cerro-bayo',
  'Cerro Bayo',
  'Cerro Bayo',
  'Villa La Angostura', 'Villa La Angostura',
  'Neuquén', 'Neuquén',
  'BRC', -40.7833, -71.6167,
  1050, 1782, 732,
  24, 7, 10, 7,
  11, 200,
  'Mediados de junio', 'Mid-June',
  'Finales de septiembre', 'Late September',
  350,
  'Centro boutique rodeado de bosques con una experiencia exclusiva y tranquila.',
  'Boutique resort surrounded by forests offering an exclusive, peaceful experience.',
  'Cerro Bayo es un centro de esquí boutique con vistas panorámicas al Lago Nahuel Huapi y rodeado de bosques de lengas. Perfecto para quienes buscan una experiencia más tranquila e íntima que los centros más grandes. Villa La Angostura es una pintoresca villa de montaña.',
  'Cerro Bayo is a boutique ski resort with panoramic views of Nahuel Huapi Lake and surrounded by lenga forests. Perfect for those seeking a quieter, more intimate experience than larger resorts. Villa La Angostura is a picturesque mountain village.',
  'https://www.cerrobayo.com.ar/',
  'https://www.cerrobayo.com.ar/mapa-de-pistas',
  NULL,
  'https://maps.google.com/?q=-40.7833,-71.6167',
  NULL,
  'https://www.instagram.com/cerrobayoski/',
  'https://www.facebook.com/cerrobayo/'
),

-- 6. La Hoya
(
  'la-hoya',
  'La Hoya',
  'La Hoya',
  'Esquel', 'Esquel',
  'Chubut', 'Chubut',
  'EQS', -42.8167, -71.2500,
  1350, 2075, 725,
  24, 6, 10, 8,
  9, 60,
  'Mediados de junio', 'Mid-June',
  'Finales de septiembre', 'Late September',
  300,
  'Centro accesible con excelente nieve polvo y ambiente familiar sin pretensiones.',
  'Affordable resort with excellent powder snow and an unpretentious family atmosphere.',
  'La Hoya es conocido por su excelente calidad de nieve polvo gracias a la orientación de sus laderas. Es uno de los centros más accesibles económicamente de Argentina y ofrece un ambiente relajado y familiar. Esquel, con su encanto patagónico, está a solo 13 km.',
  'La Hoya is known for its excellent powder snow quality thanks to the orientation of its slopes. It is one of the most affordable ski resorts in Argentina and offers a relaxed, family atmosphere. Esquel, with its Patagonian charm, is just 13 km away.',
  'https://www.skilahoya.com.ar/',
  NULL,
  NULL,
  'https://maps.google.com/?q=-42.8167,-71.2500',
  NULL,
  'https://www.instagram.com/camlahoya/',
  'https://www.facebook.com/skilahoya/'
),

-- 7. Caviahue
(
  'caviahue',
  'Caviahue',
  'Caviahue',
  'Caviahue', 'Caviahue',
  'Neuquén', 'Neuquén',
  'NQN', -37.8500, -71.0600,
  1647, 2100, 453,
  18, 5, 8, 5,
  8, 50,
  'Finales de junio', 'Late June',
  'Finales de septiembre', 'Late September',
  250,
  'Centro volcánico con termas naturales y paisajes únicos de araucarias.',
  'Volcanic resort with natural hot springs and unique araucaria tree landscapes.',
  'Caviahue se encuentra en las laderas del volcán Copahue, rodeado de bosques de araucarias milenarias. Ofrece una experiencia única combinando esquí con termas naturales. Es un destino tranquilo, ideal para familias que buscan algo diferente y conectado con la naturaleza.',
  'Caviahue sits on the slopes of the Copahue volcano, surrounded by ancient araucaria forests. It offers a unique experience combining skiing with natural hot springs. It is a tranquil destination, ideal for families looking for something different and connected with nature.',
  'https://www.caviahue-skiresort.com/',
  NULL,
  NULL,
  'https://maps.google.com/?q=-37.8500,-71.0600',
  NULL,
  'https://www.instagram.com/caviahueskiresort/',
  'https://www.facebook.com/caviahueskiresort/'
);

-- ============================================================
-- 5. SEED DATA — AIRLINE ROUTES
-- ============================================================

-- Helper: get resort IDs by slug
-- Aerolíneas Argentinas
INSERT INTO airline_routes (airline_name, origin_code, destination_code, resort_id, google_flights_url, notes_es, notes_en)
VALUES
  ('Aerolíneas Argentinas', 'EZE', 'BRC',
    (SELECT id FROM resorts WHERE slug = 'cerro-catedral'),
    'https://www.google.com/travel/flights?q=flights+from+BUE+to+BRC',
    'Vuelos diarios todo el año', 'Daily flights year-round'),
  ('Aerolíneas Argentinas', 'EZE', 'BRC',
    (SELECT id FROM resorts WHERE slug = 'cerro-bayo'),
    'https://www.google.com/travel/flights?q=flights+from+BUE+to+BRC',
    'Vuelos diarios. Villa La Angostura queda a 80 km de Bariloche.', 'Daily flights. Villa La Angostura is 80 km from Bariloche.'),
  ('Aerolíneas Argentinas', 'EZE', 'USH',
    (SELECT id FROM resorts WHERE slug = 'cerro-castor'),
    'https://www.google.com/travel/flights?q=flights+from+BUE+to+USH',
    'Vuelos diarios todo el año', 'Daily flights year-round'),
  ('Aerolíneas Argentinas', 'EZE', 'CPC',
    (SELECT id FROM resorts WHERE slug = 'chapelco'),
    'https://www.google.com/travel/flights?q=flights+from+BUE+to+CPC',
    'Vuelos en temporada de esquí', 'Flights during ski season'),
  ('Aerolíneas Argentinas', 'EZE', 'AFA',
    (SELECT id FROM resorts WHERE slug = 'las-lenas'),
    'https://www.google.com/travel/flights?q=flights+from+BUE+to+AFA',
    'Vuelos a San Rafael; luego 200 km por ruta hasta Las Leñas.', 'Flights to San Rafael; then 200 km drive to Las Leñas.');

-- Flybondi
INSERT INTO airline_routes (airline_name, origin_code, destination_code, resort_id, google_flights_url, notes_es, notes_en)
VALUES
  ('Flybondi', 'EZE', 'BRC',
    (SELECT id FROM resorts WHERE slug = 'cerro-catedral'),
    'https://www.google.com/travel/flights?q=flights+from+BUE+to+BRC',
    'Low cost. Verificar equipaje de esquí.', 'Low cost. Check ski luggage policy.'),
  ('Flybondi', 'EZE', 'BRC',
    (SELECT id FROM resorts WHERE slug = 'cerro-bayo'),
    'https://www.google.com/travel/flights?q=flights+from+BUE+to+BRC',
    'Low cost. Villa La Angostura a 80 km de Bariloche.', 'Low cost. Villa La Angostura is 80 km from Bariloche.'),
  ('Flybondi', 'EZE', 'USH',
    (SELECT id FROM resorts WHERE slug = 'cerro-castor'),
    'https://www.google.com/travel/flights?q=flights+from+BUE+to+USH',
    'Low cost. Verificar equipaje de esquí.', 'Low cost. Check ski luggage policy.');

-- JetSmart
INSERT INTO airline_routes (airline_name, origin_code, destination_code, resort_id, google_flights_url, notes_es, notes_en)
VALUES
  ('JetSmart', 'EZE', 'BRC',
    (SELECT id FROM resorts WHERE slug = 'cerro-catedral'),
    'https://www.google.com/travel/flights?q=flights+from+BUE+to+BRC',
    'Ultra low cost. Equipaje de esquí con cargo adicional.', 'Ultra low cost. Ski luggage has extra charge.'),
  ('JetSmart', 'EZE', 'BRC',
    (SELECT id FROM resorts WHERE slug = 'cerro-bayo'),
    'https://www.google.com/travel/flights?q=flights+from+BUE+to+BRC',
    'Ultra low cost. Villa La Angostura a 80 km.', 'Ultra low cost. Villa La Angostura is 80 km away.'),
  ('JetSmart', 'EZE', 'MDZ',
    (SELECT id FROM resorts WHERE slug = 'las-lenas'),
    'https://www.google.com/travel/flights?q=flights+from+BUE+to+MDZ',
    'Volar a Mendoza y manejar ~450 km hasta Las Leñas.', 'Fly to Mendoza and drive ~450 km to Las Leñas.'),
  ('JetSmart', 'EZE', 'USH',
    (SELECT id FROM resorts WHERE slug = 'cerro-castor'),
    'https://www.google.com/travel/flights?q=flights+from+BUE+to+USH',
    'Ultra low cost. Equipaje de esquí con cargo adicional.', 'Ultra low cost. Ski luggage has extra charge.');

-- LADE (to Malargüe, unreliable)
INSERT INTO airline_routes (airline_name, origin_code, destination_code, resort_id, is_reliable, notes_es, notes_en)
VALUES
  ('LADE', 'EZE', 'LGS',
    (SELECT id FROM resorts WHERE slug = 'las-lenas'),
    false,
    'Servicio militar con frecuencia irregular. Verificar disponibilidad antes de planificar.', 'Military airline with irregular frequency. Verify availability before planning.');

-- ============================================================
-- 6. SEED DATA — FUEL CONFIG
-- ============================================================

INSERT INTO fuel_config (fuel_price_per_liter_ars, fuel_price_per_liter_usd, avg_consumption_km_per_liter)
VALUES (1200, 1.00, 10);

-- ============================================================
-- 7. SEED DATA — EXCHANGE RATES
-- ============================================================

INSERT INTO exchange_rates (currency_pair, rate)
VALUES ('USD_ARS', 1200);

-- ============================================================
-- 8. SEED DATA — DRIVING ROUTES (from Buenos Aires)
-- ============================================================

INSERT INTO driving_routes (origin_name, resort_id, distance_km, estimated_hours, toll_estimate_ars, toll_estimate_usd)
VALUES
  ('Buenos Aires',
    (SELECT id FROM resorts WHERE slug = 'cerro-catedral'),
    1640, 18.5, 45000, 37.50),
  ('Buenos Aires',
    (SELECT id FROM resorts WHERE slug = 'las-lenas'),
    1200, 13.0, 35000, 29.17),
  ('Buenos Aires',
    (SELECT id FROM resorts WHERE slug = 'chapelco'),
    1580, 17.5, 42000, 35.00),
  ('Buenos Aires',
    (SELECT id FROM resorts WHERE slug = 'cerro-castor'),
    3100, 38.0, 55000, 45.83),
  ('Buenos Aires',
    (SELECT id FROM resorts WHERE slug = 'cerro-bayo'),
    1700, 19.0, 45000, 37.50),
  ('Buenos Aires',
    (SELECT id FROM resorts WHERE slug = 'la-hoya'),
    1920, 22.0, 48000, 40.00),
  ('Buenos Aires',
    (SELECT id FROM resorts WHERE slug = 'caviahue'),
    1350, 15.0, 38000, 31.67);

-- ============================================================
-- DONE
-- ============================================================
