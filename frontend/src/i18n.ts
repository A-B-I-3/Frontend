import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import sw from './locales/sw.json'

export const defaultLanguage = 'sw'

const getStoredLanguage = () => {
  if (typeof window === 'undefined') return defaultLanguage

  const stored = window.localStorage.getItem('ai-interview-language')
  return stored === 'en' || stored === 'sw' ? stored : defaultLanguage
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sw: { translation: sw },
  },
  lng: getStoredLanguage(),
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
  returnObjects: true,
})

export default i18n
