import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppContext } from '../context/AppContext'
import StepIndicator from '../components/calculator/StepIndicator'
import WizardStep1 from '../components/calculator/WizardStep1'
import WizardStep2 from '../components/calculator/WizardStep2'
import TripResult from '../components/calculator/TripResult'
import TripCard from '../components/calculator/TripCard'
import TripComparison from '../components/calculator/TripComparison'
import { calculateTripCost, createEmptyTrip, type Trip, type TripWithResult } from '../lib/pricing-data'
import { resorts } from '../lib/resorts-data'
import { getAppLanguage } from '../i18n/lang'

type View = 'list' | 'wizard' | 'compare'

export default function Calculator() {
  const { t, i18n } = useTranslation()
  const { currency } = useAppContext()
  const [searchParams] = useSearchParams()
  const lang = getAppLanguage(i18n.language)
  const resortSlug = searchParams.get('resort')
  const preselectedResort = resortSlug ? resorts.find(r => r.slug === resortSlug) : undefined

  const [view, setView] = useState<View>(preselectedResort ? 'wizard' : 'list')
  const [trips, setTrips] = useState<TripWithResult[]>([])
  const [currentTrip, setCurrentTrip] = useState<Trip>(() => {
    const trip = createEmptyTrip(currency, lang)
    if (preselectedResort) trip.resortId = preselectedResort.id
    return trip
  })
  const [wizardStep, setWizardStep] = useState(1)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  function startNewTrip() {
    setCurrentTrip(createEmptyTrip(currency, lang))
    setEditingIndex(null)
    setWizardStep(1)
    setView('wizard')
  }

  function editTrip(index: number) {
    setCurrentTrip({ ...trips[index].trip })
    setEditingIndex(index)
    setWizardStep(1)
    setView('wizard')
  }

  function deleteTrip(index: number) {
    setTrips(prev => prev.filter((_, i) => i !== index))
  }

  function saveCurrentTrip(): TripWithResult {
    const result = calculateTripCost({ ...currentTrip, currency })
    return { trip: { ...currentTrip, currency }, result }
  }

  function handleWizardDone() {
    const tw = saveCurrentTrip()
    if (editingIndex !== null) {
      setTrips(prev => prev.map((t, i) => i === editingIndex ? tw : t))
    } else {
      setTrips(prev => [...prev, tw])
    }
    setEditingIndex(null)
    setView('list')
  }

  function handleSaveAndAdd() {
    const tw = saveCurrentTrip()
    if (editingIndex !== null) {
      setTrips(prev => prev.map((t, i) => i === editingIndex ? tw : t))
    } else {
      setTrips(prev => [...prev, tw])
    }
    setEditingIndex(null)
    startNewTrip()
  }

  function handleCancelWizard() {
    setEditingIndex(null)
    setView('list')
  }

  // Comparison: modify a trip from comparison view
  function handleCompareModify(index: number) {
    editTrip(index)
  }

  function handleCompareDelete(index: number) {
    const updated = trips.filter((_, i) => i !== index)
    setTrips(updated)
    if (updated.length < 2) setView('list')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-display font-bold text-mountain-950 mb-2">
        {t('calculator.title')}
      </h1>

      {/* ───── LIST VIEW ───── */}
      {view === 'list' && (
        <div className="mt-6">
          {trips.length === 0 ? (
            /* Empty state */
            <div className="text-center py-16">
              <div className="text-6xl mb-4 opacity-40">🎿</div>
              <h2 className="text-xl font-display font-bold text-mountain-700 mb-2">
                {t('calculator.noTripsYet')}
              </h2>
              <p className="text-mountain-500 mb-8">{t('calculator.noTripsHint')}</p>
              <button
                onClick={startNewTrip}
                className="px-8 py-4 bg-snow-700 text-white rounded-xl font-semibold text-lg hover:bg-snow-800 transition-colors cursor-pointer"
              >
                + {t('calculator.addTrip')}
              </button>
            </div>
          ) : (
            <>
              {/* Trip cards */}
              <div className={`grid gap-4 ${
                trips.length === 1 ? 'grid-cols-1 max-w-lg mx-auto'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {trips.map((tw, i) => (
                  <TripCard
                    key={tw.trip.id}
                    tripWithResult={tw}
                    onEdit={() => editTrip(i)}
                    onDelete={() => deleteTrip(i)}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                {trips.length < 3 && (
                  <button
                    onClick={startNewTrip}
                    className="px-6 py-3 border-2 border-dashed border-snow-300 text-snow-700 rounded-xl font-semibold hover:bg-snow-50 transition-colors cursor-pointer"
                  >
                    + {t('calculator.addAnother')}
                  </button>
                )}
                {trips.length >= 2 && (
                  <button
                    onClick={() => setView('compare')}
                    className="px-8 py-3 bg-snow-700 text-white rounded-xl font-semibold text-lg hover:bg-snow-800 transition-colors cursor-pointer"
                  >
                    {t('calculator.compareTrips')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ───── WIZARD VIEW ───── */}
      {view === 'wizard' && (
        <>
          <StepIndicator current={wizardStep} />

          {wizardStep === 1 && (
            <WizardStep1
              trip={currentTrip}
              onChange={setCurrentTrip}
              onNext={() => setWizardStep(2)}
              onCancel={handleCancelWizard}
            />
          )}

          {wizardStep === 2 && (
            <WizardStep2
              trip={currentTrip}
              onChange={setCurrentTrip}
              onNext={() => setWizardStep(3)}
              onBack={() => setWizardStep(1)}
            />
          )}

          {wizardStep === 3 && (
            <TripResult
              result={calculateTripCost({ ...currentTrip, currency })}
              skiDays={currentTrip.skiDays}
              canAddMore={trips.length < 2 && editingIndex === null}
              onSaveAndAdd={handleSaveAndAdd}
              onDone={handleWizardDone}
              onBack={() => setWizardStep(2)}
            />
          )}
        </>
      )}

      {/* ───── COMPARE VIEW ───── */}
      {view === 'compare' && (
        <TripComparison
          trips={trips}
          onModify={handleCompareModify}
          onDelete={handleCompareDelete}
          onBack={() => setView('list')}
        />
      )}
    </div>
  )
}
