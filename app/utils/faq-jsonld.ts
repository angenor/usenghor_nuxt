/**
 * Données structurées « FAQPage » partagées entre `/faq` et la page du
 * Statut Étudiant-Entrepreneur — logique extraite à l'identique de `pages/faq.vue`.
 * Spec : specs/025-pei-see-status-page (research R11).
 */

import type { FaqCategoryPublic, FaqEntryPublic } from '~/types/api/faq'

export type FaqLang = 'fr' | 'en' | 'ar'

/** Question dans la langue demandée (repli FR appliqué par l'API). */
export function faqQuestionFor(entry: FaqEntryPublic, lang: FaqLang): string {
  if (lang === 'en') return entry.question_en
  if (lang === 'ar') return entry.question_ar
  return entry.question_fr
}

/** Réponse HTML dans la langue demandée (repli FR appliqué par l'API). */
export function faqAnswerHtmlFor(entry: FaqEntryPublic, lang: FaqLang): string {
  if (lang === 'en') return entry.answer_en_html
  if (lang === 'ar') return entry.answer_ar_html
  return entry.answer_fr_html
}

function stripHtml(html: string, max = 5000): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

/** Objet JSON-LD `FAQPage` ; `null` si aucune entrée. */
export function buildFaqPageJsonLd(categories: FaqCategoryPublic[], lang: FaqLang) {
  const mainEntity = categories.flatMap(c =>
    c.entries.map(e => ({
      '@type': 'Question',
      'name': faqQuestionFor(e, lang),
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': stripHtml(faqAnswerHtmlFor(e, lang)),
      },
    })),
  )
  if (!mainEntity.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': mainEntity,
  }
}
