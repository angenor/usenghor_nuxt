<script setup lang="ts">
/**
 * Carte d'actualité partagée (grille « Dernières actualités » de /actualites,
 * accueil du pôle PEI). Markup extrait à l'identique de pages/actualites/index.vue.
 */
import type { NewsDisplay } from '~/types/news'

interface Props {
  item: NewsDisplay
  showAssociations?: boolean
  imageVariant?: 'low' | 'medium'
}

const props = withDefaults(defineProps<Props>(), {
  showAssociations: true,
  imageVariant: 'low',
})

const { locale } = useI18n()
const localePath = useLocalePath()
const { localized } = useLocalizedField()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()

const coverImageUrl = computed(() => {
  if (props.item.cover_image_external_id) {
    const originalUrl = getMediaUrl(props.item.cover_image_external_id)
    return originalUrl ? getImageVariantUrl(originalUrl, props.imageVariant) : null
  }
  return props.item.cover_image || null
})

const title = computed(() => localized(props.item, 'title'))
const excerpt = computed(() => localized(props.item, 'summary'))

const formattedDate = computed(() => {
  if (!props.item.published_at) return ''
  return new Date(props.item.published_at).toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' },
  )
})

const hasAssociations = computed(() =>
  props.showAssociations && (props.item.sector_name || props.item.service_names?.length || props.item.project_name),
)
</script>

<template>
  <NuxtLink
    :to="localePath(`/actualites/${item.slug}`)"
    class="group block"
  >
    <div class="overflow-hidden rounded-xl">
      <img
        v-if="coverImageUrl"
        :src="coverImageUrl"
        :alt="title"
        class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      >
      <div v-else class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
      </div>
    </div>

    <div class="mt-4">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
        {{ title }}
      </h3>

      <!-- Badges d'association pour les cartes Latest News -->
      <div v-if="hasAssociations" class="flex flex-wrap gap-1 mt-2">
        <span
          v-if="item.sector_name"
          class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full"
        >
          {{ item.sector_name }}
        </span>
        <template v-if="item.service_names?.length">
          <span
            v-for="serviceName in item.service_names.slice(0, 2)"
            :key="serviceName"
            class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-full"
          >
            {{ serviceName }}
          </span>
          <span
            v-if="item.service_names.length > 2"
            class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-full"
            :title="item.service_names.slice(2).join(', ')"
          >
            +{{ item.service_names.length - 2 }}
          </span>
        </template>
        <span
          v-if="item.project_name"
          class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-full"
        >
          {{ item.project_name }}
        </span>
      </div>

      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
        {{ excerpt }}
      </p>

      <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {{ formattedDate }}
      </div>
    </div>
  </NuxtLink>
</template>
