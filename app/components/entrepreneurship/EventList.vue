<script setup lang="ts">
/** Liste des prochains événements de la DDE (« Nos activités »). */
import type { EventPublic } from '~/composables/usePublicEventsApi'

defineProps<{
  events: EventPublic[]
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { localized } = useLocalizedField()

const dateLocale = computed(() => (locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR'))

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(dateLocale.value, { day: 'numeric', month: 'long', year: 'numeric' })
}

function dateLabel(event: EventPublic): string {
  const start = formatDay(event.start_date)
  if (!event.end_date) return start
  const end = formatDay(event.end_date)
  return end === start ? start : `${start} – ${end}`
}

function placeLabel(event: EventPublic): string {
  if (event.is_online) return t('pei.activities.online')
  return [event.venue, event.city].filter(Boolean).join(', ')
}
</script>

<template>
  <div v-if="events.length">
    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
      {{ t('pei.activities.upcomingEvents') }}
    </h3>
    <ul class="divide-y divide-gray-200 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <li v-for="event in events" :key="event.id" class="flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
        <span class="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue-700 dark:text-brand-blue-300">
          <font-awesome-icon icon="fa-regular fa-calendar" class="w-4 h-4" aria-hidden="true" />
          <time :datetime="event.start_date">{{ dateLabel(event) }}</time>
        </span>
        <NuxtLink
          :to="localePath(`/actualites/evenements/${event.slug}`)"
          class="min-w-0 flex-1 font-medium text-gray-900 dark:text-white hover:text-brand-blue-600 dark:hover:text-brand-blue-400 break-words"
        >
          {{ localized(event, 'title') }}
        </NuxtLink>
        <span v-if="placeLabel(event)" class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <font-awesome-icon :icon="event.is_online ? 'fa-solid fa-video' : 'fa-solid fa-location-dot'" class="w-3.5 h-3.5" aria-hidden="true" />
          {{ placeLabel(event) }}
        </span>
      </li>
    </ul>
  </div>
</template>
