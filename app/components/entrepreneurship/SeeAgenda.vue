<script setup lang="ts">
/**
 * Panneau « Agenda » de l'appel SEE : badge d'état, frise du calendrier et action
 * (formulaire externe, formulaire du site ou e-mail du pôle selon l'état).
 * Spec : specs/025-pei-see-status-page (research R5–R7, contracts/frontend.md).
 */
import type { AgendaStep, SeeApplyTarget, SeeCallState } from '~/utils/pei-presentation'

const props = defineProps<{
  state: SeeCallState
  year: number | null
  steps: AgendaStep[]
  openingDate: string | null
  target: SeeApplyTarget | null
  buttonLabel: string
  ccNote?: string
  closedTitle?: string
  closedText?: string
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

const badgeClass = computed(() => {
  if (props.state === 'open') return 'bg-brand-red-100 text-brand-red-700 dark:bg-brand-red-900/30 dark:text-brand-red-300'
  if (props.state === 'upcoming') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
  return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
})
const badgeLabel = computed(() => t(`pei.see.state.${props.state === 'absent' ? 'closed' : props.state}`))

const showSteps = computed(() => props.state !== 'absent' && props.steps.length > 0)

// Dates lues en GMT ; la date limite porte son heure GMT (heure saisie dans le backoffice).
function formatDate(value: string | null, withTime = false): string {
  if (!value) return ''
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  return withTime && !dateOnly ? formatGmtDateTime(value, locale.value) : formatGmtDate(value, locale.value)
}

function stepDate(step: AgendaStep): string {
  const start = formatDate(step.start, step.synthetic)
  const end = formatDate(step.end)
  if (start && end && end !== start) return `${start} – ${end}`
  return start || end
}

const openingLabel = computed(() => {
  const date = formatDate(props.openingDate)
  return date ? t('pei.see.opensOn', { date }) : ''
})
</script>

<template>
  <aside
    :aria-label="t('pei.see.agendaLabel')"
    class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-lg"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ year ? t('pei.see.agendaTitleYear', { year }) : t('pei.see.agendaTitle') }}
      </h3>
      <span :class="['rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', badgeClass]">
        {{ badgeLabel }}
      </span>
    </div>

    <ol
      v-if="showSteps"
      class="relative mt-6 ms-2 space-y-6 border-s-2 border-brand-blue-100 dark:border-brand-blue-900/50"
    >
      <li v-for="step in steps" :key="step.id" class="relative ps-6">
        <span
          :class="[
            'absolute -start-[9px] top-1 h-4 w-4 rounded-full border-2',
            step.isDeadline
              ? 'border-brand-red-500 bg-brand-red-500'
              : 'border-brand-blue-500 bg-white dark:bg-gray-800',
          ]"
          aria-hidden="true"
        />
        <time
          v-if="step.start || step.end"
          :datetime="step.start ?? step.end ?? undefined"
          :class="[
            'block text-sm font-semibold',
            step.isDeadline ? 'text-brand-red-600 dark:text-brand-red-400' : 'text-gray-900 dark:text-white',
          ]"
        >
          {{ stepDate(step) }}
        </time>
        <p class="text-gray-700 dark:text-gray-200">
          {{ step.label }}
        </p>
        <p v-if="step.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ step.description }}
        </p>
      </li>
    </ol>

    <!-- Appel ouvert : bouton vers le formulaire (ou contact si aucun formulaire) -->
    <template v-if="state === 'open'">
      <template v-if="target">
        <NuxtLink
          v-if="target.kind === 'internal'"
          :to="localePath(target.to)"
          class="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-red-500 hover:bg-brand-red-600 px-6 py-3 font-semibold text-white transition-colors duration-200"
        >
          <font-awesome-icon icon="fa-solid fa-rocket" class="h-4 w-4" aria-hidden="true" />
          {{ buttonLabel }}
        </NuxtLink>
        <a
          v-else-if="target.kind === 'external'"
          :href="target.href"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-red-500 hover:bg-brand-red-600 px-6 py-3 font-semibold text-white transition-colors duration-200"
        >
          <font-awesome-icon icon="fa-solid fa-rocket" class="h-4 w-4" aria-hidden="true" />
          {{ buttonLabel }}
          <span class="sr-only">{{ t('pei.common.openInNewTab') }}</span>
        </a>
        <a
          v-else
          :href="target.href"
          class="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-red-500 hover:bg-brand-red-600 px-6 py-3 font-semibold text-white transition-colors duration-200"
        >
          <font-awesome-icon icon="fa-regular fa-envelope" class="h-4 w-4" aria-hidden="true" />
          {{ t('pei.see.contactButton') }}
        </a>
      </template>
      <p v-if="ccNote" class="mt-3 text-center text-[13px] text-gray-500 dark:text-gray-400">
        {{ ccNote }}
      </p>
    </template>

    <!-- À venir, clos ou absent : message et contact, jamais de lien vers le formulaire -->
    <template v-else>
      <template v-if="state === 'upcoming'">
        <p v-if="openingLabel" class="mt-6 text-sm font-medium text-gray-900 dark:text-white">
          {{ openingLabel }}
        </p>
        <p v-if="closedText" class="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {{ closedText }}
        </p>
      </template>
      <div
        v-else-if="closedTitle || closedText"
        class="mt-6 rounded-xl bg-gray-50 dark:bg-gray-900/40 p-4"
      >
        <p v-if="closedTitle" class="font-semibold text-gray-900 dark:text-white">
          {{ closedTitle }}
        </p>
        <p v-if="closedText" class="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {{ closedText }}
        </p>
      </div>
      <a
        v-if="target && target.kind === 'contact'"
        :href="target.href"
        class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-blue-500 px-6 py-3 font-semibold text-brand-blue-600 hover:bg-brand-blue-50 dark:text-brand-blue-300 dark:hover:bg-brand-blue-900/30 transition-colors duration-200"
      >
        <font-awesome-icon icon="fa-regular fa-envelope" class="h-4 w-4" aria-hidden="true" />
        {{ t('pei.see.contactButton') }}
      </a>
    </template>
  </aside>
</template>
