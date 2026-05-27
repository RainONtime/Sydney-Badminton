import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zh from './locales/zh.json'
import en from './locales/en.json'

const STORAGE_KEY = 'duoduo-lang'
const savedLang = localStorage.getItem(STORAGE_KEY)
const initialLang = savedLang === 'en' || savedLang === 'zh' ? savedLang : 'zh'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en },
    },
    lng: initialLang,
    fallbackLng: 'zh',
    interpolation: {
      // React already escapes values — no need for i18next to do it too
      escapeValue: false,
    },
  })

export default i18n
