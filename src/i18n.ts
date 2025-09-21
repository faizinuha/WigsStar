
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18n
  .use(initReactI18next)
  .use(HttpApi)
  .init({
    supportedLngs: ['en', 'id', 'ja'],
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    // Options for language detector
    detection: {
      order: ['path', 'cookie', 'htmlTag', 'localStorage', 'subdomain'],
      caches: ['cookie'],
    },
    // Options for backend
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: {
      useSuspense: true,
    }
  });

export default i18n;

