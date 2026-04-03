# Ski Argentina — Calculador de costos de ski

Herramienta web bilingüe (ES/EN) para planificar y comparar costos de viajes de ski a centros argentinos.

## Qué hace

- **Calculador de costos**: elegís centros, cargás parámetros (días, personas, equipo, transporte, alojamiento) y obtenés un desglose estimado
- **Comparador**: hasta 3 centros lado a lado
- **Fichas de centros**: info de montaña, pistas, cómo llegar, aerolíneas, links oficiales
- **Bilingüe**: español e inglés con URLs separadas (`/es/`, `/en/`)
- **Doble moneda**: toggle ARS/USD

## Centros incluidos

Cerro Catedral, Las Leñas, Chapelco, Cerro Castor, Cerro Bayo, La Hoya, Caviahue.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- react-i18next (internacionalización)
- react-router-dom (routing bilingüe)
- Supabase (schema listo, datos actuales en JSON local)
- Deploy: Netlify

## Setup

```bash
npm install
npm run dev
```

Copiar `.env.example` a `.env` y completar las variables de Supabase y Google Maps si se van a usar.

## Estructura

```
src/
  components/       # Header, Footer, Layout, calculator steps
  pages/            # Home, Resorts, ResortDetail, Calculator
  context/          # AppContext (moneda)
  i18n/             # Traducciones ES/EN
  lib/              # Lógica de precios, datos de centros, season detection
  types/            # TypeScript types para Supabase
data/
  resorts/          # JSON de cada centro (source of truth actual)
docs/               # Plan del producto, links de centros
ski_schema.sql      # Schema SQL para Supabase (completo con seed data)
```

## Estado actual

MVP funcional. Los precios están cargados como estimados (no verificados contra tarifas oficiales 2026). Los datos vienen de JSONs locales, no de Supabase todavía.
