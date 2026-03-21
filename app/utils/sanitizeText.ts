/**
 * Normalise les espaces Unicode problématiques (insécables, zero-width, etc.)
 * qui s'affichent comme des caractères cassés sur certains navigateurs mobiles.
 * Typiquement causé par du copier-coller depuis Word, PDF, ou pages web.
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return ''
  return text.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F\u00A0\u202F\u2007\u2009\u200A\u200B\u2060\uFEFF]/g, ' ').trim()
}
