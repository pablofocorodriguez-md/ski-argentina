import { useTranslation } from 'react-i18next'

const steps = [
  { key: 'step1Title' },
  { key: 'step2Title' },
  { key: 'step3Title' },
] as const

export default function StepIndicator({ current }: { current: number }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => {
        const stepNum = i + 1
        const isActive = stepNum === current
        const isDone = stepNum < current

        return (
          <div key={step.key} className="flex items-center gap-2">
            {i > 0 && <div className={`w-8 h-0.5 ${isDone ? 'bg-snow-600' : 'bg-mountain-200'}`} />}
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isActive
                    ? 'bg-snow-700 text-white'
                    : isDone
                      ? 'bg-snow-200 text-snow-800'
                      : 'bg-mountain-100 text-mountain-400'
                }`}
              >
                {stepNum}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  isActive ? 'text-snow-800 font-semibold' : 'text-mountain-400'
                }`}
              >
                {t(`calculator.${step.key}`)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
