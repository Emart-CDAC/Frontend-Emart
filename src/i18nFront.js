import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en-front.json";
import hi from "./locales/hi-front.json";
import mr from "./locales/mr-front.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            hi: { translation: hi },
            mr: { translation: mr }
        },
        fallbackLng: "en",
        detection: {
            order: ["localStorage", "navigator"]
        },
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
