<script setup lang="ts">
import type { FaqCategoryPublic, FaqEntryPublic, FaqTreePublic } from '~/types/api/faq'

interface Props {
  tree: FaqTreePublic
}

const props = defineProps<Props>()

const { t, locale } = useI18n()

const search = ref('')
const selectedCategoryId = ref<string | null>(null)
const openSlug = ref<string | null>(null)

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
    .filter(c => c.entries.length > 0 || !q)
})

const totalVisibleEntries = computed(() =>
  filteredCategories.value.reduce((acc, c) => acc + c.entries.length, 0),
)

function toggle(slug: string) {
  openSlug.value = openSlug.value === slug ? null : slug
}

function categoryLabel(c: FaqCategoryPublic): string {
  if (lang.value === 'en') return c.label_en || c.label_fr
  if (lang.value === 'ar') return c.label_ar || c.label_fr
  return c.label_fr
}

// Open from URL hash on mount + when hash changes
function syncFromHash() {
  if (!import.meta.client) return
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return
  const found = props.tree.categories.some(c => c.entries.some(e => e.slug === hash))
  if (found) {
    openSlug.value = hash
    nextTick(() => {
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
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
    <div class="flex flex-col gap-4">
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
      <h2 v-if="filteredCategories.length > 1" class="text-xl font-bold text-gray-900 dark:text-white">
        {{ categoryLabel(cat) }}
      </h2>
      <div class="space-y-2">
        <FaqAccordionItem
          v-for="entry in cat.entries"
          :key="entry.id"
          :entry="entry"
          :open="openSlug === entry.slug"
          :question="questionFor(entry)"
          :answer-html="answerFor(entry)"
          @toggle="toggle"
        />
      </div>
    </div>
  </div>
</template>
