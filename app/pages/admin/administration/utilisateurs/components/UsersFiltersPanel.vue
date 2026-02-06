<script setup lang="ts">
import type { UserFilters } from '../composables/useUsersManagement'

interface RoleOption {
  id: string
  code: string
  name_fr: string
}

const props = defineProps<{
  filters: UserFilters
  roleOptions: RoleOption[]
  hasActiveFilters: boolean
}>()

const emit = defineEmits<{
  'update:filters': [filters: UserFilters]
  'clear': []
}>()

const localFilters = computed({
  get: () => props.filters,
  set: (value) => emit('update:filters', value),
})
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Filtres
      </h3>
      <button
        v-if="hasActiveFilters"
        type="button"
        class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
        @click="emit('clear')"
      >
        Réinitialiser
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Search -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Recherche</label>
        <input
          v-model="localFilters.search"
          type="text"
          placeholder="Nom, prénom, email..."
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <!-- Role -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
        <select
          v-model="localFilters.role_id"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">
            Tous les rôles
          </option>
          <option v-for="role in roleOptions" :key="role.id" :value="role.id">
            {{ role.name_fr }}
          </option>
        </select>
      </div>

      <!-- Status -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
        <select
          v-model="localFilters.active"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option :value="undefined">
            Tous
          </option>
          <option :value="true">
            Actifs
          </option>
          <option :value="false">
            Inactifs
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
