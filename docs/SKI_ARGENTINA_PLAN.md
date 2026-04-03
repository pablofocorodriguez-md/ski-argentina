# SKI ARGENTINA — Plan de desarrollo

## Visión del producto

Herramienta web bilingüe (ES/EN) para planificar y comparar costos de viajes de ski a centros argentinos. Pensada para dos audiencias:

1. **Argentinos** (principalmente de Buenos Aires y ciudades grandes) que planifican un ski week y necesitan comparar costos entre centros
2. **Extranjeros** que quieren esquiar en Argentina y no encuentran info consolidada en inglés

El sitio tiene dos funciones principales:
- **Calculador/comparador de costos** — el usuario elige centros, carga parámetros, y obtiene un desglose estimado de cuánto sale el viaje
- **Fichas informativas de cada centro** — info de montaña, pistas, elevación, nieve histórica, cómo llegar, aerolíneas

### Filosofía
- Side project / hobby, no startup
- MVP mínimo: mejor algo simple y útil que algo ambicioso y roto
- Datos cargados manualmente, actualizados por temporada
- Sin registro obligatorio
- Captura de email solo opcional (PDF del resumen al mail)
- Diseñado para crecer: sponsoreos de centros, hoteles, rentals eventualmente

---

## Stack técnico

- **Frontend**: React (Vite) + TypeScript
- **Styling**: Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Hosting**: Netlify
- **i18n**: react-i18next (ES/EN desde el día 1)
- **Mapas/distancias**: Google Maps API (Distance Matrix para cálculo de ruta en auto)
- **PDF**: generación client-side o Edge Function (a definir)
- **Analytics**: search_logs en Supabase + opcional Plausible/Umami

---

## Base de datos

El schema completo está en `ski_schema.sql`. Las tablas principales son:

### Tablas de contenido (lectura pública)
- `resorts` — los 7 centros del MVP (Catedral, Las Leñas, Chapelco, Cerro Castor, Cerro Bayo, La Hoya, Caviahue)
- `lift_passes` — tarifas de pases por temporada, período, tipo de rider, cantidad de días
- `equipment_rental` — rental de equipo por nivel
- `lessons` — clases grupales y privadas
- `airline_routes` — qué aerolíneas vuelan a cada destino, con deep links
- `driving_routes` — rutas en auto precargadas para orígenes comunes
- `fuel_config` — precio de nafta y consumo promedio para cálculo de combustible
- `resort_photos` — fotos de cada centro
- `exchange_rates` — tipo de cambio USD/ARS
- `accommodation_ranges` — rangos de alojamiento (segunda etapa, tabla lista pero no se usa en MVP)

### Tablas de escritura (anónima)
- `email_leads` — mails capturados con snapshot del cálculo
- `search_logs` — cada búsqueda para analytics

---

## Flujo del usuario

### Paso 1: Selección de centros
- Grilla de cards con los 7 centros disponibles
- Cada card muestra: nombre, ciudad cercana, ícono
- El usuario puede seleccionar 1, 2, o 3 centros para comparar
- Cards con estado: no seleccionado (dashed border) / seleccionado (solid, highlight)
- Botón "Siguiente" → Paso 2

### Paso 2: Parámetros del viaje
- **Días de ski**: selector 1-14
- **Adultos**: selector 1-6
- **Menores**: selector 0-4
- **Período**: temporada baja / media / alta
- **Rental de equipo**: No / Básico / Intermedio / Avanzado
- **Clases**: No / Grupal / Privada
- **Transporte**: toggle Vuelo / Auto
  - Si **Vuelo**: campo de input manual para que el usuario ponga su precio. Al lado, links a aerolíneas que vuelan a ese destino (datos de `airline_routes`). Deep link a Google Flights prearmado.
  - Si **Auto**: campo "¿De dónde salís?" (input libre, geocodificado con Google Maps API). Se calcula: distancia × consumo × precio nafta + peajes estimados. Ida y vuelta.
