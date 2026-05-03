<script setup lang="ts">
import type { FaqEntryPublic, FaqTreePublic } from '~/types/api/faq'

const { t, locale } = useI18n()

const { data: tree } = await useAsyncData<FaqTreePublic>('faq-tree', () =>
  usePublicFaqApi().getTree(),
)

type Lang = 'fr' | 'en' | 'ar'
const lang = computed<Lang>(() => (locale.value === 'en' || locale.value === 'ar' ? locale.value : 'fr'))

function stripHtml(html: string, max = 5000): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function questionFor(e: FaqEntryPublic): string {
  if (lang.value === 'en') return e.question_en
  if (lang.value === 'ar') return e.question_ar
  return e.question_fr
}

function answerHtmlFor(e: FaqEntryPublic): string {
  if (lang.value === 'en') return e.answer_en_html
  if (lang.value === 'ar') return e.answer_ar_html
  return e.answer_fr_html
}

const jsonLd = computed(() => {
  const t2 = tree.value
  if (!t2) return null
  const mainEntity = t2.categories.flatMap(c =>
    c.entries.map(e => ({
      '@type': 'Question',
      'name': questionFor(e),
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': stripHtml(answerHtmlFor(e)),
      },
    })),
  )
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': mainEntity,
  }
})

useSeoMeta({
  title: () => t('faq.title'),
  description: () => t('faq.metaDescription'),
  ogTitle: () => t('faq.title'),
  ogDescription: () => t('faq.metaDescription'),
})

useHead(() => ({
  htmlAttrs: { dir: locale.value === 'ar' ? 'rtl' : 'ltr' },
  script: jsonLd.value
    ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLd.value),
      }]
    : [],
}))
</script>

<template>
  <main>
    <ActualitesHero
      :title="t('faq.title')"
      :subtitle="t('faq.heroSubtitle')"
      :badge="t('faq.heroBadge')"
    />

    <section class="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div v-if="tree">
        <FaqAccordion :tree="tree" />
      </div>
      <div v-else class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        {{ t('faq.loadError') }}
      </div>
    </section>
  </main>
</template>
