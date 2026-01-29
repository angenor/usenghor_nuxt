<script setup lang="ts">
import type { CoreValue } from '~/types/api'

defineProps<{
  values: CoreValue[]
}>()

const emit = defineEmits<{
  add: []
  edit: [value: CoreValue]
  delete: [value: CoreValue]
  move: [index: number, direction: 'up' | 'down']
  history: [value: CoreValue]
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
  <div class="space-y-6">
    <!-- Add button -->
    <div class="flex justify-end">
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        @click="emit('add')"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter une valeur
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="values.length === 0" class="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
      <font-awesome-icon :icon="['fas', 'star']" class="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
      <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
        Aucune valeur fondamentale
      </h3>
      <p class="mb-6 text-gray-500 dark:text-gray-400">
        Commencez par ajouter vos valeurs fondamentales.
      </p>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        @click="emit('add')"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter une valeur
      </button>
    </div>

    <!-- Values list -->
    <div v-else class="space-y-3">
      <div
        v-for="(value, index) in values"
        :key="value.id"
        class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        :class="{ 'opacity-60': !value.is_active }"
      >
        <div class="flex items-start gap-4">
          <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <font-awesome-icon :icon="['fas', value.icon]" class="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ value.title }}
              </h3>
              <span
                v-if="!value.is_active"
                class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              >
                Inactif
              </span>
            </div>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {{ value.description }}
            </p>
            <p class="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Modifié le {{ formatDateShort(value.updated_at) }}
            </p>
          </div>

          <div class="flex items-center gap-1">
            <button
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Monter"
              :disabled="index === 0"
              @click="emit('move', index, 'up')"
            >
              <font-awesome-icon :icon="['fas', 'chevron-up']" class="h-4 w-4" />
            </button>
            <button
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Descendre"
              :disabled="index === values.length - 1"
              @click="emit('move', index, 'down')"
            >
              <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-4 w-4" />
            </button>
            <button
              class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Historique"
              @click="emit('history', value)"
            >
              <font-awesome-icon :icon="['fas', 'history']" class="h-4 w-4" />
            </button>
            <button
              class="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              title="Modifier"
              @click="emit('edit', value)"
            >
              <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
            </button>
            <button
              class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Supprimer"
              @click="emit('delete', value)"
            >
              <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
