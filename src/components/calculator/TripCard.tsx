import { useTranslation } from 'react-i18next'
import { useAppContext } from '../../context/AppContext'
import { resorts } from '../../lib/resorts-data'
import { getPeriodLabel } from '../../lib/season'
import type { TripWithResult } from '../../lib/pricing-data'

interface Props {
  tripWithResult: TripWithResult
  onEdit: () => void
  onDelete: () => void
}

export default function TripCard({ tripWithResult, onEdit, onDelete }: Props) {
  const { t, i18n } = useTranslation()
  const { currency } = useAppContext()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'es'

  const { trip, result } = tripWithResult
  const resort = resorts.find(r => r.id === trip.resortId)
  if (!resort) return null

  const fmt = (n: number) => {
    if (currency === 'USD') return `US$ ${n.toLocaleString('en-US')}`
    return `$ ${n.toLocaleString('es-AR')}`
  }

  const periodLabel = getPeriodLabel(trip.period, lang)
  const people = trip.adults + trip.children

  return (
    <div className="bg-white rounded-xl border-2 border-mountain-100 p-5 hover:border-snow-200 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display font-bold text-mountain-900">{resort.name}</h3>
          <p className="text-sm text-mountain-500 mt-0.5">
            {lang === 'en' ? resort.city_en : resort.city_es}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-snow-800">{fmt(result.total)}</div>
          <div className="text-xs text-mountain-500">{fmt(result.totalPerPerson)} {t('common.perPerson')}</div>
        </div>
      </div>

      <p className="text-xs text-mountain-400 mt-3">
        {t('calculator.tripSummary', { days: trip.skiDays, people, period: periodLabel })}
      </p>

      {trip.startDate && trip.endDate && (
        <p className="text-xs text-mountain-400 mt-1">
          {trip.startDate} → {trip.endDate}
        </p>
      )}

      {/* Pricing badge */}
      <div className="mt-3">
        {result.pricesConfirmed ? (
          <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded">
            {t('calculator.pricesConfirmed')}
          </span>
        ) : (
          <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
            {t('calculator.pricesEstimatedShort')}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={onEdit}
          className="flex-1 py-2 text-sm font-medium text-snow-700 border border-snow-200 rounded-lg hover:bg-snow-50 transition-colors cursor-pointer"
        >
          {t('calculator.editTrip')}
        </button>
        <button
          onClick={onDelete}
          className="py-2 px-3 text-sm text-mountain-400 border border-mountain-100 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
        >
          {t('calculator.deleteTrip')}
        </button>
      </div>
    </div>
  )
}
