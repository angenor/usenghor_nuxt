/**
 * Dates et heures des appels exprimées en GMT (UTC).
 *
 * La base stocke les dates limites en `TIMESTAMPTZ` (UTC). Le backoffice saisit une
 * heure GMT et toutes les pages l'affichent en GMT, quel que soit le fuseau du
 * navigateur ou du serveur SSR : l'heure lue est partout celle qui a été saisie.
 */

type DateInput = string | Date | null | undefined

const GMT_SUFFIX = 'GMT'

function toDate(value: DateInput): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Balise de langue Intl du site (`fr` → `fr-FR`, `en` → `en-US`, `ar` → `ar-EG`). */
export function gmtLocaleTag(locale: string): string {
  if (locale === 'ar') return 'ar-EG'
  if (locale === 'en') return 'en-US'
  if (locale === 'fr') return 'fr-FR'
  return locale
}

/** Date seule lue en GMT (jamais décalée d'un jour selon le fuseau du visiteur). */
export function formatGmtDate(
  value: DateInput,
  locale: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
): string {
  const date = toDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat(gmtLocaleTag(locale), { ...options, timeZone: 'UTC' }).format(date)
}

/** Heure seule en GMT, suffixée : `12:00 GMT`. */
export function formatGmtTime(value: DateInput, locale: string): string {
  const date = toDate(value)
  if (!date) return ''
  const time = new Intl.DateTimeFormat(gmtLocaleTag(locale), {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: locale === 'en' ? 'h12' : 'h23',
    timeZone: 'UTC',
  }).format(date)
  return `${time} ${GMT_SUFFIX}`
}

/** Date et heure en GMT, suffixées : `14 septembre 2026, 12:00 GMT`. */
export function formatGmtDateTime(
  value: DateInput,
  locale: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
): string {
  const date = formatGmtDate(value, locale, options)
  return date ? `${date}${locale === 'ar' ? '،' : ','} ${formatGmtTime(value, locale)}` : ''
}

/** Valeur d'un `<input type="datetime-local">` (AAAA-MM-JJTHH:mm) exprimée en GMT. */
export function toGmtInputValue(value: DateInput): string {
  const date = toDate(value)
  return date ? date.toISOString().slice(0, 16) : ''
}

/**
 * Équivalent, dans le fuseau du navigateur, d'une saisie GMT du backoffice
 * (`14/09/2026 15:00 GMT+3`). À n'afficher que côté client (`<ClientOnly>`).
 */
export function gmtInputLocalEquivalent(value: string | null | undefined): string {
  const date = toDate(fromGmtInputValue(value))
  if (!date) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'shortOffset',
  }).format(date)
}

/** Saisie `datetime-local` interprétée comme GMT → ISO 8601 explicite (`…Z`), ou `null`. */
export function fromGmtInputValue(value: string | null | undefined): string | null {
  if (!value) return null
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(:\d{2})?/.exec(value)
  if (!match) return null
  return `${match[1]}T${match[2]}${match[3] ?? ':00'}Z`
}
