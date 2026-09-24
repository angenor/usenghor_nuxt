<script setup lang="ts">
/**
 * Étape du parcours en grand format éditorial (« Nos activités », étapes 01 et 02) :
 * grand numéro coloré, accroche de phase, titre, contenu riche, visuel et carte « À retenir »
 * (chiffre mis en avant du dispositif). Sans visuel, un panneau typographique (sigle) le remplace.
 */
import type { PeiProgramPublic } from '~/types/api/entrepreneurship'
import type { PeiStepTone } from '~/utils/pei-presentation'

const props = withDefaults(defineProps<{
  program: PeiProgramPublic
  number: string
  tone: PeiStepTone
  /** Visuel à gauche, texte à droite (alternance). */
  reverse?: boolean
  anchorId?: string
}>(), {
  reverse: false,
  anchorId: undefined,
})

const { t } = useI18n()
const { localized } = useLocalizedField()
const { getImageVariantUrl } = useMediaApi()

const title = computed(() => localized(props.program, 'title'))
const body = computed(() => localized(props.program, 'content_html'))
const tagline = computed(() => localized(props.program, 'tagline'))
const keyPoints = computed(() => splitHighlight(localized(props.program, 'highlight')))
const cover = computed(() => (props.program.cover_image_url ? getImageVariantUrl(props.program.cover_image_url, 'medium') : null))
const coverFailed = ref(false)
const showCover = computed(() => !!cover.value && !coverFailed.value)
const monogram = computed(() => (props.program.sigle || title.value).trim())
const titleId = computed(() => `pei-step-${props.program.code}-title`)
</script>

<template>
  <article
    :id="anchorId"
    :aria-labelledby="titleId"
    class="scroll-mt-40 grid gap-10 lg:gap-20 lg:grid-cols-2 items-center"
    :style="peiStepStyle(tone)"
  >
    <!-- Texte -->
    <div class="min-w-0 flex flex-col gap-5" :class="{ 'lg:order-2': reverse }">
      <div class="flex flex-wrap items-baseline gap-x-5 gap-y-2">
        <span
          class="text-7xl sm:text-8xl lg:text-[7.5rem] leading-[0.8] font-black tracking-tighter tabular-nums text-[color:var(--pei-ink)] dark:text-[color:var(--pei-fill)]"
          aria-hidden="true"
        >{{ number }}</span>
        <span class="text-xs sm:text-sm font-bold uppercase tracking-widest text-[color:var(--pei-ink)] dark:text-[color:var(--pei-fill)]">
          {{ t(`pei.activities.phaseEyebrow.${program.phase}`) }}
        </span>
      </div>
      <h3 :id="titleId" class="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-blue-900 dark:text-white">
        {{ title }}
      </h3>
      <RichTextRenderer
        v-if="body"
        :html="body"
        class="prose-lg text-gray-700 dark:text-gray-300"
      />
      <p v-else-if="tagline" class="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
        {{ tagline }}
      </p>
      <slot />
    </div>

    <!-- Visuel + carte « À retenir » -->
    <div class="min-w-0 relative" :class="{ 'lg:order-1': reverse }">
      <img
        v-if="showCover"
        :src="cover!"
        :alt="title"
        class="w-full h-72 sm:h-96 lg:h-[28rem] rounded-3xl object-cover"
        :class="{ 'lg:w-[85%]': keyPoints.length, 'lg:ms-auto': keyPoints.length && !reverse }"
        loading="lazy"
        decoding="async"
        @error="coverFailed = true"
      >
      <div
        v-else
        class="flex min-h-[16rem] sm:min-h-[20rem] lg:min-h-[26rem] items-start justify-start overflow-hidden rounded-3xl p-8 bg-[color:var(--pei-soft)] dark:bg-[color:var(--pei-soft-dark)]"
        aria-hidden="true"
      >
        <span class="text-6xl sm:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tighter break-all text-[color:var(--pei-ink)] opacity-25 dark:text-[color:var(--pei-fill)] dark:opacity-40">
          {{ monogram }}
        </span>
      </div>

      <div
        v-if="keyPoints.length"
        class="relative -mt-16 mx-4 sm:mx-8 lg:absolute lg:mx-0 lg:mt-0 lg:bottom-0 lg:w-80 flex flex-col gap-3 rounded-2xl p-7 bg-[color:var(--pei-ink)] text-white shadow-2xl shadow-black/25"
        :class="reverse ? 'lg:end-0 lg:-mb-8' : 'lg:start-0 lg:-mb-8'"
      >
        <p class="text-xs font-bold uppercase tracking-widest text-white/80">
          {{ t('pei.activities.keyPoints') }}
        </p>
        <ul class="flex flex-col divide-y divide-white/20">
          <li v-for="point in keyPoints" :key="point" class="py-2 first:pt-0 last:pb-0 text-xl font-extrabold leading-snug">
            {{ point }}
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>
