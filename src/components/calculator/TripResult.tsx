import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { resorts } from '../../lib/resorts-data'
import { getEquipmentOptions, type TripCostBreakdown } from '../../lib/pricing-data'

interface Props {
  result: TripCostBreakdown
  skiDays: number
  canAddMore: boolean
  onSaveAndAdd: () => void
  onDone: () => void
  onBack: () => void
}

export default function TripResult({ result, skiDays, canAddMore, onSaveAndAdd, onDone, onBack }: Props) {
  const { t, i18n } = useTranslation()
  const { currency } = useAppContext()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'es'

  const resort = resorts.find(r => r.id === result.resortId)
  if (!resort) return null

  const fmt = (n: number) => {
    if (currency === 'USD') return `US$ ${n.toLocaleString('en-US')}`
    return `$ ${n.toLocaleString('es-AR')}`
  }

  // Get equipment location label
  const eqOptions = getEquipmentOptions(result.resortId)
  const eqOpt = eqOptions.find(o => o.key === result.equipmentLocationKey)
  const eqLabel = result.equipmentLocationKey === 'custom'
    ? (lang === 'es' ? 'Equipo (precio propio)' : 'Equipment (custom price)')
    : eqOpt
      ? `${t('calculator.results.equipment')} (${lang === 'en' ? eqOpt.label_en : eqOpt.label_es})`
      : t('calculator.results.equipment')

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-mountain-900 mb-6">
        {t('calculator.step3Title')}
      </h2>

      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border-2 border-mountain-100 overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-mountain-100">
            <h3 className="text-lg font-display font-bold text-mountain-900">{resort.name}</h3>
            <p className="text-sm text-mountain-500">{lang === 'en' ? resort.city_en : resort.city_es}</p>
            <div className="flex flex-wrap gap-2 mt-3 text-xs text-mountain-500">
              <span className="bg-mountain-50 px-2 py-1 rounded">{skiDays} {lang === 'es' ? 'días' : 'days'}</span>
              <span className="bg-mountain-50 px-2 py-1 rounded">{resort.summit_elevation}m</span>
              <span className="bg-mountain-50 px-2 py-1 rounded">{resort.total_trails} {t('resorts.trails').toLowerCase()}</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="p-5 space-y-3">
            <Row label={t('calculator.results.liftPass')} value={fmt(result.liftPass)} />
            {result.equipment > 0 && <Row label={eqLabel} value={fmt(result.equipment)} />}
            {result.lessons > 0 && <Row label={t('calculator.results.lessons')} value={fmt(result.lessons)} />}
            <Row label={t('calculator.results.transport')} value={fmt(result.transport)} />
            {result.accommodation > 0 && <Row label={t('calculator.results.accommodation')} value={fmt(result.accommodation)} />}

            <div className="border-t border-mountain-100 pt-3 mt-3">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-mountain-900">{t('common.total')}</span>
                <span className="text-xl font-bold text-snow-800">{fmt(result.total)}</span>
              </div>
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-sm text-mountain-500">{t('common.perPerson')}</span>
                <span className="text-sm font-semibold text-mountain-600">{fmt(result.totalPerPerson)}</span>
              </div>
            </div>
          </div>

          {/* Pricing badge */}
          <div className="px-5 pb-3">
            {result.pricesConfirmed ? (
              <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t('calculator.pricesConfirmed')}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                </svg>
                {t('calculator.pricesEstimated')}
              </div>
            )}
          </div>

          {/* View profile link */}
          <div className="px-5 pb-5">
            <Link
              to={`/${lang}/centros/${resort.slug}`}
              className="block text-center text-sm text-snow-700 hover:text-snow-800 font-medium no-underline"
            >
              {t('common.viewProfile')} →
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onBack}
            className="px-5 py-2.5 border-2 border-mountain-200 text-mountain-600 rounded-xl font-semibold hover:bg-mountain-50 transition-colors cursor-pointer text-sm"
          >
            {t('common.back')}
          </button>
          {canAddMore && (
            <button
              onClick={onSaveAndAdd}
              className="px-5 py-2.5 border-2 border-snow-300 text-snow-700 rounded-xl font-semibold hover:bg-snow-50 transition-colors cursor-pointer text-sm"
            >
              {t('calculator.saveAndAdd')}
            </button>
          )}
          <button
            onClick={onDone}
            className="px-6 py-2.5 bg-snow-700 text-white rounded-xl font-semibold hover:bg-snow-800 transition-colors cursor-pointer text-sm"
          >
            {t('calculator.done')}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-mountain-400">{t('common.disclaimer')}</p>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-mountain-600">{label}</span>
      <span className="text-mountain-800 font-medium">{value}</span>
    </div>
  )
}
