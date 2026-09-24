<script setup lang="ts">
/**
 * Liste des événements de la DDE : liste compacte (par défaut, rubrique « Actualités »)
 * ou agenda à grandes dates (`variant="agenda"`, « Nos activités » ; titre en h2, lien `moreTo`).
 */
import type { EventPublic } from '~/composables/usePublicEventsApi'

withDefaults(defineProps<{
  events: EventPublic[]
  title?: string
  variant?: 'list' | 'agenda'
  /** Agenda : lien « Tout l'agenda » (chemin interne sans préfixe de langue). */
  moreTo?: string
  moreLabel?: string
  headingId?: string
}>(), {
  title: undefined,
  variant: 'list',
  moreTo: undefined,
  moreLabel: undefined,
  headingId: undefined,
})

const { t, te, locale } = useI18n()
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

// Agenda : grand jour + mois abrégé, lieu · format
function dayOf(iso: string): string {
  return new Date(iso).toLocaleDateString(dateLocale.value, { day: '2-digit' })
}
function monthOf(iso: string): string {
  return new Date(iso).toLocaleDateString(dateLocale.value, { month: 'short', year: 'numeric' })
}
function formatLabel(event: EventPublic): string {
  if (event.type === 'other') return event.type_other?.trim() || ''
  const key = `actualites.events.types.${event.type}`
  return te(key) ? t(key) : ''
}
function agendaMeta(event: EventPublic): string {
  return [placeLabel(event), formatLabel(event)].filter(Boolean).join(' · ')
}
</script>

<template>
  <div v-if="events.length && variant === 'agenda'">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-8">
      <h2 :id="headingId" class="text-3xl sm:text-4xl font-black tracking-tight text-brand-blue-900 dark:text-white">
        {{ title ?? t('pei.activities.agenda.title') }}
      </h2>
      <NuxtLink
        v-if="moreTo"
        :to="localePath(moreTo)"
        class="inline-flex items-center gap-2 font-bold text-brand-blue-500 hover:text-brand-blue-700 dark:text-brand-blue-300 dark:hover:text-brand-blue-200"
      >
        {{ moreLabel ?? t('pei.activities.agenda.all') }}
        <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
      </NuxtLink>
    </div>
    <ul class="border-t-2 border-brand-blue-900 dark:border-white/70">
      <li v-for="event in events" :key="event.id" class="border-b border-gray-200 dark:border-gray-700">
        <NuxtLink
          :to="localePath(`/actualites/evenements/${event.slug}`)"
          class="group grid grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[8.75rem_minmax(0,1fr)_auto] md:grid-cols-[8.75rem_minmax(0,1fr)_12.5rem_2.5rem] items-center gap-x-4 sm:gap-x-6 gap-y-1 py-6 sm:py-7 text-brand-blue-900 dark:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue-500"
        >
          <time :datetime="event.start_date" class="row-span-2 sm:row-span-1 flex flex-col">
            <span class="text-3xl sm:text-4xl font-black leading-none tabular-nums" aria-hidden="true">{{ dayOf(event.start_date) }}</span>
            <span class="mt-1 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400" aria-hidden="true">{{ monthOf(event.start_date) }}</span>
            <span class="sr-only">{{ dateLabel(event) }}</span>
          </time>
          <h3 class="text-lg sm:text-[1.375rem] font-extrabold leading-snug break-words group-hover:text-brand-blue-500 dark:group-hover:text-brand-blue-300 transition-colors">
            {{ localized(event, 'title') }}
          </h3>
          <span v-if="agendaMeta(event)" class="col-start-2 sm:col-start-auto text-sm text-gray-600 dark:text-gray-400 break-words">
            {{ agendaMeta(event) }}
          </span>
          <font-awesome-icon
            icon="fa-solid fa-arrow-right"
            class="hidden md:block w-5 h-5 justify-self-end rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
            aria-hidden="true"
          />
        </NuxtLink>
      </li>
    </ul>
  </div>

  <div v-else-if="events.length">
    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
      {{ title ?? t('pei.activities.upcomingEvents') }}
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
