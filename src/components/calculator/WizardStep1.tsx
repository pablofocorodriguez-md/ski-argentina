import { useTranslation } from 'react-i18next'
import { useAppContext } from '../../context/AppContext'
import { resorts } from '../../lib/resorts-data'
import { arePricesConfirmed, buildPassengers, type Trip } from '../../lib/pricing-data'
import { detectPeriodFromRange, calculateSkiDays, getPeriodLabel } from '../../lib/season'

interface Props {
  trip: Trip
  onChange: (trip: Trip) => void
  onNext: () => void
  onCancel: () => void
}

export default function WizardStep1({ trip, onChange, onNext, onCancel }: Props) {
  const { t, i18n } = useTranslation()
  const { currency } = useAppContext()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'es'
  const currencySymbol = currency === 'USD' ? 'US$' : '$'

  const skiDays = trip.startDate && trip.endDate
    ? calculateSkiDays(trip.startDate, trip.endDate) : trip.skiDays
  const detectedPeriod = trip.startDate && trip.endDate
    ? detectPeriodFromRange(trip.startDate, trip.endDate) : trip.period

  function update(partial: Partial<Trip>) {
    onChange({ ...trip, ...partial, currency })
  }

  function handleStartDate(d: string) {
    const updates: Partial<Trip> = { startDate: d }
    if (d && trip.endDate) {
      updates.skiDays = calculateSkiDays(d, trip.endDate)
      updates.period = detectPeriodFromRange(d, trip.endDate)
    }
    update(updates)
  }

  function handleEndDate(d: string) {
    const updates: Partial<Trip> = { endDate: d }
    if (trip.startDate && d) {
      updates.skiDays = calculateSkiDays(trip.startDate, d)
      updates.period = detectPeriodFromRange(trip.startDate, d)
    }
    update(updates)
  }

  const canProceed = trip.resortId !== '' && skiDays > 0

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-mountain-900 mb-1">
        {t('calculator.step1Title')}
      </h2>
      <p className="text-mountain-500 mb-6">{t('calculator.step1Subtitle')}</p>

      {/* Resort selection grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
        {resorts.map((resort) => {
          const isSelected = trip.resortId === resort.id
          const city = lang === 'en' ? resort.city_en : resort.city_es
          const confirmed = arePricesConfirmed(resort.id)
          return (
            <button
              key={resort.id}
              onClick={() => update({ resortId: resort.id })}
              className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-snow-600 bg-snow-50 shadow-md'
                  : 'border-dashed border-mountain-200 hover:border-snow-300 hover:bg-snow-50/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-mountain-900">{resort.name}</h3>
                  <p className="text-sm text-mountain-500 mt-0.5">{city}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? 'border-snow-600 bg-snow-600 text-white' : 'border-mountain-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-2 text-xs text-mountain-500">
                <span>⛰️ {resort.summit_elevation}m</span>
                <span>🎿 {resort.total_trails}</span>
                <span>🚡 {resort.total_lifts}</span>
              </div>
              {!confirmed && (
                <div className="mt-1.5 text-[10px] text-amber-600 font-medium">
                  {t('calculator.pricesEstimatedShort')}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Trip params */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: dates + people */}
        <div className="space-y-5">
          <Field label={t('calculator.dates')}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-mountain-500 mb-1 block">{t('calculator.startDate')}</label>
                <input
                  type="date"
                  value={trip.startDate ?? ''}
                  onChange={(e) => handleStartDate(e.target.value)}
                  min="2026-06-01" max="2026-10-15"
                  className="w-full px-3 py-2 border border-mountain-200 rounded-lg text-mountain-800 focus:outline-none focus:ring-2 focus:ring-snow-400"
                />
              </div>
              <div>
                <label className="text-xs text-mountain-500 mb-1 block">{t('calculator.endDate')}</label>
                <input
                  type="date"
                  value={trip.endDate ?? ''}
                  onChange={(e) => handleEndDate(e.target.value)}
                  min={trip.startDate || '2026-06-01'} max="2026-10-15"
                  className="w-full px-3 py-2 border border-mountain-200 rounded-lg text-mountain-800 focus:outline-none focus:ring-2 focus:ring-snow-400"
                />
              </div>
            </div>
            {trip.startDate && trip.endDate && skiDays > 0 && (
              <div className="mt-3 flex items-center gap-3 text-sm">
                <span className="bg-snow-100 text-snow-800 px-3 py-1 rounded-full font-medium">
                  {t('calculator.skiDaysCalc', { days: skiDays })}
                </span>
                <span className={`px-3 py-1 rounded-full font-medium ${
                  detectedPeriod === 'high' ? 'bg-red-100 text-red-700'
                  : detectedPeriod === 'mid' ? 'bg-amber-100 text-amber-700'
                  : 'bg-green-100 text-green-700'
                }`}>
                  {t('calculator.detectedPeriod')}: {getPeriodLabel(detectedPeriod, lang)}
                </span>
              </div>
            )}
          </Field>

          {/* Manual fallback: ski days + period */}
          {(!trip.startDate || !trip.endDate) && (
            <Field label={t('calculator.skiDays')}>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={1} max={14}
                  value={trip.skiDays}
                  onChange={(e) => update({ skiDays: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-lg font-semibold text-mountain-800 w-8 text-center">{trip.skiDays}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {(['low', 'mid', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => update({ period: p })}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      trip.period === p
                        ? 'bg-snow-700 text-white'
                        : 'bg-mountain-50 text-mountain-600 hover:bg-mountain-100'
                    }`}
                  >
                    {t(`calculator.period${p.charAt(0).toUpperCase() + p.slice(1)}`)}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {/* People */}
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('calculator.adults')}>
              <NumberStepper value={trip.adults} min={1} max={6} onChange={(v) => update({ adults: v, passengers: buildPassengers(v, trip.children, lang) })} />
            </Field>
            <Field label={t('calculator.children')}>
              <NumberStepper value={trip.children} min={0} max={4} onChange={(v) => update({ children: v, passengers: buildPassengers(trip.adults, v, lang) })} />
            </Field>
          </div>
        </div>

        {/* Right: accommodation */}
        <div className="space-y-5">
          <Field label={t('calculator.accommodation')}>
            <label className="text-sm text-mountain-500">{t('calculator.accommodationPrice')}</label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-mountain-400">{currencySymbol}</span>
              <input
                type="number"
                value={trip.accommodationPerNight || ''}
                onChange={(e) => update({ accommodationPerNight: Number(e.target.value) })}
                placeholder={t('calculator.accommodationHint')}
                className="w-full px-3 py-2 border border-mountain-200 rounded-lg text-mountain-800 focus:outline-none focus:ring-2 focus:ring-snow-400"
              />
            </div>
          </Field>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={onCancel}
          className="px-6 py-3 border-2 border-mountain-200 text-mountain-600 rounded-xl font-semibold hover:bg-mountain-50 transition-colors cursor-pointer"
        >
          {t('common.back')}
        </button>
        <button
          onClick={() => {
            update({ skiDays, period: detectedPeriod })
            onNext()
          }}
          disabled={!canProceed}
          className={`px-8 py-3 rounded-xl font-semibold text-lg transition-colors cursor-pointer ${
            canProceed
              ? 'bg-snow-700 text-white hover:bg-snow-800'
              : 'bg-mountain-200 text-mountain-400 cursor-not-allowed'
          }`}
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-mountain-700 mb-2">{label}</label>
      {children}
    </div>
  )
}

function NumberStepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => value > min && onChange(value - 1)}
        disabled={value <= min}
        className="w-9 h-9 rounded-lg bg-mountain-100 text-mountain-600 font-bold text-lg flex items-center justify-center hover:bg-mountain-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
      >-</button>
      <span className="text-lg font-semibold text-mountain-800 w-6 text-center">{value}</span>
      <button
        onClick={() => value < max && onChange(value + 1)}
        disabled={value >= max}
        className="w-9 h-9 rounded-lg bg-mountain-100 text-mountain-600 font-bold text-lg flex items-center justify-center hover:bg-mountain-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
      >+</button>
    </div>
  )
}
