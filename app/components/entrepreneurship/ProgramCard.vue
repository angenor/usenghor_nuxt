<script setup lang="ts">
/**
 * Carte d'un dispositif du parcours (accueil du pôle) : grand numéro et phase à la teinte
 * de sa phase (`peiStepTone` : couleur fixe par phase, le champ `color` du dispositif n'est pas lu),
 * titre, accroche et pastille du chiffre mis en avant (`highlight`).
 */
import type { PeiProgramPublic } from '~/types/api/entrepreneurship'

const props = defineProps<{
  program: PeiProgramPublic
  index: number
  to?: string
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { previewPath } = usePeiPreview()
const { localized } = useLocalizedField()

const NuxtLink = resolveComponent('NuxtLink')

const title = computed(() => {
  const base = localized(props.program, 'title')
  const sigle = props.program.sigle
  return sigle && !base.includes(sigle) ? `${base} (${sigle})` : base
})
const tagline = computed(() => localized(props.program, 'tagline'))
const highlight = computed(() => localized(props.program, 'highlight'))
const toneStyle = computed(() => peiStepStyle(peiStepTone(props.program.phase)))
</script>

<template>
  <component
    :is="to ? NuxtLink : 'div'"
    :to="to ? previewPath(localePath(to)) : undefined"
    :style="toneStyle"
    class="flex h-full flex-col gap-3.5 rounded-[20px] bg-white px-6 py-7 text-brand-blue-900 shadow-sm dark:bg-gray-800 dark:text-white"
    :class="to ? 'transition-shadow duration-300 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue-500' : ''"
  >
    <span class="text-5xl font-black leading-none tracking-[-0.04em] text-[color:var(--pei-ink)] dark:text-[color:var(--pei-fill)]" aria-hidden="true">
      {{ String(index).padStart(2, '0') }}
    </span>
    <span class="text-xs font-extrabold uppercase tracking-[0.1em] text-[color:var(--pei-ink)] dark:text-[color:var(--pei-fill)]">
      {{ t(`pei.phases.${program.phase}`) }}
    </span>
    <h3 class="text-[21px] font-extrabold leading-tight">
      {{ title }}
    </h3>
    <p v-if="tagline" class="text-[15px] leading-relaxed text-gray-600 dark:text-gray-300">
      {{ tagline }}
    </p>
    <p
      v-if="highlight"
      class="mt-auto self-start rounded-full bg-[color:var(--pei-soft)] px-3 py-1.5 text-[13px] font-bold text-[color:var(--pei-ink)] dark:bg-[color:var(--pei-soft-dark)] dark:text-[color:var(--pei-fill)]"
    >
      {{ highlight }}
    </p>
  </component>
</template>
