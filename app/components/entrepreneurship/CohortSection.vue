<script setup lang="ts">
/** Section d'une cohorte (titre, année · focus, bilan) et grille de ses portraits publiés. */
import type { PeiCohortPublic, PeiLaureatePublic } from '~/types/api/entrepreneurship'

const props = defineProps<{
  cohort: PeiCohortPublic
  laureates: PeiLaureatePublic[]
  anchorId?: string
}>()

const { t } = useI18n()
const { localized } = useLocalizedField()

const focus = computed(() => localized(props.cohort, 'focus'))
const summary = computed(() => localized(props.cohort, 'summary_html'))
const sorted = computed(() => sortLaureatesFeaturedFirst(props.laureates))
const titleId = computed(() => (props.anchorId ? `${props.anchorId}-title` : undefined))
</script>

<template>
  <section
    :id="anchorId"
    :aria-labelledby="titleId"
    class="scroll-mt-40 py-12 border-t border-gray-200 dark:border-gray-700 first-of-type:border-t-0"
  >
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <h3 :id="titleId" class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ localized(cohort, 'label') }}
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('pei.alumni.cohortYear', { year: cohort.year }) }}<template v-if="focus">
            · {{ focus }}
          </template>
        </p>
      </div>
      <span
        v-if="focus"
        class="rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider px-3 py-1"
      >
        {{ focus }}
      </span>
    </div>

    <RichTextRenderer v-if="summary" :html="summary" class="mt-4 max-w-3xl" />

    <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <EntrepreneurshipLaureateCard
        v-for="laureate in sorted"
        :key="laureate.id"
        :laureate="laureate"
      />
    </div>
  </section>
</template>
