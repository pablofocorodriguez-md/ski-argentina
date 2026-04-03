import { useTranslation } from 'react-i18next'
import { useAppContext } from '../../context/AppContext'
import { resorts, getAirlineRoutesForResort, getDrivingRouteForResort } from '../../lib/resorts-data'
import {
  getEquipmentOptions, getLessonPrices, arePricesConfirmed,
  type Trip, type Passenger, type EquipmentLevel, type LessonType,
} from '../../lib/pricing-data'

interface Props {
  trip: Trip
  onChange: (trip: Trip) => void
  onNext: () => void
  onBack: () => void
}

export default function WizardStep2({ trip, onChange, onNext, onBack }: Props) {
  const { t, i18n } = useTranslation()
  const { currency } = useAppContext()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'es'
  const currencySymbol = currency === 'USD' ? 'US$' : '$'

  const resort = resorts.find(r => r.id === trip.resortId)
  const equipmentOptions = getEquipmentOptions(trip.resortId)
  const lessonPrices = getLessonPrices(trip.resortId)
  const airlines = getAirlineRoutesForResort(trip.resortId)
  const driving = getDrivingRouteForResort(trip.resortId)
  const confirmed = arePricesConfirmed(trip.resortId)

  // Does any passenger have equipment?
  const anyHasEquipment = trip.passengers.some(p => p.equipmentLevel !== 'none')

  function update(partial: Partial<Trip>) {
    onChange({ ...trip, ...partial, currency })
  }

  function updatePassenger(index: number, partial: Partial<Passenger>) {
    const passengers = trip.passengers.map((p, i) =>
      i === index ? { ...p, ...partial } : p
    )
    update({ passengers })
  }

  /** Apply same equipment/lesson to all passengers */
  function applyToAll(field: 'equipmentLevel' | 'lessonType', value: EquipmentLevel | LessonType) {
    const passengers = trip.passengers.map(p => ({ ...p, [field]: value }))
    update({ passengers })
  }

  const fmt = (n: number) => {
    if (currency === 'USD') return `US$ ${Math.round(n / 1200).toLocaleString('en-US')}`
    return `$${n.toLocaleString('es-AR')}`
  }

  // Current selected equipment option for price display
  const selectedEquipOpt = equipmentOptions.find(o => o.key === trip.equipmentLocationKey) ?? equipmentOptions[0]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-mountain-900 mb-1">
          {t('calculator.step2Title')}
        </h2>
        <p className="text-mountain-500">{t('calculator.step2Subtitle')}</p>
        {resort && (
          <div className="mt-3 inline-flex items-center gap-2 bg-snow-50 border border-snow-200 rounded-lg px-3 py-1.5">
            <span className="text-snow-800 font-semibold text-sm">{resort.name}</span>
            <span className="text-mountain-400 text-xs">·</span>
            <span className="text-mountain-500 text-xs">{trip.skiDays} {lang === 'es' ? 'días' : 'days'}</span>
            <span className="text-mountain-400 text-xs">·</span>
            <span className="text-mountain-500 text-xs">{trip.passengers.length} {lang === 'es' ? 'personas' : 'people'}</span>
          </div>
        )}
      </div>

      {/* ── Per-passenger config ── */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-mountain-700">
            {lang === 'es' ? 'Equipo y clases por persona' : 'Gear & lessons per person'}
          </label>
        </div>

        <div className="space-y-3">
          {trip.passengers.map((p, idx) => (
            <PassengerRow
              key={idx}
              passenger={p}
              index={idx}
              isFirst={idx === 0}
              totalPassengers={trip.passengers.length}
              onUpdate={(partial) => updatePassenger(idx, partial)}
              onApplyEquipToAll={(level) => applyToAll('equipmentLevel', level)}
              onApplyLessonsToAll={(type) => applyToAll('lessonType', type)}
              lessonPrices={lessonPrices}
              fmt={fmt}
              lang={lang}
              t={t}
            />
          ))}
        </div>
      </div>

      {/* ── Equipment location (global) ── */}
      {anyHasEquipment && equipmentOptions.length > 0 && (
        <div className="mb-8">
          <label className="block text-sm font-semibold text-mountain-700 mb-2">
            {t('calculator.equipmentWhere')}
          </label>
          <div className="space-y-2">
            {equipmentOptions.map((opt) => {
              const isSelected = trip.equipmentLocationKey === opt.key
              // Show price for "basic" as reference
              return (
                <button
                  key={opt.key}
                  onClick={() => update({ equipmentLocationKey: opt.key })}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected ? 'border-snow-500 bg-snow-50' : 'border-mountain-100 hover:border-mountain-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-mountain-800">
                      {lang === 'en' ? opt.label_en : opt.label_es}
                    </span>
                    <span className="text-xs text-mountain-500">
                      {lang === 'es' ? 'desde' : 'from'} {fmt(opt.perDay.basic)}{t('calculator.perDay')}
                    </span>
                  </div>
                </button>
              )
            })}
            <button
              onClick={() => update({ equipmentLocationKey: 'custom' })}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
                trip.equipmentLocationKey === 'custom' ? 'border-snow-500 bg-snow-50' : 'border-mountain-100 hover:border-mountain-200'
              }`}
            >
              <span className="text-sm font-medium text-mountain-800">{t('calculator.equipmentCustom')}</span>
            </button>
            {trip.equipmentLocationKey === 'custom' && (
              <div className="flex items-center gap-2 pl-3">
                <span className="text-mountain-400 text-sm">{currencySymbol}</span>
                <input
                  type="number"
                  value={trip.customEquipmentPerDay || ''}
                  onChange={(e) => update({ customEquipmentPerDay: Number(e.target.value) })}
                  placeholder={t('calculator.equipmentCustomHint')}
                  className="w-full px-3 py-2 border border-mountain-200 rounded-lg text-sm text-mountain-800 focus:outline-none focus:ring-2 focus:ring-snow-400"
                />
              </div>
            )}
            {confirmed && selectedEquipOpt && trip.equipmentLocationKey !== 'custom' && (
              <p className="text-[11px] text-green-600 pl-1">
                {t('calculator.equipmentOfficialPrices', { resort: resort?.name ?? '' })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Transport ── */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-mountain-700 mb-2">{t('calculator.transport')}</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(['flight', 'car'] as const).map((type) => (
            <button
              key={type}
              onClick={() => update({ transportType: type })}
              className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                trip.transportType === type
                  ? 'bg-snow-700 text-white'
                  : 'bg-mountain-50 text-mountain-600 hover:bg-mountain-100'
              }`}
            >
              {type === 'flight' ? '✈️ ' : '🚗 '}
              {t(`calculator.transport${type.charAt(0).toUpperCase() + type.slice(1)}`)}
            </button>
          ))}
        </div>

        {trip.transportType === 'flight' ? (
          <div className="space-y-3">
            {airlines.length > 0 && (
              <div className="space-y-2">
                {airlines.filter(a => a.is_reliable).map((route) => {
                  const notes = lang === 'en' ? route.notes_en : route.notes_es
                  return (
                    <div key={route.id} className="bg-white rounded-lg border border-mountain-100 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <span className="font-medium text-mountain-800 text-sm">{route.airline_name}</span>
                        <span className="text-mountain-400 mx-1.5 text-xs">·</span>
                        <span className="text-xs text-mountain-500">{route.origin_code} → {route.destination_code}</span>
                        {notes && <p className="text-xs text-mountain-400 mt-0.5">{notes}</p>}
                      </div>
                      {route.google_flights_url && (
                        <a href={route.google_flights_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 bg-snow-700 text-white rounded-lg hover:bg-snow-800 no-underline shrink-0">
                          Google Flights
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            <div>
              <label className="text-sm text-mountain-500">{t('calculator.flightPrice')}</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-mountain-400">{currencySymbol}</span>
                <input
                  type="number"
                  value={trip.flightPricePerPerson || ''}
                  onChange={(e) => update({ flightPricePerPerson: Number(e.target.value) })}
                  placeholder={t('calculator.flightPriceHint')}
                  className="w-full px-3 py-2 border border-mountain-200 rounded-lg text-mountain-800 focus:outline-none focus:ring-2 focus:ring-snow-400"
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            {driving && (
              <div className="bg-mountain-50 rounded-lg p-3 mb-3 text-sm text-mountain-600">
                <span className="font-medium">{t('resorts.fromBuenosAires')}:</span>{' '}
                {driving.distance_km} km · ~{driving.estimated_hours} {t('resorts.hours')}
              </div>
            )}
            <label className="text-sm text-mountain-500">{t('calculator.carFuelCost')}</label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-mountain-400">{currencySymbol}</span>
              <input
                type="number"
                value={trip.carFuelCost || ''}
                onChange={(e) => update({ carFuelCost: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-3 py-2 border border-mountain-200 rounded-lg text-mountain-800 focus:outline-none focus:ring-2 focus:ring-snow-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 mb-8">
        {t('common.disclaimer')}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border-2 border-mountain-200 text-mountain-600 rounded-xl font-semibold hover:bg-mountain-50 transition-colors cursor-pointer"
        >
          {t('common.back')}
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-snow-700 text-white rounded-xl font-semibold text-lg hover:bg-snow-800 transition-colors cursor-pointer"
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Per-passenger row component
// ──────────────────────────────────────────────

interface PassengerRowProps {
  passenger: Passenger
  index: number
  isFirst: boolean
  totalPassengers: number
  onUpdate: (partial: Partial<Passenger>) => void
  onApplyEquipToAll: (level: EquipmentLevel) => void
  onApplyLessonsToAll: (type: LessonType) => void
  lessonPrices: { group: number; private: number } | null
  fmt: (n: number) => string
  lang: string
  t: (key: string) => string
}

function PassengerRow({
  passenger, index, isFirst, totalPassengers,
  onUpdate, onApplyEquipToAll, onApplyLessonsToAll,
  lessonPrices, fmt, lang, t,
}: PassengerRowProps) {
  const icon = passenger.type === 'adult' ? '👤' : '🧒'

  return (
    <div className="bg-white rounded-xl border border-mountain-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span>{icon}</span>
        <span className="font-semibold text-mountain-800 text-sm">{passenger.label}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Equipment */}
        <div>
          <label className="text-xs text-mountain-500 mb-1.5 block">{t('calculator.equipment')}</label>
          <div className="flex gap-1">
            {(['none', 'basic', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                onClick={() => onUpdate({ equipmentLevel: level })}
                className={`flex-1 py-1.5 px-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  passenger.equipmentLevel === level
                    ? 'bg-snow-700 text-white'
                    : 'bg-mountain-50 text-mountain-500 hover:bg-mountain-100'
                }`}
              >
                {t(`calculator.equipment${level.charAt(0).toUpperCase() + level.slice(1)}`)}
              </button>
            ))}
          </div>
          {/* "Apply to all" link — only on first passenger, when there are multiple */}
          {isFirst && totalPassengers > 1 && passenger.equipmentLevel !== 'none' && (
            <button
              onClick={() => onApplyEquipToAll(passenger.equipmentLevel)}
              className="text-[10px] text-snow-600 hover:text-snow-800 mt-1 cursor-pointer"
            >
              {lang === 'es' ? 'Aplicar a todos →' : 'Apply to all →'}
            </button>
          )}
        </div>

        {/* Lessons */}
        <div>
          <label className="text-xs text-mountain-500 mb-1.5 block">{t('calculator.lessons')}</label>
          <div className="flex gap-1">
            {(['none', 'group', 'private'] as const).map((type) => {
              const price = type !== 'none' && lessonPrices ? lessonPrices[type] : 0
              return (
                <button
                  key={type}
                  onClick={() => onUpdate({ lessonType: type })}
                  className={`flex-1 py-1.5 px-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    passenger.lessonType === type
                      ? 'bg-snow-700 text-white'
                      : 'bg-mountain-50 text-mountain-500 hover:bg-mountain-100'
                  }`}
                >
                  <div>{t(`calculator.lessons${type.charAt(0).toUpperCase() + type.slice(1)}`)}</div>
                  {price > 0 && (
                    <div className={`text-[9px] ${passenger.lessonType === type ? 'text-snow-200' : 'text-mountain-400'}`}>
                      {fmt(price)}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          {isFirst && totalPassengers > 1 && passenger.lessonType !== 'none' && (
            <button
              onClick={() => onApplyLessonsToAll(passenger.lessonType)}
              className="text-[10px] text-snow-600 hover:text-snow-800 mt-1 cursor-pointer"
            >
              {lang === 'es' ? 'Aplicar a todos →' : 'Apply to all →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
