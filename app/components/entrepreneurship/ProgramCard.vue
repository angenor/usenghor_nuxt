<script setup lang="ts">
/** Carte d'un dispositif du parcours (accueil du pôle) — palette unique bleu marque, la couleur du dispositif n'est pas utilisée ici. */
import type { PeiProgramPublic } from '~/types/api/entrepreneurship'

const props = defineProps<{
  program: PeiProgramPublic
  index: number
  to?: string
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { localized } = useLocalizedField()

const NuxtLink = resolveComponent('NuxtLink')

const title = computed(() => {
  const base = localized(props.program, 'title')
  const sigle = props.program.sigle
  return sigle && !base.includes(sigle) ? `${base} (${sigle})` : base
})
const tagline = computed(() => localized(props.program, 'tagline'))
const highlight = computed(() => localized(props.program, 'highlight'))
</script>

<template>
  <component
    :is="to ? NuxtLink : 'div'"
    :to="to ? localePath(to) : undefined"
    class="flex flex-col gap-3 h-full rounded-xl border-2 border-t-4 border-gray-200 dark:border-gray-700 border-t-brand-blue-600 dark:border-t-brand-blue-500 bg-white dark:bg-gray-800 p-6"
    :class="to ? 'transition-shadow duration-300 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue-500' : ''"
  >
    <div class="flex items-center justify-between gap-3">
      <span
        class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold bg-brand-blue-600 text-white dark:bg-brand-blue-500"
      >
        {{ index }}
      </span>
      <span class="text-xs font-semibold uppercase tracking-wider text-end text-brand-blue-700 dark:text-brand-blue-300">
        {{ t(`pei.phases.${program.phase}`) }}
      </span>
    </div>
    <h3 class="text-[17px] font-bold leading-snug text-gray-900 dark:text-white">
      {{ title }}
    </h3>
    <p v-if="tagline" class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
      {{ tagline }}
    </p>
    <p v-if="highlight" class="mt-auto text-sm font-semibold text-brand-blue-700 dark:text-brand-blue-300">
      {{ highlight }}
    </p>
  </component>
</template>