- **Alojamiento**: campo de input manual para que el usuario ponga su precio por noche. (En segunda etapa: rangos estimados o integración con proveedores)
- Botón "Calcular" → Paso 3

### Paso 3: Resultado comparativo
- Si comparó 1 centro: card único con desglose
- Si comparó 2-3 centros: cards lado a lado
- Cada card muestra:
  - Nombre del centro y ubicación
  - Desglose línea por línea (pases, rental, clases, transporte, alojamiento)
  - **Total estimado**
  - **Total por persona**
  - Tags de info rápida del centro (km pistas, cota máxima, cantidad de medios)
  - Botón "Ver ficha completa" → abre la ficha del centro
- Si hay más de un centro: banner con la diferencia de precio
- Botones:
  - "Modificar parámetros" → vuelve al Paso 2
  - "Mandar resumen al mail" → abre modal (Paso 4)

### Paso 4: Modal de PDF al mail
- Input de email
- Texto: "Te mandamos un PDF con el desglose de costos y la ficha de cada centro"
- Disclaimer: "Sin spam. Solo tu resumen."
- Al enviar: se guarda en `email_leads` con el snapshot de parámetros y se genera/envía PDF
- El usuario NO necesita poner el mail para ver los resultados — todo está en pantalla

### Ficha del centro (página individual)
- Hero con foto
- Info de montaña: cota base/máxima, desnivel, pistas por dificultad, medios de elevación
- Temporada típica y nieve histórica
- Perfil (familias, avanzado, freeride, etc.)
- Cómo llegar: aerolíneas con links, distancia en auto desde BUE
- Links oficiales: web del centro, mapa de pistas, webcam
- Botón "Calcular viaje a este centro" → va al calculador con ese centro preseleccionado

---

## Aerolíneas

Las 4 aerolíneas que operan rutas relevantes:

| Aerolínea | Rutas ski principales | Notas |
|---|---|---|
| Aerolíneas Argentinas | BUE-BRC (Bariloche), BUE-USH (Ushuaia), BUE-CPC (Chapelco), BUE-AFA (San Rafael) | Principal carrier |
| Flybondi | BUE-BRC, BUE-USH | Low cost |
| JetSmart | BUE-BRC, BUE-MDZ, BUE-USH | Low cost |
| LADE | Malargüe (irregular) | Flag is_reliable = false. Operación errática, pocas frecuencias |

Para cada ruta se guarda un deep link a la aerolínea y/o Google Flights. El usuario ve: "Estas aerolíneas vuelan a [destino] — consultá precios para tus fechas."

---

## Centros del MVP

| Centro | Ciudad | Provincia | Aeropuerto | Perfil |
|---|---|---|---|---|
| Cerro Catedral | Bariloche | Río Negro | BRC | El más grande, familias + avanzado |
| Las Leñas | Malargüe | Mendoza | MDZ/AFA | Powder, freeride, avanzado |
| Chapelco | San Martín de los Andes | Neuquén | CPC | Familiar, bosque |
| Cerro Castor | Ushuaia | Tierra del Fuego | USH | El más austral, nieve segura |
| Cerro Bayo | Villa La Angostura | Neuquén | BRC | Chico, tranquilo, vistas |
| La Hoya | Esquel | Chubut | EQS | Nieve polvo, económico |
| Caviahue | Caviahue | Neuquén | NQN | Termas + ski, familiar |

Nota: Penitentes NO se incluye como centro de ski (es snowpark). Queda para una segunda etapa con mecánica diferente.

---

## i18n (internacionalización)

- Idioma por defecto: ES
- Toggle ES/EN visible en header
- Toda la UI tiene traducciones en archivos JSON (react-i18next)
- Datos de la DB tienen campos `_es` y `_en`
- El frontend consume el campo correspondiente según idioma activo
- URLs bilingües: `/es/centros/catedral` y `/en/resorts/catedral`

---

## Moneda

