<script setup lang="ts">
/**
 * Étape du parcours en grand format éditorial (« Nos activités », étapes 01 et 02) :
 * grand numéro coloré, accroche de phase, titre, contenu riche, visuel et carte « À retenir »
 * (chiffre mis en avant du dispositif). Sans visuel, un panneau typographique (sigle) le remplace.
 *
 * Composition (maquette) : sans carte, visuel pleine colonne (460 px, rayon 24) ; avec carte,
 * visuel de 75 % × 340 px dans un cadre de 420 px, carte de 300 px en surimpression dans le
 * coin opposé (en bas). `fallbackImage` (additif, mode aperçu) : photo d'exemple quand le
 * dispositif n'a pas de visuel ; absente → rendu inchangé.
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
  /** Photo d'exemple (aperçu) si le dispositif n'a pas de visuel. */
  fallbackImage?: string | null
}>(), {
  reverse: false,
  anchorId: undefined,
  fallbackImage: null,
})

const { t, te } = useI18n()
const { localized } = useLocalizedField()
const { getImageVariantUrl } = useMediaApi()

const title = computed(() => localized(props.program, 'title'))
const body = computed(() => localized(props.program, 'content_html'))
const tagline = computed(() => localized(props.program, 'tagline'))
const keyPoints = computed(() => splitHighlight(localized(props.program, 'highlight')))
const realCover = computed(() => (props.program.cover_image_url ? getImageVariantUrl(props.program.cover_image_url, 'medium') : null))
const failed = ref<string[]>([])
/** Visuel du dispositif, sinon photo d'exemple (aperçu), sinon aucun. */
const cover = computed(() => [realCover.value, props.fallbackImage].find(src => !!src && !failed.value.includes(src)) ?? null)
/** La photo d'exemple n'illustre pas le dispositif : texte alternatif vide. */
const coverAlt = computed(() => (cover.value && cover.value === realCover.value ? title.value : ''))
/** Libellé de la carte : propre à la phase (« Le statut ouvre droit à »), sinon « À retenir ». */
const keyPointsLabel = computed(() => {
  const key = `pei.activities.keyPointsLabel.${props.program.phase}`
  return te(key) ? t(key) : t('pei.activities.keyPoints')
})
const withCard = computed(() => keyPoints.value.length > 0)
/** Taille du visuel (ou du panneau typographique) selon la présence de la carte. */
const mediaClass = computed(() => (withCard.value
  ? ['h-72 sm:h-96 lg:absolute lg:top-0 lg:h-[340px] lg:w-[75%]', props.reverse ? 'lg:start-0' : 'lg:end-0']
  : ['h-72 sm:h-96 lg:h-[460px]']))
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

    <!-- Visuel + carte « À retenir » (en surimpression, coin opposé au visuel) -->
    <div class="relative min-w-0" :class="[{ 'lg:order-1': reverse }, withCard ? 'lg:h-[420px]' : '']">
      <img
        v-if="cover"
        :key="cover"
        :src="cover"
        :alt="coverAlt"
        class="w-full rounded-3xl object-cover"
        :class="mediaClass"
        loading="lazy"
        decoding="async"
        @error="failed.push(cover)"
      >
      <div
        v-else
        class="flex w-full items-start justify-start overflow-hidden rounded-3xl p-8 bg-[color:var(--pei-soft)] dark:bg-[color:var(--pei-soft-dark)]"
        :class="mediaClass"
        aria-hidden="true"
      >
        <span class="text-6xl sm:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tighter break-all text-[color:var(--pei-ink)] opacity-25 dark:text-[color:var(--pei-fill)] dark:opacity-40">
          {{ monogram }}
        </span>
      </div>

      <div
        v-if="withCard"
        class="relative -mt-16 mx-4 sm:mx-8 flex flex-col gap-2.5 rounded-[20px] p-7 bg-[color:var(--pei-ink)] text-white shadow-[0_24px_48px_rgba(46,16,101,.25)] lg:absolute lg:bottom-0 lg:mx-0 lg:mt-0 lg:w-[300px]"
        :class="reverse ? 'lg:end-0' : 'lg:start-0'"
      >
        <p class="text-[13px] font-bold uppercase tracking-[0.08em] text-white/80">
          {{ keyPointsLabel }}
        </p>
        <ul class="flex flex-col divide-y divide-white/20">
          <li v-for="point in keyPoints" :key="point" class="py-2.5 first:pt-0 last:pb-0 text-xl font-extrabold leading-[1.3]">
            {{ point }}
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>
