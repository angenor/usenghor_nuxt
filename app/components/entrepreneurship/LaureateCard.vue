<script setup lang="ts">
/**
 * Carte portrait d'un lauréat FSE ou d'un étudiant-entrepreneur (page « Nos alumni ») :
 * grande photo, nom, projet (teinte de la promotion), département, verbatim éventuel, liens.
 * `track` : étiquette de parcours (« SEE 1 · Idéation ») et ligne « projet · département » ;
 * `sample` : portrait d'exemple du mode aperçu (étiquette « Exemple », liens `#` inertes).
 */
import type { PeiLaureatePublic } from '~/types/api/entrepreneurship'
import type { PeiStepTone } from '~/utils/pei-presentation'

const props = withDefaults(defineProps<{
  laureate: PeiLaureatePublic
  /** Teinte de la promotion (nom du projet) ; bleu de la marque par défaut. */
  tone?: PeiStepTone | null
  /** Étiquette de parcours (vue étudiants-entrepreneurs). */
  track?: { label: string, tone: PeiStepTone } | null
  sample?: boolean
  headingTag?: 'h3' | 'h4'
  /** Photo un peu moins haute (grille à quatre colonnes). */
  compact?: boolean
}>(), {
  tone: null,
  track: null,
  sample: false,
  headingTag: 'h3',
  compact: false,
})

const { t } = useI18n()
const { localized } = useLocalizedField()

const links = computed(() => peiLaureateLinks(props.laureate, props.sample))
const department = computed(() => localized(props.laureate, 'department_label'))
const quote = computed(() => localized(props.laureate, 'quote'))

const photoFailed = ref(false)
watch(() => props.laureate.photo_url, () => { photoFailed.value = false })
</script>

<template>
  <article class="flex min-w-0 flex-col gap-3.5" :style="tone ? peiStepStyle(tone) : undefined">
    <div
      class="relative overflow-hidden rounded-[1.25rem] bg-[#e8ebf3] dark:bg-gray-800"
      :class="compact ? 'h-[17.5rem]' : 'h-[18.75rem]'"
    >
      <img
        v-if="laureate.photo_url && !photoFailed"
        :src="laureate.photo_url"
        :alt="laureate.full_name"
        class="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        @error="photoFailed = true"
      >
      <div v-else class="flex h-full items-center justify-center">
        <font-awesome-icon icon="fa-solid fa-user" class="h-12 w-12 text-gray-400 dark:text-gray-500" aria-hidden="true" />
      </div>
      <span
        v-if="sample"
        class="absolute start-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-blue-900 shadow-sm dark:bg-gray-950/85 dark:text-white"
      >
        {{ t('pei.alumni.sample') }}
      </span>
    </div>

    <span
      v-if="track"
      class="self-start rounded-full bg-[color:var(--pei-soft)] px-2.5 py-1 text-xs font-bold text-[color:var(--pei-ink)] dark:bg-[color:var(--pei-soft-dark)] dark:text-[color:var(--pei-fill)]"
      :style="peiStepStyle(track.tone)"
    >
      {{ track.label }}
    </span>

    <div class="flex min-w-0 flex-col gap-1">
      <component :is="headingTag" class="break-words text-lg font-extrabold text-brand-blue-900 dark:text-white sm:text-[1.1875rem]">
        {{ laureate.full_name }}
      </component>
      <p v-if="track" class="break-words text-sm text-gray-600 dark:text-gray-400">
        {{ laureate.project_name }}<template v-if="department">
          · {{ department }}
        </template>
      </p>
      <template v-else>
        <p
          class="break-words text-[0.9375rem] font-semibold"
          :class="tone ? 'text-[color:var(--pei-ink)] dark:text-[color:var(--pei-fill)]' : 'text-brand-blue-700 dark:text-brand-blue-300'"
        >
          {{ laureate.project_name }}
        </p>
        <p v-if="department" class="break-words text-sm text-gray-600 dark:text-gray-400">
          {{ department }}
        </p>
      </template>
    </div>

    <blockquote
      v-if="quote"
      class="line-clamp-5 border-s-2 border-gray-200 ps-3 text-sm italic leading-relaxed text-gray-600 dark:border-gray-700 dark:text-gray-300"
    >
      {{ quote }}
    </blockquote>

    <ul v-if="links.length" class="flex flex-wrap gap-2">
      <li v-for="link in links" :key="link.key">
        <a
          :href="link.url"
          :target="sample ? undefined : '_blank'"
          :rel="sample ? undefined : 'noopener noreferrer'"
          :aria-label="t(`pei.alumni.links.${link.key}`, { name: laureate.full_name })"
          class="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-brand-blue-700 transition-colors hover:border-brand-blue-300 hover:text-brand-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-brand-blue-300 dark:hover:text-white"
          @click="sample && $event.preventDefault()"
        >
          <font-awesome-icon :icon="link.icon" class="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
        </a>
      </li>
    </ul>
  </article>
</template>
