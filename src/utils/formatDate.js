import { format, parseISO } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'

/** Returns the date-fns locale object for the given i18n language code. */
export function getDateLocale(lang) {
  return lang === 'en' ? enUS : zhCN
}

/**
 * Format a date string for the EventInfo detail block.
 * zh: "2025年6月14日 星期六"
 * en: "Saturday, June 14, 2025"
 */
export function formatEventDate(dateStr, lang) {
  const locale = getDateLocale(lang)
  const pattern = lang === 'en' ? 'EEEE, MMMM d, yyyy' : 'yyyy年M月d日 EEEE'
  return format(parseISO(dateStr), pattern, { locale })
}

/**
 * Format a date string for the EventCard compact display.
 * Returns { weekday, monthDay }.
 * zh: weekday="周六", monthDay="6月14日"
 * en: weekday="Sat", monthDay="Jun 14"
 */
export function formatCardDate(dateStr, lang) {
  const locale = getDateLocale(lang)
  const weekday = format(parseISO(dateStr), 'EEE', { locale })
  const monthDay = lang === 'en'
    ? format(parseISO(dateStr), 'MMM d')
    : format(parseISO(dateStr), 'M月d日')
  return { weekday, monthDay }
}
