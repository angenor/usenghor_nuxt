<script setup lang="ts">
import type { FaqCategoryPublic, FaqEntryPublic, FaqTreePublic } from '~/types/api/faq'

interface Props {
  tree: FaqTreePublic
  /** Barre de recherche et filtre de catégorie (défaut : affichés). */
  searchable?: boolean
  /** Titres de groupe : `auto` si plus d'une catégorie, `always` toujours. */
  groupTitles?: 'auto' | 'always'
  headingLevel?: 'h2' | 'h3'
  /** Plusieurs réponses ouvertes simultanément (défaut : une seule). */
  multiple?: boolean
}

// Variantes additives (spec 025) : rendu de /faq inchangé par défaut.
const props = withDefaults(defineProps<Props>(), {
  searchable: true,
  groupTitles: 'auto',
  headingLevel: 'h2',
  multiple: false,
})

const { t, locale } = useI18n()
const { $lenis } = useNuxtApp()

const search = ref('')
const selectedCategoryId = ref<string | null>(null)
const openSlugs = ref(new Set<string>())

type Lang = 'fr' | 'en' | 'ar'
const lang = computed<Lang>(() => (locale.value === 'en' || locale.value === 'ar' ? locale.value : 'fr'))

function questionFor(e: FaqEntryPublic): string {
  if (lang.value === 'en') return e.question_en
  if (lang.value === 'ar') return e.question_ar
  return e.question_fr
}

function answerFor(e: FaqEntryPublic): string {
  if (lang.value === 'en') return e.answer_en_html
  if (lang.value === 'ar') return e.answer_ar_html
  return e.answer_fr_html
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

const filteredCategories = computed<FaqCategoryPublic[]>(() => {
  const q = search.value.trim().toLowerCase()
  return props.tree.categories
    .filter(c => selectedCategoryId.value === null || c.id === selectedCategoryId.value)
    .map((c) => {
      const entries = c.entries.filter((e) => {
        if (!q) return true
        const haystack = `${questionFor(e)} ${stripHtml(answerFor(e))}`.toLowerCase()
        return haystack.includes(q)
      })
      return { ...c, entries }
    })
    .filter(c => c.entries.length > 0 || (!q && !(props.multiple && !props.searchable)))
})

const totalVisibleEntries = computed(() =>
  filteredCategories.value.reduce((acc, c) => acc + c.entries.length, 0),
)

function toggle(slug: string) {
  const next = props.multiple ? new Set(openSlugs.value) : new Set<string>()
  if (openSlugs.value.has(slug)) next.delete(slug)
  else next.add(slug)
  openSlugs.value = next
}

const showGroupTitle = computed(() => props.groupTitles === 'always' || filteredCategories.value.length > 1)

function categoryLabel(c: FaqCategoryPublic): string {
  if (lang.value === 'en') return c.label_en || c.label_fr
  if (lang.value === 'ar') return c.label_ar || c.label_fr
  return c.label_fr
}

// Open from URL hash on mount + when hash changes
function syncFromHash(event?: HashChangeEvent) {
  if (!import.meta.client) return
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return
  const found = props.tree.categories.some(c => c.entries.some(e => e.slug === hash))
  if (found) {
    openSlugs.value = props.multiple ? new Set([...openSlugs.value, hash]) : new Set([hash])
    // Lenis intercepte scrollIntoView : défilement via scrollToPageAnchor (gotcha connu) ;
    // au chargement, léger délai le temps que la page et Lenis soient en place.
    if (event) nextTick(() => scrollToPageAnchor(`#${hash}`, { lenis: $lenis }))
    else setTimeout(() => scrollToPageAnchor(`#${hash}`, { smooth: false, lenis: $lenis }), 900)
  }
}

onMounted(() => {
  syncFromHash()
  window.addEventListener('hashchange', syncFromHash)
})

onBeforeUnmount(() => {
  if (import.meta.client) window.removeEventListener('hashchange', syncFromHash)
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="searchable" class="flex flex-col gap-4">
      <FaqSearchBar v-model:search="search" :placeholder="t('faq.searchPlaceholder')" />
      <FaqCategoryFilter
        v-model:selected-category-id="selectedCategoryId"
        :categories="tree.categories"
      />
    </div>

    <div v-if="totalVisibleEntries === 0" class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
      {{ search ? t('faq.noResults') : t('faq.emptyState') }}
    </div>

    <div v-for="cat in filteredCategories" :key="cat.id" class="space-y-3">
      <component
        :is="headingLevel"
        v-if="showGroupTitle"
        :class="headingLevel === 'h2'
          ? 'text-xl font-bold text-gray-900 dark:text-white'
          : 'text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'"
      >
        {{ categoryLabel(cat) }}
      </component>
      <div class="space-y-2">
        <FaqAccordionItem
          v-for="entry in cat.entries"
          :key="entry.id"
          :entry="entry"
          :open="openSlugs.has(entry.slug)"
          :question="questionFor(entry)"
          :answer-html="answerFor(entry)"
          @toggle="toggle"
        />
      </div>
    </div>
  </div>
</template>
