<script setup lang="ts">
/** Bloc d'une phase du parcours (version longue des dispositifs) ; teintes fixées par la phase (`peiStepTone`). */
import type { PeiProgramPhase, PeiProgramPublic } from '~/types/api/entrepreneurship'

const props = withDefaults(defineProps<{
  phase: PeiProgramPhase
  programs: PeiProgramPublic[]
  index: number
  /** Faux quand le bloc est intégré dans une section qui porte déjà l'ancre et le titre. */
  standalone?: boolean
}>(), {
  standalone: true,
})

const { t } = useI18n()
const { localized } = useLocalizedField()
const { getImageVariantUrl } = useMediaApi()

const TONE_TEXT = 'text-[color:var(--pei-ink)] dark:text-[color:var(--pei-fill)]'

function programTitle(program: PeiProgramPublic): string {
  return localized(program, 'title')
}
function coverUrl(program: PeiProgramPublic): string | null {
  return program.cover_image_url ? getImageVariantUrl(program.cover_image_url, 'medium') : null
}
</script>

<template>
  <component
    :is="standalone ? 'section' : 'div'"
    :id="standalone ? PEI_PHASE_ANCHORS[phase] : undefined"
    :aria-labelledby="standalone ? `${PEI_PHASE_ANCHORS[phase]}-title` : undefined"
    :class="standalone ? 'scroll-mt-40 py-16 border-t border-gray-200 dark:border-gray-700 first:border-t-0' : ''"
    :style="peiStepStyle(peiStepTone(phase))"
  >
    <div v-if="standalone" class="flex items-center gap-4 mb-10">
      <span
        class="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-lg font-bold"
        :class="['bg-[color:var(--pei-soft)] dark:bg-[color:var(--pei-soft-dark)]', TONE_TEXT]"
      >
        {{ index }}
      </span>
      <h2 :id="`${PEI_PHASE_ANCHORS[phase]}-title`" class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
        {{ t(`pei.phases.${phase}`) }}
      </h2>
    </div>

    <article
      v-for="program in programs"
      :key="program.id"
      class="grid gap-8 lg:grid-cols-12 items-start mb-12 last:mb-0"
      :style="peiStepStyle(peiStepTone(program.phase))"
    >
      <div v-if="coverUrl(program)" class="lg:col-span-5">
        <img
          :src="coverUrl(program)!"
          :alt="programTitle(program)"
          class="w-full rounded-2xl aspect-[16/10] object-cover"
          loading="lazy"
        >
      </div>
      <div class="min-w-0" :class="coverUrl(program) ? 'lg:col-span-7' : 'lg:col-span-12'">
        <p class="text-xs font-semibold uppercase tracking-wider" :class="TONE_TEXT">
          {{ t(`pei.phases.${program.phase}`) }}
          <template v-if="program.sigle"> · {{ program.sigle }}</template>
        </p>
        <h3 class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ programTitle(program) }}
        </h3>
        <p v-if="localized(program, 'tagline')" class="mt-3 text-lg text-gray-600 dark:text-gray-300">
          {{ localized(program, 'tagline') }}
        </p>
        <p v-if="localized(program, 'highlight')" class="mt-3 font-semibold" :class="TONE_TEXT">
          {{ localized(program, 'highlight') }}
        </p>
        <RichTextRenderer
          v-if="localized(program, 'content_html')"
          :html="localized(program, 'content_html')"
          class="mt-4"
        />
      </div>
    </article>
  </component>
</template>
