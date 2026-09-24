<script setup lang="ts">
/**
 * Encadré citation + impact de l'accueil du pôle :
 * portrait avec carte nom / fonction en surimpression, grand guillemet et citation ;
 * en dessous, bloc impact (titre, chiffres facultatifs, texte) à côté d'une photo.
 * Sans portrait, la carte nom / fonction passe sous la citation ; sans photo d'impact,
 * le texte occupe toute la largeur. Avec au moins un chiffre d'impact, les chiffres s'affichent
 * en grand (bleu nuit / bleu / rouge foncé) et le texte devient un paragraphe courant.
 * Aucun emplacement vide n'est affiché.
 */
import type { PeiEditorialStat } from '~/utils/pei-presentation'

const props = defineProps<{
  quote: string
  author?: string | null
  role?: string | null
  authorImage?: string | null
  impactTitle?: string | null
  impactText?: string | null
  /** Chiffres d'impact (additif) : absents ou vides → rendu inchangé. */
  impactStats?: PeiEditorialStat[]
  impactImage?: string | null
}>()

const portraitFailed = ref(false)
const impactFailed = ref(false)
const portrait = computed(() => (!portraitFailed.value && props.authorImage) || null)
const impactPhoto = computed(() => (!impactFailed.value && props.impactImage) || null)

/** Le texte d'impact peut être du HTML (éditeur riche) ou du texte brut. */
const impactIsHtml = computed(() => /<[a-z][\s\S]*>/i.test(props.impactText ?? ''))

const impactFigures = computed(() => props.impactStats ?? [])
const hasImpact = computed(() => !!props.impactText || impactFigures.value.length > 0)

/** Couleurs des chiffres d'impact, dans l'ordre (maquette : bleu nuit, bleu, rouge foncé). */
const FIGURE_COLORS = [
  'text-brand-blue-900 dark:text-white',
  'text-brand-blue-500 dark:text-brand-blue-300',
  'text-brand-red-700 dark:text-brand-red-300',
]
const FIGURE_COLUMNS: Record<number, string> = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }
</script>

<template>
  <section class="bg-white py-20 dark:bg-gray-900 lg:py-28">
    <div class="mx-auto flex max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:gap-20 lg:px-8">
      <figure
        class="m-0 grid items-center gap-10 lg:gap-20"
        :class="portrait ? 'lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]' : ''"
      >
        <!-- Portrait (la carte nom / fonction est superposée via la grille) -->
        <div
          v-if="portrait"
          class="col-start-1 row-start-1 h-[420px] pb-12 sm:h-[540px]"
        >
          <img
            :src="portrait"
            :alt="author || ''"
            class="h-full w-full rounded-[28px] object-cover"
            loading="lazy"
            decoding="async"
            @error="portraitFailed = true"
          >
        </div>

        <div class="flex min-w-0 flex-col gap-2" :class="portrait ? 'row-start-2 lg:col-start-2 lg:row-start-1' : 'max-w-5xl'">
          <span
            class="block h-16 select-none font-black leading-[.6] text-brand-red-300 text-[140px] sm:h-24 sm:text-[200px] rtl:-scale-x-100"
            aria-hidden="true"
          >“</span>
          <blockquote class="m-0 text-2xl font-bold leading-snug tracking-[-0.015em] text-brand-blue-900 dark:text-white sm:text-3xl lg:text-[34px] lg:leading-[1.4]">
            <p>{{ quote }}</p>
          </blockquote>
        </div>

        <figcaption
          v-if="author"
          class="flex flex-col gap-1 rounded-[18px] bg-brand-blue-900 px-6 py-5 text-white shadow-[0_20px_40px_rgba(14,24,64,.25)] dark:bg-brand-blue-800"
          :class="portrait ? 'z-10 col-start-1 row-start-1 mx-6 self-end sm:mx-8' : 'justify-self-start'"
        >
          <span class="text-lg font-extrabold">{{ author }}</span>
          <span v-if="role" class="text-sm text-brand-blue-200">{{ role }}</span>
        </figcaption>
      </figure>

      <div
        v-if="hasImpact"
        class="grid gap-10 border-t border-gray-200 pt-16 dark:border-gray-700 lg:gap-16 lg:pt-[72px]"
        :class="impactPhoto ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]' : ''"
      >
        <div class="flex min-w-0 flex-col" :class="[impactPhoto ? '' : 'max-w-4xl', impactFigures.length ? 'gap-8' : 'gap-6']">
          <h2 v-if="impactTitle" class="text-[13px] font-bold uppercase tracking-[0.12em] text-brand-red-700 dark:text-brand-red-300">
            {{ impactTitle }}
          </h2>

          <!-- Chiffres d'impact : nombre géant, signe (« + ») plus petit, libellé dessous -->
          <dl
            v-if="impactFigures.length"
            class="grid grid-cols-1 gap-x-6 gap-y-8"
            :class="FIGURE_COLUMNS[Math.min(impactFigures.length, 3)]"
          >
            <div
              v-for="(figure, index) in impactFigures"
              :key="index"
              class="flex min-w-0 flex-col-reverse justify-end gap-1.5"
            >
              <dt class="text-[15px] leading-snug text-gray-600 dark:text-gray-400">
                {{ figure.label }}
              </dt>
              <!-- Nombre et signe toujours dans l'ordre « 500+ », y compris en arabe -->
              <dd
                dir="ltr"
                class="flex items-start font-black leading-none tracking-[-0.04em] tabular-nums rtl:justify-end"
                :class="FIGURE_COLORS[index % FIGURE_COLORS.length]"
              >
                <template v-if="figure.numeric">
                  <span v-if="figure.prefix" class="text-[clamp(1.75rem,3vw,2.5rem)]">{{ figure.prefix }}</span>
                  <span class="text-[clamp(3.5rem,6vw,4.5rem)]">{{ figure.number }}</span>
                  <span v-if="figure.suffix" class="text-[clamp(1.75rem,3vw,2.5rem)]">{{ figure.suffix }}</span>
                </template>
                <span v-else class="break-words text-4xl sm:text-5xl">{{ figure.value }}</span>
              </dd>
            </div>
          </dl>

          <template v-if="impactText">
            <RichTextRenderer
              v-if="impactIsHtml"
              :html="impactText"
              :class="impactFigures.length
                ? 'prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-[1.75] text-[17px]'
                : 'prose-lg prose-p:text-brand-blue-900 dark:prose-p:text-gray-100'"
            />
            <p
              v-else-if="impactFigures.length"
              class="text-[17px] leading-[1.75] text-gray-700 dark:text-gray-300"
            >
              {{ impactText }}
            </p>
            <p v-else class="text-xl font-semibold leading-relaxed text-brand-blue-900 dark:text-gray-100 sm:text-2xl sm:leading-relaxed">
              {{ impactText }}
            </p>
          </template>
        </div>
        <img
          v-if="impactPhoto"
          :src="impactPhoto"
          alt=""
          class="h-full min-h-[320px] w-full rounded-3xl object-cover"
          loading="lazy"
          decoding="async"
          @error="impactFailed = true"
        >
      </div>
    </div>
  </section>
</template>
