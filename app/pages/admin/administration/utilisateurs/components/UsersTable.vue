<script setup lang="ts">
import type { UserWithRoles } from '~/composables/useUsersApi'

defineProps<{
  users: UserWithRoles[]
  selectedUserIds: string[]
  allSelected: boolean
  someSelected: boolean
  currentPage: number
  totalPages: number
  getFullName: (user: UserWithRoles) => string
  formatLastLogin: (date: string | null) => string
  getRoleColor: (code: string) => string
  userStatusColors: Record<string, string>
  verificationColors: Record<string, string>
}>()

const emit = defineEmits<{
  'toggle-select-all': []
  'toggle-selection': [userId: string]
  'view-detail': [user: UserWithRoles]
  'edit': [user: UserWithRoles]
  'toggle-active': [user: UserWithRoles]
  'verify-email': [user: UserWithRoles]
  'reset-password': [user: UserWithRoles]
  'delete': [user: UserWithRoles]
  'go-to-page': [page: number]
}>()
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th class="w-12 px-4 py-3">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                @change="emit('toggle-select-all')"
              />
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Utilisateur
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Rôles
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Statut
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Dernière connexion
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="user in users"
            :key="user.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            :class="{ 'bg-primary-50 dark:bg-primary-900/10': selectedUserIds.includes(user.id) }"
          >
            <td class="px-4 py-3">
              <input
                type="checkbox"
                :checked="selectedUserIds.includes(user.id)"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                @change="emit('toggle-selection', user.id)"
              />
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="relative h-10 w-10 flex-shrink-0">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  >
                    <font-awesome-icon :icon="['fas', 'user']" class="h-5 w-5" />
                  </div>
                  <span
                    v-if="user.active && user.last_login_at && new Date(user.last_login_at) > new Date(Date.now() - 15 * 60 * 1000)"
                    class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-400 dark:border-gray-800"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ getFullName(user) }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ user.email }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="role in user.roles"
                  :key="role.id"
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="getRoleColor(role.code)"
                >
                  {{ role.name_fr }}
                </span>
                <span
                  v-if="user.roles.length === 0"
                  class="text-sm text-gray-400 dark:text-gray-500"
                >
                  Aucun rôle
                </span>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-col gap-1">
                <span
                  class="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="user.active ? userStatusColors.active : userStatusColors.inactive"
                >
                  {{ user.active ? 'Actif' : 'Inactif' }}
                </span>
                <span
                  class="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="user.email_verified ? verificationColors.verified : verificationColors.not_verified"
                >
                  <font-awesome-icon
                    :icon="['fas', user.email_verified ? 'check-circle' : 'exclamation-circle']"
                    class="mr-1 h-3 w-3"
                  />
                  {{ user.email_verified ? 'Vérifié' : 'Non vérifié' }}
                </span>
              </div>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {{ formatLastLogin(user.last_login_at) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <button
                  type="button"
                  class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  title="Voir le détail"
                  @click="emit('view-detail', user)"
                >
                  <font-awesome-icon :icon="['fas', 'eye']" class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  title="Modifier"
                  @click="emit('edit', user)"
                >
                  <font-awesome-icon :icon="['fas', 'pen']" class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  :title="user.active ? 'Désactiver' : 'Activer'"
                  @click="emit('toggle-active', user)"
                >
                  <font-awesome-icon :icon="['fas', user.active ? 'toggle-on' : 'toggle-off']" class="h-4 w-4" />
                </button>
                <button
                  v-if="!user.email_verified"
                  type="button"
                  class="rounded-lg p-2 text-blue-500 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/20"
                  title="Marquer email vérifié"
                  @click="emit('verify-email', user)"
                >
                  <font-awesome-icon :icon="['fas', 'envelope-circle-check']" class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="rounded-lg p-2 text-orange-500 hover:bg-orange-100 hover:text-orange-700 dark:hover:bg-orange-900/20"
                  title="Réinitialiser mot de passe"
                  @click="emit('reset-password', user)"
                >
                  <font-awesome-icon :icon="['fas', 'key']" class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="rounded-lg p-2 text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20"
                  title="Supprimer"
                  @click="emit('delete', user)"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <font-awesome-icon :icon="['fas', 'users']" class="mb-2 h-8 w-8" />
              <p>Aucun utilisateur trouvé</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700/50"
    >
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          Page {{ currentPage }} sur {{ totalPages }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
          :disabled="currentPage === 1"
          @click="emit('go-to-page', 1)"
        >
          <font-awesome-icon :icon="['fas', 'angles-left']" class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
          :disabled="currentPage === 1"
          @click="emit('go-to-page', currentPage - 1)"
        >
          <font-awesome-icon :icon="['fas', 'angle-left']" class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
          :disabled="currentPage === totalPages"
          @click="emit('go-to-page', currentPage + 1)"
        >
          <font-awesome-icon :icon="['fas', 'angle-right']" class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
          :disabled="currentPage === totalPages"
          @click="emit('go-to-page', totalPages)"
        >
          <font-awesome-icon :icon="['fas', 'angles-right']" class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
