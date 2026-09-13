<script setup lang="ts">
import type { PeiDashboardStats } from '~/types/api/entrepreneurship'

const props = defineProps<{
  stats: PeiDashboardStats | null
  loading: boolean
}>()

type CardColor = 'blue' | 'green' | 'purple' | 'amber' | 'red'

const colorClasses: Record<CardColor, { icon: string, text: string }> = {
  blue: { icon: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400' },
  green: { icon: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-600 dark:text-green-400' },
  purple: { icon: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-600 dark:text-purple-400' },
  amber: { icon: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400' },
  red: { icon: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-600 dark:text-red-400' },
}

const cards = computed(() => [
  {
    id: 'programs',
    label: 'Dispositifs du parcours',
    icon: 'fa-solid fa-route',
    color: 'blue' as CardColor,
    to: '/admin/entrepreneuriat/dispositifs',
    count: props.stats?.programs.active ?? 0,
    total: props.stats?.programs.total ?? 0,
    badge: 'Actifs',
  },
  {
    id: 'cohorts',
    label: 'Cohortes',
    icon: 'fa-solid fa-people-group',
    color: 'green' as CardColor,
    to: '/admin/entrepreneuriat/cohortes',
    count: props.stats?.cohorts.active ?? 0,
    total: props.stats?.cohorts.total ?? 0,
    badge: 'Actives',
  },
  {
    id: 'resources',
    label: 'Boîte à outils',
    icon: 'fa-solid fa-toolbox',
    color: 'purple' as CardColor,
    to: '/admin/entrepreneuriat/ressources',
    count: props.stats?.resources.published ?? 0,
    total: props.stats?.resources.total ?? 0,
    badge: 'Publiées',
  },
  {
    id: 'laureates',
    label: 'Lauréats et étudiants-entrepreneurs',
    icon: 'fa-solid fa-award',
    color: 'amber' as CardColor,
    to: '/admin/entrepreneuriat/laureats',
    count: props.stats?.laureates.published ?? 0,
    total: props.stats?.laureates.total ?? 0,
    badge: 'Publiés',
  },
  {
    id: 'partners',
    label: 'Partenaires du pôle',
    icon: 'fa-solid fa-handshake',
    color: 'red' as CardColor,
    to: '/admin/entrepreneuriat/partenaires',
    count: props.stats?.partners.active ?? 0,
    total: props.stats?.partners.total ?? 0,
    badge: 'Actifs',
  },
])
</script>

<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
    <NuxtLink
      v-for="card in cards"
      :key="card.id"
      :to="card.to"
      class="group rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="flex items-center justify-between">
        <div :class="['flex h-12 w-12 items-center justify-center rounded-lg', colorClasses[card.color].icon]">
          <font-awesome-icon :icon="card.icon" :class="['h-6 w-6', colorClasses[card.color].text]" />
        </div>
        <span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          {{ card.badge }} / total
        </span>
      </div>
      <div class="mt-4">
        <div v-if="loading" class="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <p v-else class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ card.count }}
          <span class="text-base font-medium text-gray-500 dark:text-gray-400">/ {{ card.total }}</span>
        </p>
        <p class="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          {{ card.label }}
          <font-awesome-icon
            icon="fa-solid fa-arrow-right"
            class="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 rtl:rotate-180"
          />
        </p>
      </div>
    </NuxtLink>
  </div>
</template>
