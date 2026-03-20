<script setup lang="ts">
const props = defineProps<{
  stats: {
    total_responses: number
    first_response_at: string | null
    last_response_at: string | null
    questions: Array<{
      name: string
      type: string
      title: string
      stats: {
        average?: number
        distribution: Record<string, number>
      }
    }>
  }
}>()

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getMaxCount(distribution: Record<string, number>): number {
  const values = Object.values(distribution)
  return Math.max(...values, 1)
}

function getPercentage(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0
}
</script>

<template>
  <div class="space-y-6">
    <!-- Résumé -->
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-sm text-gray-500 dark:text-gray-400">Total réponses</p>
        <p class="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{{ stats.total_responses }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-sm text-gray-500 dark:text-gray-400">Première réponse</p>
        <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">{{ formatDate(stats.first_response_at) }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-sm text-gray-500 dark:text-gray-400">Dernière réponse</p>
        <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">{{ formatDate(stats.last_response_at) }}</p>
      </div>
    </div>

    <!-- Stats par question -->
    <div
      v-for="question in stats.questions"
      :key="question.name"
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <h3 class="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{{ question.title }}</h3>
      <p class="mb-4 text-xs text-gray-500">{{ question.type }} | {{ question.name }}</p>

      <!-- Moyenne pour les ratings -->
      <div v-if="question.stats.average !== undefined" class="mb-4">
        <span class="text-2xl font-bold text-brand-blue-600 dark:text-brand-blue-400">
          {{ question.stats.average }}
        </span>
        <span class="text-sm text-gray-500"> / 5 en moyenne</span>
      </div>

      <!-- Barres de distribution -->
      <div class="space-y-2">
        <div
          v-for="(count, label) in question.stats.distribution"
          :key="label"
          class="flex items-center gap-3"
        >
          <span class="w-32 flex-shrink-0 truncate text-sm text-gray-700 dark:text-gray-300" :title="String(label)">
            {{ label }}
          </span>
          <div class="relative h-6 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              class="absolute inset-y-0 left-0 rounded-full bg-brand-blue-500 transition-all dark:bg-brand-blue-400"
              :style="{ width: `${getPercentage(count, stats.total_responses)}%` }"
            />
          </div>
          <span class="w-16 flex-shrink-0 text-right text-sm text-gray-600 dark:text-gray-400">
            {{ count }} ({{ getPercentage(count, stats.total_responses) }}%)
          </span>
        </div>
      </div>
    </div>

    <!-- Message si pas de stats -->
    <div v-if="stats.questions.length === 0 && stats.total_responses > 0" class="py-8 text-center text-sm text-gray-500">
      Aucune question à choix ou notation détectée pour les statistiques visuelles.
    </div>
    <div v-if="stats.total_responses === 0" class="py-8 text-center text-sm text-gray-500">
      Aucune réponse pour le moment.
    </div>
  </div>
</template>
