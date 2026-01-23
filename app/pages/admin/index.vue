<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

// Données de démonstration pour le dashboard
const stats = ref([
  {
    id: 'applications',
    label: 'Candidatures',
    value: 1248,
    change: '+12%',
    changeType: 'positive',
    icon: 'fa-solid fa-file-alt',
    color: 'blue'
  },
  {
    id: 'programs',
    label: 'Programmes actifs',
    value: 24,
    change: '+2',
    changeType: 'positive',
    icon: 'fa-solid fa-graduation-cap',
    color: 'green'
  },
  {
    id: 'events',
    label: 'Événements à venir',
    value: 8,
    change: '3 cette semaine',
    changeType: 'neutral',
    icon: 'fa-solid fa-calendar-days',
    color: 'purple'
  },
  {
    id: 'subscribers',
    label: 'Abonnés newsletter',
    value: 4521,
    change: '+156',
    changeType: 'positive',
    icon: 'fa-solid fa-envelope',
    color: 'orange'
  }
])

const recentActivities = ref([
  {
    id: 1,
    user: 'Marie Dupont',
    action: 'a créé une nouvelle actualité',
    target: 'Conférence internationale 2025',
    time: 'Il y a 5 minutes',
    icon: 'fa-solid fa-newspaper'
  },
  {
    id: 2,
    user: 'Jean Martin',
    action: 'a modifié le programme',
    target: 'Master Administration des Entreprises',
    time: 'Il y a 15 minutes',
    icon: 'fa-solid fa-pen'
  },
  {
    id: 3,
    user: 'Sophie Bernard',
    action: 'a validé une candidature',
    target: 'Dossier #2024-1234',
    time: 'Il y a 1 heure',
    icon: 'fa-solid fa-check'
  },
  {
    id: 4,
    user: 'Pierre Durand',
    action: 'a ajouté un nouveau partenaire',
    target: 'Université de Dakar',
    time: 'Il y a 2 heures',
    icon: 'fa-solid fa-handshake'
  }
])

const pendingTasks = ref([
  {
    id: 1,
    title: 'Candidatures en attente de validation',
    count: 23,
    priority: 'high',
    route: '/admin/candidatures/dossiers'
  },
  {
    id: 2,
    title: 'Actualités à publier',
    count: 5,
    priority: 'medium',
    route: '/admin/contenus/actualites'
  },
  {
    id: 3,
    title: 'Événements sans inscription',
    count: 2,
    priority: 'low',
    route: '/admin/contenus/evenements'
  }
])

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string; icon: string }> = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'bg-blue-100 dark:bg-blue-900/40'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      icon: 'bg-green-100 dark:bg-green-900/40'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      icon: 'bg-purple-100 dark:bg-purple-900/40'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-600 dark:text-orange-400',
      icon: 'bg-orange-100 dark:bg-orange-900/40'
    }
  }
  return colors[color] || colors.blue
}

