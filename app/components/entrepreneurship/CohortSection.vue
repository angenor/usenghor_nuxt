<script setup lang="ts">
/**
 * Section d'une promotion (page « Nos alumni ») : année géante dans la teinte de la promotion,
 * libellé, focus et bilan à gauche ; grille de portraits à droite, ou état vide « Portraits à venir »
 * (une cohorte s'affiche même sans portrait publié).
 */
import type { PeiCohortPublic, PeiLaureatePublic } from '~/types/api/entrepreneurship'
import type { PeiStepTone } from '~/utils/pei-presentation'

const props = withDefaults(defineProps<{
  cohort: PeiCohortPublic
  laureates: PeiLaureatePublic[]
  anchorId?: string
  /** Teinte de la promotion (rang chronologique) ; orange par défaut. */
  tone?: PeiStepTone | null
  /** Focus affiché à la place du champ vide de la cohorte (aperçu). */
  focusFallback?: string
  /** Second paragraphe quand le bilan saisi est vide (aperçu : « Profil type » ou « Bilan »). */
  note?: { title: string, text: string } | null
  /** Portraits d'exemple du mode aperçu. */
  sample?: boolean
  /** Cohorte d'exemple du mode aperçu. */
  sampleCohort?: boolean
  /** Bandeau d'aperçu fixe au-dessus de la sous-navigation : marge d'ancre plus grande. */
  belowPreviewBanner?: boolean
}>(), {
  anchorId: undefined,
  tone: null,
  focusFallback: '',
  note: null,
  sample: false,
  sampleCohort: false,
  belowPreviewBanner: false,
})

const { t } = useI18n()
const { localized } = useLocalizedField()

const toneValue = computed(() => props.tone ?? peiCohortTone(0))
const label = computed(() => splitCohortLabel(localized(props.cohort, 'label')))
const focus = computed(() => localized(props.cohort, 'focus') || props.focusFallback)
const summary = computed(() => localized(props.cohort, 'summary_html'))
const sorted = computed(() => sortLaureatesFeaturedFirst(props.laureates))
const titleId = computed(() => (props.anchorId ? `${props.anchorId}-title` : undefined))
</script>

<template>
  <section
    :id="anchorId"
    :aria-labelledby="titleId"
    class="border-b border-[#eef0f5] py-14 dark:border-gray-800 lg:py-[4.5rem]"
    :class="belowPreviewBanner ? 'scroll-mt-[200px]' : 'scroll-mt-40'"
    :style="peiStepStyle(toneValue)"
  >
    <div class="grid items-start gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[21.25rem_minmax(0,1fr)]">
      <div class="flex min-w-0 flex-col gap-4">
        <h3 :id="titleId" class="break-words text-2xl font-extrabold text-brand-blue-900 dark:text-white sm:text-[1.75rem]">
          {{ label.short }}<span v-if="label.tag" class="font-semibold text-gray-600 dark:text-gray-400"> · {{ label.tag }}</span>
        </h3>
        <span
          class="order-first text-[4.5rem] font-black leading-[0.85] tracking-[-0.05em] tabular-nums text-[color:var(--pei-ink)] dark:text-[color:var(--pei-fill)] sm:text-[6rem] lg:text-[7rem]"
        >
          {{ cohort.year }}
        </span>
        <span
          v-if="sampleCohort"
          class="self-start rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:bg-amber-950 dark:text-amber-100"
        >
          {{ t('pei.alumni.sample') }}
        </span>
        <p v-if="focus" class="text-base leading-[1.7] text-gray-700 dark:text-gray-300">
          <strong class="font-bold text-brand-blue-900 dark:text-white">{{ t('pei.alumni.cohort.focus') }}</strong>
          {{ focus }}
        </p>
        <RichTextRenderer v-if="summary" :html="summary" class="text-base leading-[1.7] text-gray-700 dark:text-gray-300" />
        <p v-else-if="note" class="text-base leading-[1.7] text-gray-700 dark:text-gray-300">
          <strong class="font-bold text-brand-blue-900 dark:text-white">{{ note.title }}</strong>
          {{ note.text }}
        </p>
      </div>

      <div v-if="sorted.length" class="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
        <EntrepreneurshipLaureateCard
          v-for="laureate in sorted"
          :key="laureate.id"
          :laureate="laureate"
          :tone="toneValue"
          :sample="sample"
          heading-tag="h4"
        />
      </div>
      <div
        v-else
        role="status"
        class="flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-[1.25rem] border-2 border-dashed border-gray-200 px-6 py-14 text-center dark:border-gray-700"
      >
        <font-awesome-icon icon="fa-solid fa-user-clock" class="h-10 w-10 text-[color:var(--pei-ink)] opacity-60 dark:text-[color:var(--pei-fill)]" aria-hidden="true" />
        <p class="text-lg font-bold text-brand-blue-900 dark:text-white">
          {{ t('pei.alumni.cohort.emptyTitle') }}
        </p>
        <p class="max-w-sm text-sm text-gray-600 dark:text-gray-400">
          {{ t('pei.alumni.cohort.emptyDescription') }}
        </p>
      </div>
    </div>
  </section>
</template>
