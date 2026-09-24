<script setup lang="ts">
/**
 * Frise des promotions (page « Nos alumni ») : un point coloré par promotion, reliés par une
 * ligne ; libellé · année et focus ; chaque entrée mène à la section de la promotion (ancre, Lenis).
 * Horizontale à partir de `lg`, verticale en dessous.
 */
import type { PeiStepTone } from '~/utils/pei-presentation'

export interface CohortTimelineItem {
  id: string
  /** Identifiant de la section visée (sans `#`). */
  anchor: string
  short: string
  year: number
  focus: string
  tone: PeiStepTone
}

const props = defineProps<{
  items: CohortTimelineItem[]
  ariaLabel?: string
}>()

const { $lenis } = useNuxtApp()

function onClick(event: MouseEvent, anchor: string) {
  if (scrollToPageAnchor(`#${anchor}`, { lenis: $lenis })) event.preventDefault()
}

const columns = computed(() => ({ '--pei-timeline-cols': `repeat(${Math.max(props.items.length, 1)}, minmax(0, 1fr))` }))
</script>

<template>
  <nav :aria-label="ariaLabel" class="relative">
    <div
      aria-hidden="true"
      class="absolute bottom-3 start-[11px] top-3 w-0.5 bg-[#d6ddf5] dark:bg-gray-700 lg:bottom-auto lg:end-3 lg:start-3 lg:top-[11px] lg:h-0.5 lg:w-auto"
    />
    <ol class="relative grid gap-9 lg:gap-6 lg:[grid-template-columns:var(--pei-timeline-cols)]" :style="columns">
      <li v-for="item in items" :key="item.id" :style="peiStepStyle(item.tone)">
        <a
          :href="`#${item.anchor}`"
          class="group flex gap-4 rounded-lg text-brand-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue-500 dark:text-white lg:flex-col lg:gap-3"
          @click="onClick($event, item.anchor)"
        >
          <span
            aria-hidden="true"
            class="relative h-6 w-6 shrink-0 rounded-full border-4 border-white bg-[color:var(--pei-fill)] ring-2 ring-[color:var(--pei-fill)] dark:border-gray-900"
          />
          <span class="flex min-w-0 flex-col gap-2 lg:gap-3">
            <span class="text-[0.8125rem] font-extrabold uppercase tracking-[0.1em] text-[color:var(--pei-ink)] dark:text-[color:var(--pei-fill)]">
              {{ item.short }} · {{ item.year }}
            </span>
            <span v-if="item.focus" class="break-words text-lg font-extrabold leading-snug group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4 sm:text-[1.375rem] sm:leading-[1.3]">
              {{ item.focus }}
            </span>
          </span>
        </a>
      </li>
    </ol>
  </nav>
</template>
