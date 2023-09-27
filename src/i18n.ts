import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import languageEN from "./locales/en/translation.json";
import languageDE from "./locales/de/translation.json";
import * as dateFnsLocales from "date-fns/locale";
import {
  format as formatDate,
  formatRelative,
  formatDistance,
  isDate,
} from "date-fns";

interface Locales {
  [key: string]: Locale;
}

const locales: Locales = {
  en: dateFnsLocales.enUS,
  de: dateFnsLocales.de,
  deAT: dateFnsLocales.deAT,
  enAU: dateFnsLocales.enAU,
  enCA: dateFnsLocales.enCA,
  enGB: dateFnsLocales.enGB,
  enIE: dateFnsLocales.enIE,
  enIN: dateFnsLocales.enIN,
  enNZ: dateFnsLocales.enNZ,
  enZA: dateFnsLocales.enZA,
};
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: languageEN,
      de: languageDE,

      interpolation: {
        format: (value: Date, format: string, en: any) => {
          if (isDate(value)) {
            const locale = locales[en];

            if (format === "short") return formatDate(value, "P", { locale });
            if (format === "long") return formatDate(value, "PPPP", { locale });
            if (format === "relative")
              return formatRelative(value, new Date(), { locale });
            if (format === "ago")
              return formatDistance(value, new Date(), {
                locale,
                addSuffix: true,
              });

            return formatDate(value, format, { locale });
          }

          return value;
        },
      },
    },
    fallbackLng: "en",
    debug: false,
    keySeparator: ".",
    supportedLngs: [
      "de",
      "en",
      "de-DE",
      "en-US",
      "de-AT",
      "en-AU",
      "en-CA",
      "en-GB",
      "en-IE",
      "en-IN",
      "en-NZ",
      "en-ZA",
    ],
    detection: {
      order: [
        "querystring",
        "cookie",
        "navigator",
        "htmlTag",
        "path",
        "subdomain",
      ],
      caches: [],
      excludeCacheFor: ["localStorage", "sessionStorage", "cookie"],
    },
  });

export default i18n;
