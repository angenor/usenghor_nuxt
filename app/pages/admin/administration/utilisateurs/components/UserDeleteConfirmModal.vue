<script setup lang="ts">
import type { UserWithRoles } from '~/composables/useUsersApi'

defineProps<{
  show: boolean
  user: UserWithRoles | null
  isSaving: boolean
  getFullName: (user: UserWithRoles) => string
}>()

const emit = defineEmits<{
  'close': []
  'confirm': []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show && user"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div class="p-6">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Supprimer l'utilisateur
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer <strong class="text-gray-900 dark:text-white">{{ getFullName(user) }}</strong> ?
            Cette action est irréversible.
          </p>
        </div>
        <div class="flex justify-end gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="emit('close')"
          >
            Annuler
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            :disabled="isSaving"
            @click="emit('confirm')"
          >
            <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
