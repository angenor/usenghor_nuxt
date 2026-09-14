<script setup lang="ts">
/** Carte d'une ressource de la boîte à outils : document à télécharger, lien ou vidéo externe. */
import type { PeiResourcePublic, PeiResourceType } from '~/types/api/entrepreneurship'

const props = defineProps<{
  resource: PeiResourcePublic
}>()

const { t } = useI18n()
const { localized } = useLocalizedField()

const TYPE_STYLES: Record<PeiResourceType, { icon: string, classes: string }> = {
  document: { icon: 'fa-solid fa-file-arrow-down', classes: 'bg-brand-blue-100 text-brand-blue-700 dark:bg-brand-blue-900/40 dark:text-brand-blue-300' },
  link: { icon: 'fa-solid fa-link', classes: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300' },
  video: { icon: 'fa-solid fa-circle-play', classes: 'bg-brand-red-100 text-brand-red-700 dark:bg-brand-red-900/40 dark:text-brand-red-300' },
}

/** Adresse de l'action ; null → carte masquée (média supprimé, adresse malformée). */
const target = computed(() => {
  const { type, media_url, url } = props.resource
  if (type === 'document') return media_url ? `${media_url}${media_url.includes('?') ? '&' : '?'}download=1` : null
  return isHttpUrl(url) ? url.trim() : null
})

const title = computed(() => localized(props.resource, 'title'))
const description = computed(() => localized(props.resource, 'description'))
const style = computed(() => TYPE_STYLES[props.resource.type] ?? TYPE_STYLES.link)
const videoId = computed(() => (props.resource.type === 'video' ? youTubeId(props.resource.url) : null))
const actionLabel = computed(() => {
  if (props.resource.type === 'document') return t('pei.resources.download')
  return props.resource.type === 'video' ? t('pei.resources.watch') : t('pei.resources.open')
})
</script>

<template>
  <article
    v-if="target"
    class="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-shadow hover:shadow-md"
  >
    <div v-if="videoId" class="aspect-video rounded-xl overflow-hidden relative bg-gray-100 dark:bg-gray-700">
      <img
        :src="`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`"
        :alt="title"
        class="w-full h-full object-cover"
        loading="lazy"
      >
      <span class="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <span class="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-brand-red-600 shadow">
          <font-awesome-icon icon="fa-solid fa-play" class="w-5 h-5 ms-0.5 rtl:-scale-x-100" />
        </span>
      </span>
    </div>
    <span v-else class="w-12 h-12 rounded-xl flex items-center justify-center" :class="style.classes" aria-hidden="true">
      <font-awesome-icon :icon="style.icon" class="w-5 h-5" />
    </span>

    <h3 class="font-bold text-gray-900 dark:text-white break-words">
      {{ title }}
    </h3>
    <p v-if="description" class="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
      {{ description }}
    </p>

    <a
      v-if="resource.type === 'document'"
      :href="target"
      download
      class="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-blue-700 dark:text-brand-blue-300 hover:underline"
    >
      <font-awesome-icon icon="fa-solid fa-download" class="w-3.5 h-3.5" aria-hidden="true" />
      {{ actionLabel }}
      <span class="sr-only">{{ title }}</span>
    </a>
    <a
      v-else
      :href="target"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-blue-700 dark:text-brand-blue-300 hover:underline"
    >
      {{ actionLabel }}
      <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="w-3.5 h-3.5 rtl:-scale-x-100" aria-hidden="true" />
      <span class="sr-only">{{ title }} {{ t('pei.common.openInNewTab') }}</span>
    </a>
  </article>
</template>
