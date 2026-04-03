import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-mountain-100 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-mountain-500">
          <p>{t('footer.disclaimer')}</p>
          <p>
            {t('footer.madeWith')} ❄️ {t('footer.forSkiers')}
          </p>
        </div>
      </div>
    </footer>
  )
}
