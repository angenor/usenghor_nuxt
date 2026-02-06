<script setup lang="ts">
import type { UserWithRoles } from '~/composables/useUsersApi'

const props = defineProps<{
  show: boolean
  user: UserWithRoles | null
  getFullName: (user: UserWithRoles) => string
  formatLastLogin: (date: string | null) => string
  getRoleColor: (code: string) => string
  userStatusColors: Record<string, string>
  verificationColors: Record<string, string>
}>()

const emit = defineEmits<{
  'close': []
  'edit': [user: UserWithRoles]
}>()

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show && user"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="relative h-12 w-12">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              >
                <font-awesome-icon :icon="['fas', 'user']" class="h-6 w-6" />
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ getFullName(user) }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ user.email }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            @click="emit('close')"
          >
            <font-awesome-icon :icon="['fas', 'xmark']" class="h-5 w-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="max-h-[60vh] overflow-y-auto p-4">
          <!-- Status badges -->
          <div class="mb-6 flex flex-wrap gap-2">
            <span
              class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
              :class="user.active ? userStatusColors.active : userStatusColors.inactive"
            >
              {{ user.active ? 'Actif' : 'Inactif' }}
            </span>
            <span
              class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
              :class="user.email_verified ? verificationColors.verified : verificationColors.not_verified"
            >
              <font-awesome-icon
                :icon="['fas', user.email_verified ? 'check-circle' : 'exclamation-circle']"
                class="mr-1.5 h-4 w-4"
              />
              {{ user.email_verified ? 'Email vérifié' : 'Email non vérifié' }}
            </span>
          </div>

          <!-- Roles -->
          <div class="mb-6">
            <h4 class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Rôles
            </h4>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="role in user.roles"
                :key="role.id"
                class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                :class="getRoleColor(role.code)"
              >
                {{ role.name_fr }}
              </span>
              <span
                v-if="user.roles.length === 0"
                class="text-sm text-gray-400 dark:text-gray-500"
              >
                Aucun rôle assigné
              </span>
            </div>
          </div>

          <!-- Info Grid -->
          <div class="mb-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Téléphone
              </p>
              <p class="text-gray-900 dark:text-white">
                {{ user.phone || '-' }}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                WhatsApp
              </p>
              <p class="text-gray-900 dark:text-white">
                {{ user.phone_whatsapp || '-' }}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ville
              </p>
              <p class="text-gray-900 dark:text-white">
                {{ user.city || '-' }}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Date de naissance
              </p>
              <p class="text-gray-900 dark:text-white">
                {{ formatDate(user.birth_date) }}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                LinkedIn
              </p>
              <p class="text-gray-900 dark:text-white">
                <a
                  v-if="user.linkedin"
                  :href="user.linkedin"
                  target="_blank"
                  class="text-primary-600 hover:underline dark:text-primary-400"
                >
                  Profil LinkedIn
                </a>
                <span v-else>-</span>
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Dernière connexion
              </p>
              <p class="text-gray-900 dark:text-white">
                {{ formatLastLogin(user.last_login_at) }}
              </p>
            </div>
          </div>

          <!-- Address -->
          <div v-if="user.address" class="mb-6">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Adresse
            </p>
            <p class="text-gray-900 dark:text-white">
              {{ user.address }}
            </p>
          </div>

          <!-- Dates -->
          <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Créé le
                </p>
                <p class="text-gray-900 dark:text-white">
                  {{ formatDateTime(user.created_at) }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Modifié le
                </p>
                <p class="text-gray-900 dark:text-white">
                  {{ formatDateTime(user.updated_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="emit('close')"
          >
            Fermer
          </button>
          <button
            type="button"
            class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            @click="emit('close'); emit('edit', user)"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
