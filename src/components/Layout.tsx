import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from './Header'
import Footer from './Footer'
import { getAppLanguage } from '../i18n/lang'

export default function Layout() {
  const location = useLocation()
  const { i18n } = useTranslation()

  useEffect(() => {
    const routeLang = getAppLanguage(location.pathname.split('/')[1])
    if (i18n.language !== routeLang) {
      void i18n.changeLanguage(routeLang)
    }
  }, [i18n, location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
