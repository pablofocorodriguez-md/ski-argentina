import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const languages = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
] as const

export default function Header() {
  const { t, i18n } = useTranslation()
  const { currency, setCurrency } = useAppContext()
  const location = useLocation()
  const navigate = useNavigate()

  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'es'

  function switchLanguage(lang: string) {
    i18n.changeLanguage(lang)
    const path = location.pathname
    const otherLang = lang === 'es' ? 'en' : 'es'
    if (path.startsWith(`/${otherLang}/`)) {
      navigate(path.replace(`/${otherLang}/`, `/${lang}/`))
    } else if (path === `/${otherLang}`) {
      navigate(`/${lang}`)
    }
  }

  const prefix = `/${currentLang}`

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-mountain-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to={prefix} className="flex items-center gap-2 text-snow-800 font-display font-bold text-xl no-underline">
          <span className="text-2xl">⛷</span>
          <span>{t('common.appName')}</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <Link to={`${prefix}/centros`} className="text-mountain-600 hover:text-snow-700 text-sm font-medium no-underline">
            {t('nav.resorts')}
          </Link>
          <Link to={`${prefix}/calculador`} className="text-mountain-600 hover:text-snow-700 text-sm font-medium no-underline">
            {t('nav.calculator')}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-mountain-50 rounded-lg p-0.5 text-sm">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  currentLang === lang.code
                    ? 'bg-white text-snow-800 shadow-sm font-semibold'
                    : 'text-mountain-500 hover:text-mountain-700'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-mountain-50 rounded-lg p-0.5 text-sm">
            {(['ARS', 'USD'] as const).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  currency === cur
                    ? 'bg-white text-snow-800 shadow-sm font-semibold'
                    : 'text-mountain-500 hover:text-mountain-700'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