const getPriorityClasses = (priority: string) => {
  const priorities: Record<string, string> = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
  return priorities[priority] || priorities.low
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Tableau de bord
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Vue d'ensemble de l'activité de la plateforme
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800
                 border border-gray-300 dark:border-gray-600 rounded-lg
                 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <font-awesome-icon icon="fa-solid fa-download" class="w-4 h-4" />
          Exporter
        </button>
        <button
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                 text-white bg-brand-blue-600 rounded-lg hover:bg-brand-blue-700
                 transition-colors"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="w-4 h-4" />
          Nouvelle entrée
        </button>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.id"
        class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div
            :class="[
              'w-12 h-12 rounded-lg flex items-center justify-center',
              getColorClasses(stat.color).icon
            ]"
          >
            <font-awesome-icon
              :icon="stat.icon"
              :class="['w-6 h-6', getColorClasses(stat.color).text]"
            />
          </div>
          <span
            :class="[
              'text-xs font-medium px-2 py-1 rounded-full',
              stat.changeType === 'positive'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : stat.changeType === 'negative'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            ]"
          >
            {{ stat.change }}
          </span>
        </div>
        <div class="mt-4">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ stat.value.toLocaleString() }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ stat.label }}
          </p>
        </div>
      </div>
    </div>

    <!-- Content grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent activity -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Activité récente
          </h2>
        </div>
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div class="w-10 h-10 rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/30 flex items-center justify-center flex-shrink-0">
              <font-awesome-icon
                :icon="activity.icon"
                class="w-4 h-4 text-brand-blue-600 dark:text-brand-blue-400"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900 dark:text-white">
                <span class="font-medium">{{ activity.user }}</span>
                {{ activity.action }}
              </p>
              <p class="text-sm text-brand-blue-600 dark:text-brand-blue-400 truncate">
                {{ activity.target }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ activity.time }}
              </p>
            </div>
          </div>
        </div>
        <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <NuxtLink
            to="/admin/administration/audit"
            class="text-sm text-brand-blue-600 dark:text-brand-blue-400 hover:underline"
          >
            Voir tout l'historique
          </NuxtLink>
        </div>
      </div>

      <!-- Pending tasks -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Tâches en attente
          </h2>
        </div>
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <NuxtLink
            v-for="task in pendingTasks"
            :key="task.id"
            :to="task.route"
            class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ task.title }}
              </p>
            </div>
            <div class="flex items-center gap-3 ml-4">
              <span
                :class="[
                  'text-xs font-medium px-2.5 py-1 rounded-full',
                  getPriorityClasses(task.priority)
                ]"
              >
                {{ task.count }}
              </span>
              <font-awesome-icon
                icon="fa-solid fa-chevron-right"
                class="w-3 h-3 text-gray-400"
              />
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Actions rapides
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <NuxtLink
          to="/admin/contenus/actualites"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700
                 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 hover:bg-brand-blue-50
                 dark:hover:bg-brand-blue-900/20 transition-colors group"
        >
          <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center
                      group-hover:bg-brand-blue-100 dark:group-hover:bg-brand-blue-900/40 transition-colors">
            <font-awesome-icon
              icon="fa-solid fa-newspaper"
              class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-brand-blue-600
                     dark:group-hover:text-brand-blue-400 transition-colors"
            />
          </div>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
            Actualité
          </span>
        </NuxtLink>

        <NuxtLink
          to="/admin/contenus/evenements"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700
                 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 hover:bg-brand-blue-50
                 dark:hover:bg-brand-blue-900/20 transition-colors group"
        >
          <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center
                      group-hover:bg-brand-blue-100 dark:group-hover:bg-brand-blue-900/40 transition-colors">
            <font-awesome-icon
              icon="fa-solid fa-calendar-plus"
              class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-brand-blue-600
                     dark:group-hover:text-brand-blue-400 transition-colors"
            />
          </div>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
            Événement
          </span>
        </NuxtLink>

        <NuxtLink
          to="/admin/formations/programmes"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700
                 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 hover:bg-brand-blue-50
                 dark:hover:bg-brand-blue-900/20 transition-colors group"
        >
          <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center
                      group-hover:bg-brand-blue-100 dark:group-hover:bg-brand-blue-900/40 transition-colors">
            <font-awesome-icon
              icon="fa-solid fa-graduation-cap"
              class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-brand-blue-600
                     dark:group-hover:text-brand-blue-400 transition-colors"
            />
          </div>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
            Programme
          </span>
        </NuxtLink>

        <NuxtLink
          to="/admin/partenaires"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700
                 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 hover:bg-brand-blue-50
                 dark:hover:bg-brand-blue-900/20 transition-colors group"
        >
          <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center
                      group-hover:bg-brand-blue-100 dark:group-hover:bg-brand-blue-900/40 transition-colors">
            <font-awesome-icon
              icon="fa-solid fa-handshake"
              class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-brand-blue-600
                     dark:group-hover:text-brand-blue-400 transition-colors"
            />
          </div>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
            Partenaire
          </span>
        </NuxtLink>

        <NuxtLink
          to="/admin/mediatheque/fichiers"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700
                 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 hover:bg-brand-blue-50
                 dark:hover:bg-brand-blue-900/20 transition-colors group"
        >
          <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center
                      group-hover:bg-brand-blue-100 dark:group-hover:bg-brand-blue-900/40 transition-colors">
            <font-awesome-icon
              icon="fa-solid fa-cloud-arrow-up"
              class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-brand-blue-600
                     dark:group-hover:text-brand-blue-400 transition-colors"
            />
          </div>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
            Média
          </span>
        </NuxtLink>

        <NuxtLink
          to="/admin/administration/utilisateurs"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700
                 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 hover:bg-brand-blue-50
                 dark:hover:bg-brand-blue-900/20 transition-colors group"
        >
          <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center
                      group-hover:bg-brand-blue-100 dark:group-hover:bg-brand-blue-900/40 transition-colors">
            <font-awesome-icon
              icon="fa-solid fa-user-plus"
              class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-brand-blue-600
                     dark:group-hover:text-brand-blue-400 transition-colors"
            />
          </div>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
            Utilisateur
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
