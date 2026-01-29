<script setup lang="ts">
import type { CoreValue } from '~/types/api'

defineProps<{
  show: boolean
  value: CoreValue | null
  isSaving: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show && value"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-800">
        <div class="p-6 text-center">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Supprimer cette valeur ?
          </h3>
          <p class="mb-6 text-gray-500 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer la valeur
            <span class="font-medium text-gray-700 dark:text-gray-300">« {{ value.title }} »</span> ?
            Cette action est irréversible.
          </p>
          <div class="flex justify-center gap-3">
            <button
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              @click="emit('close')"
            >
              Annuler
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              :disabled="isSaving"
              @click="emit('confirm')"
            >
              <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
