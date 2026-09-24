<script setup lang="ts">
/**
 * Portrait à la une (page « Nos alumni ») : double page bleu nuit, grande photo à gauche,
 * verbatim en grand, nom, projet · département et liens (site, LinkedIn, vidéo…).
 * `sample` : portrait d'exemple du mode aperçu (étiquette « Exemple », liens `#` inertes).
 */
import type { PeiLaureatePublic } from '~/types/api/entrepreneurship'

const props = withDefaults(defineProps<{
  laureate: PeiLaureatePublic
  /** Pastille au-dessus du verbatim (« Lauréat FSE 1 · À la une »). */
  badge?: string
  sample?: boolean
}>(), {
  badge: undefined,
  sample: false,
})

const { t } = useI18n()
const { localized } = useLocalizedField()

const quote = computed(() => localized(props.laureate, 'quote'))
const department = computed(() => localized(props.laureate, 'department_label'))
const links = computed(() => peiLaureateLinks(props.laureate, props.sample))
const nameId = useId()

const photoFailed = ref(false)
watch(() => props.laureate.photo_url, () => { photoFailed.value = false })
</script>

<template>
  <article
    :aria-labelledby="nameId"
    class="grid overflow-hidden rounded-[2rem] bg-brand-blue-900 text-white dark:bg-brand-blue-950 dark:ring-1 dark:ring-inset dark:ring-white/10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] xl:grid-cols-[32.5rem_minmax(0,1fr)]"
  >
    <div class="relative min-h-[20rem] bg-brand-blue-800 sm:min-h-[26rem] lg:min-h-[35rem]">
      <img
        v-if="laureate.photo_url && !photoFailed"
        :src="laureate.photo_url"
        :alt="laureate.full_name"
        class="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        @error="photoFailed = true"
      >
      <div v-else class="absolute inset-0 flex items-center justify-center">
        <font-awesome-icon icon="fa-solid fa-user" class="h-16 w-16 text-brand-blue-300" aria-hidden="true" />
      </div>
      <span
        v-if="sample"
        class="absolute start-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-blue-900 shadow-sm"
      >
        {{ t('pei.alumni.sample') }}
      </span>
    </div>

    <div class="flex min-w-0 flex-col justify-center gap-6 p-8 sm:p-12 xl:p-16">
      <span v-if="badge" class="self-start rounded-full bg-[#ff8a8a]/20 px-3 py-1.5 text-[0.8125rem] font-bold text-[#ffc2c2]">
        {{ badge }}
      </span>
      <div aria-hidden="true" class="h-12 select-none text-[7.5rem] font-black leading-[0.5] text-[#ff8a8a] sm:h-16 sm:text-[10rem]">
        “
      </div>
      <blockquote class="break-words text-[1.25rem] font-bold leading-[1.4] tracking-[-0.01em] sm:text-[1.5rem] xl:text-[1.875rem]">
        <p>{{ quote }}</p>
      </blockquote>
      <div class="flex flex-wrap items-center justify-between gap-6 border-t border-white/15 pt-6">
        <div class="flex min-w-0 flex-col gap-1">
          <h3 :id="nameId" class="break-words text-xl font-extrabold">
            {{ laureate.full_name }}
          </h3>
          <p class="break-words text-[0.9375rem] text-brand-blue-200">
            {{ laureate.project_name }}<template v-if="department">
              · {{ department }}
            </template>
          </p>
        </div>
        <ul v-if="links.length" class="flex flex-wrap gap-2">
          <li v-for="link in links" :key="link.key">
            <a
              :href="link.url"
              :target="sample ? undefined : '_blank'"
              :rel="sample ? undefined : 'noopener noreferrer'"
              :aria-label="t(`pei.alumni.links.${link.key}`, { name: laureate.full_name })"
              class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              @click="sample && $event.preventDefault()"
            >
              <font-awesome-icon :icon="link.icon" class="h-5 w-5" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>
