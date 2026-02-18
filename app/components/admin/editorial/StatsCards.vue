<script setup lang="ts">
import type { EditorialValuesStats } from '~/types/api'

defineProps<{
  contentsCount: number
  stats: EditorialValuesStats
}>()

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
    <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <font-awesome-icon :icon="['fas', 'file-alt']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ contentsCount }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Contenus</p>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <font-awesome-icon :icon="['fas', 'star']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.core_values_count }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Valeurs</p>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
          <font-awesome-icon :icon="['fas', 'check-circle']" class="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.active_core_values }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Valeurs actives</p>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <font-awesome-icon :icon="['fas', 'quote-left']" class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.testimonials_count }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Témoignages</p>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <font-awesome-icon :icon="['fas', 'star']" class="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.featured_testimonials }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">En vedette</p>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
          <font-awesome-icon :icon="['fas', 'clock']" class="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ stats.last_updated ? formatDateShort(stats.last_updated) : '-' }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Dernière MAJ</p>
        </div>
      </div>
    </div>
  </div>
</template>
