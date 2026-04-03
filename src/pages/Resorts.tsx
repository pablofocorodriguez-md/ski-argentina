import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { resorts } from '../lib/resorts-data'

export default function Resorts() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'es'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl sm:text-4xl font-display font-bold text-mountain-950">
        {t('resorts.title')}
      </h1>
      <p className="mt-2 text-mountain-500 text-lg">{t('resorts.subtitle')}</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {resorts.map((resort) => {
          const city = lang === 'en' ? resort.city_en : resort.city_es
          const province = lang === 'en' ? resort.province_en : resort.province_es

          return (
            <Link
              key={resort.id}
              to={`/${lang}/centros/${resort.slug}`}
              className="group block bg-white rounded-2xl border border-mountain-100 overflow-hidden hover:shadow-lg hover:border-snow-300 transition-all no-underline"
            >
              {/* Photo placeholder */}
              <div className="h-48 bg-gradient-to-br from-snow-200 to-mountain-200 flex items-center justify-center">
                <span className="text-6xl">🏔️</span>
              </div>

              <div className="p-5">
                <h2 className="text-xl font-display font-bold text-mountain-900 group-hover:text-snow-700 transition-colors">
                  {resort.name}
                </h2>
                <p className="text-sm text-mountain-500 mt-1">
                  {city}, {province}
                </p>

                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-mountain-600">
                    <span className="text-base">⛰️</span>
                    <span>{resort.summit_elevation} m</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-mountain-600">
                    <span className="text-base">🎿</span>
                    <span>{resort.total_trails} {t('resorts.trails').toLowerCase()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-mountain-600">
                    <span className="text-base">🚡</span>
                    <span>{resort.total_lifts} {t('resorts.lifts').toLowerCase()}</span>
                  </div>
                  {resort.skiable_area_ha && (
                    <div className="flex items-center gap-1.5 text-mountain-600">
                      <span className="text-base">📐</span>
                      <span>{resort.skiable_area_ha} ha</span>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-sm text-mountain-500 line-clamp-2">
                  {lang === 'en' ? resort.profile_en : resort.profile_es}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
