import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getAppLanguage } from '../i18n/lang'

export default function Home() {
  const { t, i18n } = useTranslation()
  const lang = getAppLanguage(i18n.language)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="py-20 sm:py-32 text-center">
        <p className="inline-flex items-center rounded-full bg-snow-100 text-snow-800 px-4 py-1.5 text-sm font-semibold">
          {t('home.focusBadge')}
        </p>
        <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-mountain-950 tracking-tight">
          {t('home.title')}
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-mountain-600 max-w-2xl mx-auto">
          {t('home.subtitle')}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={`/${lang}/calculator`}
            className="px-8 py-3 bg-snow-700 text-white rounded-xl font-semibold text-lg hover:bg-snow-800 transition-colors no-underline"
          >
            {t('home.cta')}
          </Link>
          <Link
            to={`/${lang}/resorts`}
            className="px-8 py-3 border-2 border-mountain-200 text-mountain-700 rounded-xl font-semibold text-lg hover:border-mountain-300 hover:bg-mountain-50 transition-colors no-underline"
          >
            {t('home.browseResorts')}
          </Link>
        </div>
      </section>

      <section className="pb-20 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        <div className="p-6">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="font-display font-semibold text-mountain-800 text-lg">{t('home.card1Title')}</h3>
          <p className="mt-2 text-mountain-500 text-sm">{t('home.card1Body')}</p>
        </div>
        <div className="p-6">
          <div className="text-4xl mb-4">🎿</div>
          <h3 className="font-display font-semibold text-mountain-800 text-lg">{t('home.card2Title')}</h3>
          <p className="mt-2 text-mountain-500 text-sm">{t('home.card2Body')}</p>
        </div>
        <div className="p-6">
          <div className="text-4xl mb-4">🕒</div>
          <h3 className="font-display font-semibold text-mountain-800 text-lg">{t('home.card3Title')}</h3>
          <p className="mt-2 text-mountain-500 text-sm">{t('home.card3Body')}</p>
        </div>
      </section>
    </div>
  )
}
