<script setup lang="ts">
/**
 * Carte d'un dispositif d'accompagnement opérationnel (« Nos activités », section bleu nuit) :
 * « Phase n · … », numéro d'étape, titre, contenu riche et chiffre mis en avant en pied de carte.
 * `light` = carte blanche mise en avant (dernière marche de l'escalier).
 */
import type { PeiProgramPublic } from '~/types/api/entrepreneurship'
import type { PeiStepTone } from '~/utils/pei-presentation'

const props = withDefaults(defineProps<{
  program: PeiProgramPublic
  number: string
  /** Rang de la phase dans l'accompagnement opérationnel (1, 2, 3…). */
  phaseRank: number
  tone: PeiStepTone
  variant?: 'dark' | 'darker' | 'light'
  anchorId?: string
}>(), {
  variant: 'dark',
  anchorId: undefined,
})

const { t } = useI18n()
const { localized } = useLocalizedField()

const title = computed(() => localized(props.program, 'title'))
const body = computed(() => localized(props.program, 'content_html'))
const tagline = computed(() => localized(props.program, 'tagline'))
const highlight = computed(() => splitHighlight(localized(props.program, 'highlight')))
const isLight = computed(() => props.variant === 'light')
const titleId = computed(() => `pei-card-${props.program.code}-title`)

const surface = computed(() => ({
  dark: 'bg-brand-blue-800 dark:bg-brand-blue-900 text-white',
  darker: 'bg-[#1b2d70] dark:bg-brand-blue-800 text-white',
  light: 'bg-white text-brand-blue-900 shadow-2xl shadow-black/40 dark:bg-gray-800 dark:text-white dark:ring-1 dark:ring-white/10',
}[props.variant]))

/** Couleur d'accent : claire sur fond sombre, foncée (contraste AA) sur la carte blanche. */
const accent = computed(() => (isLight.value
  ? 'text-[color:var(--pei-ink)] dark:text-[color:var(--pei-fill)]'
  : 'text-[color:var(--pei-fill)]'))
</script>

<template>
  <article
    :id="anchorId"
    :aria-labelledby="titleId"
    class="scroll-mt-40 flex flex-col gap-5 rounded-3xl p-7 sm:p-9"
    :class="surface"
    :style="peiStepStyle(tone)"
  >
    <div class="flex items-center justify-between gap-4">
      <span class="text-xs sm:text-[0.8125rem] font-extrabold uppercase tracking-widest" :class="accent">
        {{ t('pei.activities.support.phaseLabel', { n: phaseRank, phase: t(`pei.phases.${program.phase}`) }) }}
      </span>
      <span class="text-4xl sm:text-[2.75rem] font-black leading-none tabular-nums" :class="accent" aria-hidden="true">
        {{ number }}
      </span>
    </div>

    <h3 :id="titleId" class="text-2xl sm:text-3xl font-extrabold tracking-tight">
      {{ title }}
    </h3>

    <RichTextRenderer
      v-if="body"
      :html="body"
      :class="isLight ? 'text-gray-700 dark:text-gray-300' : 'prose-invert text-brand-blue-100'"
    />
    <p v-else-if="tagline" class="leading-relaxed" :class="isLight ? 'text-gray-700 dark:text-gray-300' : 'text-brand-blue-100'">
      {{ tagline }}
    </p>

    <div
      v-if="highlight.length"
      class="mt-auto pt-5 border-t flex flex-wrap items-baseline gap-x-3 gap-y-1"
      :class="isLight ? 'border-gray-200 dark:border-white/10' : 'border-white/15'"
    >
      <span class="font-black tracking-tight leading-none" :class="isLight ? 'text-5xl sm:text-6xl' : 'text-4xl sm:text-[2.75rem]'">
        {{ highlight[0] }}
      </span>
      <span
        v-if="highlight.length > 1"
        class="text-sm"
        :class="isLight ? 'text-gray-600 dark:text-gray-300' : 'text-brand-blue-200'"
      >
        {{ highlight.slice(1).join(' · ') }}
      </span>
    </div>
  </article>
</template>
