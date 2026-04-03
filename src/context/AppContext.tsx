/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'

type Currency = 'ARS' | 'USD'

interface AppContextType {
  currency: Currency
  setCurrency: (c: Currency) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('ARS')

  return (
    <AppContext.Provider value={{ currency, setCurrency }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be inside AppProvider')
  return ctx
}
