<script setup lang="ts">
import type { EditorialHistoryRead } from '~/types/api'

defineProps<{
  show: boolean
  itemName: string
  items: EditorialHistoryRead[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function truncateText(text: string | null, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="emit('close')"
    >
      <div class="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl dark:bg-gray-800">
        <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Historique des modifications
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ itemName }}
            </p>
          </div>
          <button
            class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            @click="emit('close')"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <font-awesome-icon :icon="['fas', 'spinner']" class="h-6 w-6 animate-spin text-gray-400" />
          </div>

          <div v-else-if="items.length === 0" class="py-8 text-center">
            <font-awesome-icon :icon="['fas', 'history']" class="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
            <p class="text-gray-500 dark:text-gray-400">
              Aucune modification enregistrée
            </p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(entry, index) in items"
              :key="entry.id"
              class="relative pb-4 pl-6"
              :class="{ 'border-l-2 border-gray-200 dark:border-gray-700': index < items.length - 1 }"
            >
              <div class="absolute left-0 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatDate(entry.modified_at) }}
                  </span>
                </div>
                <div class="text-sm">
                  <p v-if="entry.old_value" class="text-gray-500 dark:text-gray-400 line-clamp-2">
                    {{ truncateText(entry.old_value, 100) }}
                  </p>
                  <p v-else class="text-gray-400 dark:text-gray-500 italic">
                    (vide)
                  </p>
                  <font-awesome-icon :icon="['fas', 'arrow-down']" class="my-1 h-3 w-3 text-gray-400" />
                  <p v-if="entry.new_value" class="font-medium text-gray-900 dark:text-white line-clamp-2">
                    {{ truncateText(entry.new_value, 100) }}
                  </p>
                  <p v-else class="text-gray-400 dark:text-gray-500 italic">
                    (vide)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <button
            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            @click="emit('close')"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
