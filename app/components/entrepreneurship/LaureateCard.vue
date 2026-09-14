<script setup lang="ts">
/** Carte portrait d'un lauréat FSE ou d'un étudiant-entrepreneur (page « Nos alumni »). */
import type { PeiLaureatePublic } from '~/types/api/entrepreneurship'

const props = defineProps<{
  laureate: PeiLaureatePublic
}>()

const { t } = useI18n()
const { localized } = useLocalizedField()

const LINKS = [
  { field: 'website_url', key: 'website', icon: 'fa-solid fa-globe' },
  { field: 'linkedin_url', key: 'linkedin', icon: 'fa-brands fa-linkedin-in' },
  { field: 'instagram_url', key: 'instagram', icon: 'fa-brands fa-instagram' },
  { field: 'facebook_url', key: 'facebook', icon: 'fa-brands fa-facebook-f' },
  { field: 'video_url', key: 'video', icon: 'fa-solid fa-play' },
] as const

const links = computed(() =>
  LINKS
    .map(link => ({ ...link, url: props.laureate[link.field] }))
    .filter((link): link is typeof link & { url: string } => isHttpUrl(link.url)),
)

const department = computed(() => localized(props.laureate, 'department_label'))
const quote = computed(() => localized(props.laureate, 'quote'))
</script>

<template>
  <article class="flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
    <div class="relative">
      <img
        v-if="laureate.photo_url"
        :src="laureate.photo_url"
        :alt="laureate.full_name"
        class="aspect-[4/3] w-full object-cover"
        loading="lazy"
      >
      <div v-else class="aspect-[4/3] bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <font-awesome-icon icon="fa-solid fa-user" class="w-10 h-10 text-gray-400" aria-hidden="true" />
      </div>
      <span
        v-if="laureate.is_featured"
        class="absolute top-3 start-3 rounded-full bg-white/90 dark:bg-gray-900/80 p-1.5 leading-none"
        :title="t('pei.alumni.featured')"
      >
        <font-awesome-icon icon="fa-solid fa-star" class="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
        <span class="sr-only">{{ t('pei.alumni.featured') }}</span>
      </span>
    </div>

    <div class="p-5 flex flex-1 flex-col gap-2">
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-bold text-gray-900 dark:text-white break-words">
          {{ laureate.full_name }}
        </h3>
        <span class="rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/40 text-brand-blue-700 dark:text-brand-blue-300 text-[11px] font-semibold px-2 py-0.5 shrink-0">
          {{ localized(laureate, 'cohort_label') }}
        </span>
      </div>
      <p class="text-brand-blue-600 dark:text-brand-blue-300 font-medium break-words">
        {{ laureate.project_name }}
      </p>
      <p v-if="department" class="text-sm text-gray-500 dark:text-gray-400">
        {{ department }}
      </p>
      <blockquote
        v-if="quote"
        class="mt-2 text-sm italic text-gray-600 dark:text-gray-300 border-s-2 border-brand-blue-200 dark:border-brand-blue-800 ps-3 break-words"
      >
        {{ quote }}
      </blockquote>

      <ul v-if="links.length" class="mt-auto pt-3 flex flex-wrap gap-2">
        <li v-for="link in links" :key="link.key">
          <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="t(`pei.alumni.links.${link.key}`, { name: laureate.full_name })"
            class="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 hover:border-brand-blue-300 transition-colors"
          >
            <font-awesome-icon :icon="link.icon" class="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </li>
      </ul>
    </div>
  </article>
</template>
