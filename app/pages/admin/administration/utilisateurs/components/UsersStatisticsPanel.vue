<script setup lang="ts">
interface StatItem {
  role_id: string
  role_name: string
  count: number
}

interface Statistics {
  total: number
  active: number
  inactive: number
  email_verified: number
  last_registrations: number
  last_logins: number
  by_role: StatItem[]
}

defineProps<{
  statistics: Statistics
}>()
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
    <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
      Statistiques
    </h3>

    <!-- Stats Cards -->
    <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ statistics.total }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Total
        </p>
      </div>
      <div class="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ statistics.active }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Actifs
        </p>
      </div>
      <div class="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p class="text-2xl font-bold text-red-600 dark:text-red-400">
          {{ statistics.inactive }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Inactifs
        </p>
      </div>
      <div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ statistics.email_verified }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Emails vérifiés
        </p>
      </div>
      <div class="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {{ statistics.last_registrations }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Inscrits (30j)
        </p>
      </div>
      <div class="rounded-lg bg-teal-50 p-4 dark:bg-teal-900/20">
        <p class="text-2xl font-bold text-teal-600 dark:text-teal-400">
          {{ statistics.last_logins }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Connectés (7j)
        </p>
      </div>
    </div>

    <!-- By Role -->
    <div>
      <h4 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
        Par rôle
      </h4>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="item in statistics.by_role"
          :key="item.role_id"
          class="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50"
        >
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.role_name }}</span>
          <span class="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-900 dark:bg-gray-600 dark:text-white">
            {{ item.count }}
          </span>
        </div>
        <p v-if="statistics.by_role.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
          Aucune donnée
        </p>
      </div>
    </div>
  </div>
</template>
