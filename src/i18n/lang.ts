export type AppLanguage = 'es' | 'en' | 'pt'

export function getAppLanguage(language?: string): AppLanguage {
  const base = (language ?? '').split('-')[0]
  if (base === 'es' || base === 'en' || base === 'pt') return base
  return 'es'
}

export function replaceLanguagePrefix(pathname: string, lang: AppLanguage): string {
  const stripped = pathname.replace(/^\/(es|en|pt)(?=\/|$)/, '')
  return `/${lang}${stripped || ''}`
}
