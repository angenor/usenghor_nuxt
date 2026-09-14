<script setup lang="ts">
import type { FaqTreePublic } from '~/types/api/faq'
import type { FaqLang } from '~/utils/faq-jsonld'

const { t, locale } = useI18n()

const { data: tree } = await useAsyncData<FaqTreePublic>('faq-tree', () =>
  usePublicFaqApi().getTree(),
)

const lang = computed<FaqLang>(() => (locale.value === 'en' || locale.value === 'ar' ? locale.value : 'fr'))

const jsonLd = computed(() => (tree.value ? buildFaqPageJsonLd(tree.value.categories, lang.value) : null))

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
