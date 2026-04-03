import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { resorts } from '../../lib/resorts-data'
import { getEquipmentOptions, type TripWithResult } from '../../lib/pricing-data'

interface Props {
  trips: TripWithResult[]
  onModify: (index: number) => void
  onDelete: (index: number) => void
  onBack: () => void
}

export default function TripComparison({ trips, onModify, onDelete, onBack }: Props) {
  const { t, i18n } = useTranslation()
  const { currency } = useAppContext()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'es'

  const fmt = (n: number) => {
    if (currency === 'USD') return `US$ ${n.toLocaleString('en-US')}`
    return `$ ${n.toLocaleString('es-AR')}`
  }

  const totals = trips.map(tw => tw.result.total)
  const minTotal = Math.min(...totals)
  const maxTotal = Math.max(...totals)
  const hasDifference = maxTotal > minTotal

  // Detect same-resort comparisons
  const resortIds = trips.map(tw => tw.trip.resortId)
  const hasDuplicateResort = new Set(resortIds).size < resortIds.length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-mountain-900">
          {t('common.compare')}
        </h2>
        <button
          onClick={onBack}
          className="text-sm text-snow-700 hover:text-snow-800 font-medium cursor-pointer"
        >
          ← {t('common.back')}
        </button>
      </div>

      {hasDifference && (
        <div className="bg-snow-50 border border-snow-200 rounded-xl p-4 mb-6 text-center">
          <span className="text-snow-800 font-semibold">{t('calculator.results.priceDifference')}:</span>
          <span className="ml-2 text-snow-700 font-bold text-lg">{fmt(maxTotal - minTotal)}</span>
        </div>
      )}

      <div className={`grid gap-6 ${
        trips.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
      }`}>
        {trips.map((tw, idx) => {
          const { trip, result } = tw
          const resort = resorts.find(r => r.id === result.resortId)
          if (!resort) return null
          const isCheapest = trips.length > 1 && result.total === minTotal
          const isSameResortDiffDate = hasDuplicateResort
            && resortIds.filter(id => id === trip.resortId).length > 1

          // Equipment label
          const eqOptions = getEquipmentOptions(result.resortId)
          const eqOpt = eqOptions.find(o => o.key === result.equipmentLocationKey)
          const eqLabel = result.equipmentLocationKey === 'custom'
            ? (lang === 'es' ? 'Equipo (precio propio)' : 'Equipment (custom)')
            : eqOpt
              ? `${t('calculator.results.equipment')} (${lang === 'en' ? eqOpt.label_en : eqOpt.label_es})`
              : t('calculator.results.equipment')

          return (
            <div
              key={trip.id}
              className={`bg-white rounded-2xl border-2 overflow-hidden ${
                isCheapest ? 'border-green-400 shadow-lg' : 'border-mountain-100'
              }`}
            >
              {/* Header */}
              <div className="p-5 border-b border-mountain-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-display font-bold text-mountain-900">{resort.name}</h3>
                    <p className="text-sm text-mountain-500">{lang === 'en' ? resort.city_en : resort.city_es}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isCheapest && (
                      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                        {lang === 'es' ? 'Más barato' : 'Cheapest'}
                      </span>
                    )}
                    {isSameResortDiffDate && (
                      <span className="text-[10px] bg-snow-100 text-snow-600 px-2 py-0.5 rounded-full">
                        {t('calculator.sameResortBadge')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 text-xs text-mountain-500">
                  <span className="bg-mountain-50 px-2 py-1 rounded">{trip.skiDays} {lang === 'es' ? 'días' : 'days'}</span>
                  {trip.startDate && <span className="bg-mountain-50 px-2 py-1 rounded">{trip.startDate}</span>}
                  <span className="bg-mountain-50 px-2 py-1 rounded">{resort.summit_elevation}m</span>
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

              {/* Actions */}
              <div className="px-5 pb-5 flex gap-2">
                <button
                  onClick={() => onModify(idx)}
                  className="flex-1 py-2 text-sm font-medium text-snow-700 border border-snow-200 rounded-lg hover:bg-snow-50 cursor-pointer"
                >
                  {t('calculator.editTrip')}
                </button>
                <button
                  onClick={() => onDelete(idx)}
                  className="py-2 px-3 text-sm text-mountain-400 border border-mountain-100 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-center text-xs text-mountain-400">{t('common.disclaimer')}</p>
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
