/**
 * useLocalizedField — lecture d'un champ traduit selon la locale active.
 *
 * Convention additive (cf. MIGRATION_TRADUCTION_AUTO.md §2) : la colonne FR
 * existante reste la source, les variantes `_en` / `_ar` sont ajoutées. Pour les
 * champs rich text, le suffixe de langue s'insère AVANT `_html` / `_md` :
 *   - `content_html` -> `content_en_html`
 *   - `content_md`   -> `content_ar_md`
 * Pour les champs texte simples, suffixe direct : `title` -> `title_en`.
 *
 * Repli systématique sur le français : si la traduction est absente (NULL en
 * base), on renvoie la valeur FR ; en dernier recours, chaîne vide.
 *
 * Usage :
 *   const { localized } = useLocalizedField()
 *   localized(news, 'content_html') // -> content_en_html | content_ar_html | content_html | ''
 *   localized(tag, 'name')          // -> name_en | name_ar | name | ''
 */
export function useLocalizedField() {
  const { locale } = useI18n()

  /** Nom du champ traduit (insère la langue avant _html/_md si présent). */
  function variant(base: string, lang: string): string {
    for (const suffix of ['_html', '_md']) {
      if (base.endsWith(suffix)) {
        return `${base.slice(0, -suffix.length)}_${lang}${suffix}`
      }
    }
    return `${base}_${lang}`
  }

  function localized(obj: Record<string, unknown> | null | undefined, base: string): string {
    if (!obj) return ''
    const lang = locale.value
    if (lang === 'en' || lang === 'ar') {
      const translated = obj[variant(base, lang)]
      if (typeof translated === 'string' && translated) return translated
    }
    const fr = obj[base]
    return typeof fr === 'string' ? fr : ''
  }

  return { localized }
}