- Precios almacenados en ARS y USD en la DB
- El usuario puede togglear entre ARS y USD
- Para extranjeros, default USD
- Tipo de cambio en tabla `exchange_rates`, actualizado manualmente

---

## SEO

- Cada centro tiene su página con URL limpia y meta tags
- El calculador tiene su landing
- Contenido bilingüe indexable
- Target keywords ES: "cuánto sale esquiar en Argentina", "comparar centros de ski", "viaje de ski Las Leñas precio"
- Target keywords EN: "ski Argentina cost", "Argentina ski resort comparison", "how much ski trip Argentina"

---

## Fases de desarrollo

### Fase 1 — Fundación (semana 1-2)
- [ ] Setup proyecto: Vite + React + TypeScript + Tailwind
- [ ] Setup Supabase: crear tablas con schema
- [ ] Setup Netlify: deploy pipeline
- [ ] Setup i18n con react-i18next
- [ ] Layout base: header con toggle idioma/moneda, footer
- [ ] Routing: react-router con rutas bilingües

### Fase 2 — Fichas de centros (semana 2-3)
- [ ] Cargar data de los 7 centros en Supabase
- [ ] Página de listado de centros (grilla con cards)
- [ ] Página individual de cada centro (ficha completa)
- [ ] Cargar aerolíneas por destino
- [ ] Responsive mobile

### Fase 3 — Calculador (semana 3-5)
- [ ] Paso 1: selección de centros
- [ ] Paso 2: formulario de parámetros
- [ ] Integración Google Maps API para cálculo de ruta en auto
- [ ] Lógica de cálculo: pases + rental + clases + transporte + alojamiento
- [ ] Paso 3: resultado comparativo
- [ ] Deep links a aerolíneas y Google Flights
- [ ] Logging de búsquedas en search_logs

### Fase 4 — PDF y email (semana 5-6)
- [ ] Generación de PDF con desglose + ficha del centro
- [ ] Modal de captura de email
- [ ] Envío de PDF por email (Supabase Edge Function + Resend o similar)
- [ ] Guardado en email_leads

### Fase 5 — Polish y lanzamiento (semana 6-7)
- [ ] SEO: meta tags, sitemap, structured data
- [ ] Performance: lazy loading, image optimization
- [ ] Analytics: dashboard básico de búsquedas
- [ ] Testing cross-browser y mobile
- [ ] Landing page con CTA claro
- [ ] Preparar post para Reddit (r/skiing, r/ski, r/travel)

### Fase 6 — Segunda etapa (post-lanzamiento)
- [ ] Alojamiento: rangos estimados o integración con proveedores
- [ ] Snowparks (Penitentes, etc.) con dinámica diferente
- [ ] Pronóstico de nieve (la visión a largo plazo)
- [ ] Espacio para que centros/hoteles/rentals publiquen sus promos
- [ ] PWA para uso mobile

---

## Diseño

### Estética
- Limpio, moderno, con personalidad de montaña sin ser genérico
- Paleta fría: azules, blancos, grises con acentos de color
- Tipografía: una display con carácter para títulos + una sans limpia para cuerpo
- Fotos de montaña como hero pero sin stock genérico — fotos reales de centros argentinos
- Mobile-first

### Principios de UX
- Mínimos clics para llegar al resultado
- Sin registro, sin login, sin fricción
- Toda la info visible en pantalla — el PDF al mail es bonus, no requisito
- Transparencia: "precios orientativos temporada 2026" siempre visible
- Links a fuentes oficiales para verificar

---

## Notas para Claude Code

- El schema SQL está en `ski_schema.sql` — usarlo directamente en Supabase
- Empezar por Fase 1 y 2 antes de tocar el calculador
- No hardcodear centros — todo viene de la DB
- i18n desde el primer componente, no retrofitear
- No intentar scrapear precios de vuelos ni alojamiento — son input manual del usuario
- Google Maps API es el único servicio externo para el cálculo de ruta en auto
- Mantener el código modular: cada paso del calculador es un componente separado
- Supabase client con tipos TypeScript generados desde el schema
