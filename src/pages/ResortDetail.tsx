import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppContext } from '../context/AppContext'
import { getResortBySlug, getAirlineRoutesForResort, getDrivingRouteForResort } from '../lib/resorts-data'

export default function ResortDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { t, i18n } = useTranslation()
  const { currency } = useAppContext()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'es'

  const resort = slug ? getResortBySlug(slug) : undefined

  if (!resort) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-mountain-800">Resort not found</h1>
        <Link to={`/${lang}/centros`} className="mt-4 inline-block text-snow-700 underline">
          {t('resorts.title')}
        </Link>
      </div>
    )
  }

  const airlines = getAirlineRoutesForResort(resort.id)
  const driving = getDrivingRouteForResort(resort.id)

  const city = lang === 'en' ? resort.city_en : resort.city_es
  const province = lang === 'en' ? resort.province_en : resort.province_es
  const profile = lang === 'en' ? resort.profile_en : resort.profile_es
  const description = lang === 'en' ? resort.description_en : resort.description_es
  const seasonStart = lang === 'en' ? resort.season_start_en : resort.season_start_es
  const seasonEnd = lang === 'en' ? resort.season_end_en : resort.season_end_es

  const trailTotal = resort.beginner_trails + resort.intermediate_trails + resort.advanced_trails + resort.expert_trails
  const beginnerPct = Math.round((resort.beginner_trails / trailTotal) * 100)
  const intermediatePct = Math.round((resort.intermediate_trails / trailTotal) * 100)
  const advancedPct = Math.round((resort.advanced_trails / trailTotal) * 100)
  const expertPct = 100 - beginnerPct - intermediatePct - advancedPct

  return (
    <div>
      {/* Hero */}
      <div className="h-64 sm:h-80 bg-gradient-to-br from-snow-300 via-snow-200 to-mountain-300 flex items-center justify-center relative">
        <span className="text-8xl opacity-50">🏔️</span>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">{resort.name}</h1>
            <p className="text-white/80 mt-1">{city}, {province}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile */}
        <div className="mb-8">
          <p className="text-lg text-mountain-700 font-medium">{profile}</p>
          <p className="mt-3 text-mountain-600">{description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Mountain Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats grid */}
            <section>
              <h2 className="text-xl font-display font-bold text-mountain-900 mb-4">
                {t('resorts.mountainInfo')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label={t('resorts.baseElevation')} value={`${resort.base_elevation} m`} />
                <StatCard label={t('resorts.summitElevation')} value={`${resort.summit_elevation} m`} />
                <StatCard label={t('resorts.verticalDrop')} value={`${resort.vertical_drop} m`} />
                <StatCard label={t('resorts.lifts')} value={String(resort.total_lifts)} />
                <StatCard label={t('resorts.trails')} value={String(resort.total_trails)} />
                {resort.skiable_area_ha && (
                  <StatCard label={t('resorts.skiableArea')} value={`${resort.skiable_area_ha} ha`} />
                )}
              </div>
            </section>

            {/* Trail difficulty */}
            <section>
              <h2 className="text-xl font-display font-bold text-mountain-900 mb-4">
                {t('resorts.trailsByDifficulty')}
              </h2>
              <div className="space-y-3">
                <TrailBar
                  label={t('resorts.beginner')}
                  count={resort.beginner_trails}
                  pct={beginnerPct}
                  color="bg-green-400"
                />
                <TrailBar
                  label={t('resorts.intermediate')}
                  count={resort.intermediate_trails}
                  pct={intermediatePct}
                  color="bg-blue-400"
                />
                <TrailBar
                  label={t('resorts.advanced')}
                  count={resort.advanced_trails}
                  pct={advancedPct}
                  color="bg-red-500"
                />
                <TrailBar
                  label={t('resorts.expert')}
                  count={resort.expert_trails}
                  pct={expertPct}
                  color="bg-gray-900"
                />
              </div>
            </section>

            {/* Season & Snow */}
            <section>
              <h2 className="text-xl font-display font-bold text-mountain-900 mb-4">
                {t('resorts.season')}
              </h2>
              <div className="bg-white rounded-xl border border-mountain-100 p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-mountain-500">{t('resorts.season')}</span>
                  <span className="text-mountain-800 font-medium">{seasonStart} — {seasonEnd}</span>
                </div>
                {resort.avg_annual_snowfall_cm && (
                  <div className="flex justify-between text-sm">
                    <span className="text-mountain-500">{t('resorts.avgSnowfall')}</span>
                    <span className="text-mountain-800 font-medium">{resort.avg_annual_snowfall_cm} cm</span>
                  </div>
                )}
              </div>
            </section>

            {/* How to get there */}
            <section>
              <h2 className="text-xl font-display font-bold text-mountain-900 mb-4">
                {t('resorts.howToGetThere')}
              </h2>

              {/* Airlines */}
              {airlines.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-mountain-700 mb-3">{t('resorts.byFlight')}</h3>
                  <div className="space-y-2">
                    {airlines.map((route) => {
                      const notes = lang === 'en' ? route.notes_en : route.notes_es
                      return (
                        <div
                          key={route.id}
                          className="bg-white rounded-lg border border-mountain-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                          <div>
                            <span className="font-medium text-mountain-800">{route.airline_name}</span>
                            <span className="text-mountain-400 mx-2">·</span>
                            <span className="text-sm text-mountain-500">
                              {route.origin_code} → {route.destination_code}
                            </span>
                            {!route.is_reliable && (
                              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                {t('resorts.unreliable')}
                              </span>
                            )}
                            {notes && (
                              <p className="text-xs text-mountain-400 mt-1">{notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {route.deep_link_url && (
                              <a
                                href={route.deep_link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-3 py-1.5 border border-mountain-200 rounded-lg text-mountain-600 hover:bg-mountain-50 no-underline"
                              >
                                {route.airline_name}
                              </a>
                            )}
                            {route.google_flights_url && (
                              <a
                                href={route.google_flights_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-3 py-1.5 bg-snow-700 text-white rounded-lg hover:bg-snow-800 no-underline"
                              >
                                {t('resorts.googleFlights')}
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Driving */}
              {driving && (
                <div>
                  <h3 className="text-sm font-semibold text-mountain-700 mb-3">{t('resorts.byCar')}</h3>
                  <div className="bg-white rounded-lg border border-mountain-100 p-4">
                    <p className="font-medium text-mountain-800">{t('resorts.fromBuenosAires')}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-mountain-600">
                      <span>{driving.distance_km} {t('resorts.km')}</span>
                      <span>~{driving.estimated_hours} {t('resorts.hours')}</span>
                      <span>
                        {t('resorts.tolls')}: {currency === 'USD'
                          ? `US$ ${driving.toll_estimate_usd}`
                          : `$ ${driving.toll_estimate_ars.toLocaleString('es-AR')}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Column 2: Sidebar */}
          <div className="space-y-6">
            {/* Official Links */}
            <section className="bg-white rounded-xl border border-mountain-100 p-5">
              <h3 className="text-lg font-display font-bold text-mountain-900 mb-4">
                {t('resorts.officialLinks')}
              </h3>
              <div className="space-y-2">
                <ExternalLink href={resort.website_url} label={t('resorts.website')} />
                {resort.trail_map_url && <ExternalLink href={resort.trail_map_url} label={t('resorts.trailMap')} />}
                {resort.webcam_url && <ExternalLink href={resort.webcam_url} label={t('resorts.webcam')} />}
                {resort.instagram_url && <ExternalLink href={resort.instagram_url} label={t('resorts.instagram')} />}
                {resort.facebook_url && <ExternalLink href={resort.facebook_url} label={t('resorts.facebook')} />}
              </div>
            </section>

            {/* Quick Facts */}
            <section className="bg-white rounded-xl border border-mountain-100 p-5">
              <h3 className="text-lg font-display font-bold text-mountain-900 mb-4">
                {t('resorts.nearestAirport')}
              </h3>
              <p className="text-mountain-700 font-medium">{resort.airport_code}</p>
              <p className="text-sm text-mountain-500 mt-1">{city}</p>
            </section>

            {/* CTA */}
            <Link
              to={`/${lang}/calculador?resort=${resort.slug}`}
              className="block w-full text-center px-6 py-3 bg-snow-700 text-white rounded-xl font-semibold hover:bg-snow-800 transition-colors no-underline"
            >
              {t('resorts.calculateTripTo', { resort: resort.name })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-mountain-100 p-4 text-center">
      <div className="text-2xl font-bold text-snow-800">{value}</div>
      <div className="text-xs text-mountain-500 mt-1">{label}</div>
    </div>
  )
}

function TrailBar({ label, count, pct, color }: { label: string; count: number; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-mountain-700">{label}</span>
        <span className="text-mountain-500">{count}</span>
      </div>
      <div className="h-3 bg-mountain-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-snow-700 hover:text-snow-800 py-1.5 no-underline"
    >
      <span>↗</span>
      <span>{label}</span>
    </a>
  )
}
