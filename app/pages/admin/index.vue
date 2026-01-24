<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const { locale } = useI18n()

// Données depuis useMockData
const {
  getAllOpenCalls,
  getAllClosedCalls,
  getUpcomingEvents,
  getAllNews,
  getRecentAuditLogs,
  getActiveUsersCount
} = useMockData()

// === STATS ===
// Candidatures en attente (appels ouverts)
const pendingApplications = computed(() => getAllOpenCalls().length)

// Événements à venir (30 prochains jours)
const upcomingEventsCount = computed(() => {
  const now = new Date()
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  return getUpcomingEvents().filter(e => new Date(e.date) <= thirtyDaysLater).length
})

// Actualités publiées ce mois
const newsThisMonth = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return getAllNews().filter(n => new Date(n.date) >= startOfMonth).length
})

// Utilisateurs actifs
const activeUsers = computed(() => getActiveUsersCount())

const stats = computed(() => [
  {
    id: 'applications',
    label: 'Candidatures en attente',
    value: pendingApplications.value,
    change: 'À traiter',
    changeType: 'neutral',
    icon: 'fa-solid fa-file-alt',
    color: 'blue'
  },
  {
    id: 'events',
    label: 'Événements (30 jours)',
    value: upcomingEventsCount.value,
    change: 'À venir',
    changeType: 'neutral',
    icon: 'fa-solid fa-calendar-days',
    color: 'purple'
  },
  {
    id: 'news',
    label: 'Actualités ce mois',
    value: newsThisMonth.value,
    change: 'Publiées',
    changeType: 'positive',
    icon: 'fa-solid fa-newspaper',
    color: 'green'
  },
  {
    id: 'users',
    label: 'Utilisateurs actifs',
    value: activeUsers.value,
    change: 'En ligne',
    changeType: 'positive',
    icon: 'fa-solid fa-users',
    color: 'orange'
  }
])

// === CANDIDATURES RÉCENTES ===
const recentApplications = computed(() => {
  // Combine appels ouverts et fermés, triés par date
  const allCalls = [...getAllOpenCalls(), ...getAllClosedCalls()]
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())
    .slice(0, 5)

  return allCalls.map((call, index) => ({
    id: call.id,
    reference: `#2025-${String(1000 + index).padStart(4, '0')}`,
    candidat: ['Amadou Diallo', 'Fatou Sow', 'Ibrahim Touré', 'Marie Koné', 'Ousmane Ba'][index % 5],
    formation: call.title_fr,
    date: call.deadline,
    status: call.status
  }))
})

// === ÉVÉNEMENTS À VENIR ===
const upcomingEventsList = computed(() => {
  return getUpcomingEvents().slice(0, 5).map(event => ({
    id: event.id,
    title: locale.value === 'en' && event.title_en ? event.title_en : event.title_fr,
    date: event.date,
    location: locale.value === 'en' && event.location_en ? event.location_en : event.location_fr,
    registrations: Math.floor(Math.random() * 50) + 10 // Mock
  }))
})

// === ACTUALITÉS RÉCENTES ===
const recentNewsList = computed(() => {
  return getAllNews().slice(0, 5).map((news, index) => ({
    id: news.id,
    title: locale.value === 'en' && news.title_en ? news.title_en : news.title_fr,
    author: ['Marie Dupont', 'Jean Martin', 'Sophie Bernard', 'Pierre Durand', 'Aminata Koné'][index % 5],
    date: news.date,
    status: news.is_featured ? 'published' : (index % 3 === 0 ? 'draft' : 'published')
  }))
})

// === ACTIVITÉ RÉCENTE ===
const recentActivity = computed(() => {
  return getRecentAuditLogs(10).map(log => ({
    id: log.id,
    user: log.user_name,
    action: getActionLabel(log.action),
    target: log.record_label,
    table: getTableLabel(log.table_name),
    time: formatRelativeTime(log.created_at),
    icon: getActionIcon(log.action)
  }))
})

// === HELPERS ===
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

const getStatusClasses = (status: string) => {
  const statuses: Record<string, string> = {
    open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
  return statuses[status] || statuses.pending
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    open: 'Ouvert',
    closed: 'Fermé',
    pending: 'En attente',
    published: 'Publié',
    draft: 'Brouillon'
  }
  return labels[status] || status
}

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    create: 'a créé',
    update: 'a modifié',
    delete: 'a supprimé'
  }
  return labels[action] || action
}

const getTableLabel = (table: string) => {
  const labels: Record<string, string> = {
    news: 'actualité',
    events: 'événement',
    applications: 'candidature',
    users: 'utilisateur',
    formations: 'formation',
    partners: 'partenaire',
    calls: 'appel',
    media: 'média'
  }
  return labels[table] || table
}

const getActionIcon = (action: string) => {
  const icons: Record<string, string> = {
    create: 'fa-solid fa-plus',
    update: 'fa-solid fa-pen',
    delete: 'fa-solid fa-trash'
  }
  return icons[action] || 'fa-solid fa-circle'
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
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

    <!-- Content grid: Candidatures + Événements -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Candidatures récentes -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Candidatures récentes
          </h2>
          <NuxtLink
            to="/admin/candidatures/dossiers"
            class="text-sm text-brand-blue-600 dark:text-brand-blue-400 hover:underline"
          >
            Voir tout
          </NuxtLink>
        </div>
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="app in recentApplications"
            :key="app.id"
            class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-gray-500 dark:text-gray-400">
                    {{ app.reference }}
                  </span>
                  <span
                    :class="[
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      getStatusClasses(app.status)
                    ]"
                  >
                    {{ getStatusLabel(app.status) }}
                  </span>
                </div>
                <p class="text-sm font-medium text-gray-900 dark:text-white mt-1 truncate">
                  {{ app.candidat }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ app.formation }}
                </p>
              </div>
              <div class="text-right ml-4">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(app.date) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Événements à venir -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Événements à venir
          </h2>
          <NuxtLink
            to="/admin/contenus/evenements"
            class="text-sm text-brand-blue-600 dark:text-brand-blue-400 hover:underline"
          >
            Voir tout
          </NuxtLink>
        </div>
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="event in upcomingEventsList"
            :key="event.id"
            class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ event.title }}
                </p>
                <div class="flex items-center gap-3 mt-1">
                  <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                    {{ formatDate(event.date) }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                    <font-awesome-icon icon="fa-solid fa-location-dot" class="w-3 h-3" />
                    {{ event.location }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-1 ml-4">
                <font-awesome-icon icon="fa-solid fa-users" class="w-3 h-3 text-gray-400" />
                <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {{ event.registrations }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content grid: Actualités + Activité -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Actualités récentes -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Actualités récentes
          </h2>
          <NuxtLink
            to="/admin/contenus/actualites"
            class="text-sm text-brand-blue-600 dark:text-brand-blue-400 hover:underline"
          >
            Voir tout
          </NuxtLink>
        </div>
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="news in recentNewsList"
            :key="news.id"
            class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ news.title }}
                </p>
                <div class="flex items-center gap-3 mt-1">
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    Par {{ news.author }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDate(news.date) }}
                  </span>
                </div>
              </div>
              <span
                :class="[
                  'text-xs font-medium px-2 py-0.5 rounded-full ml-4',
                  getStatusClasses(news.status)
                ]"
              >
                {{ getStatusLabel(news.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Activité récente -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Activité récente
          </h2>
          <NuxtLink
            to="/admin/administration/audit"
            class="text-sm text-brand-blue-600 dark:text-brand-blue-400 hover:underline"
          >
            Voir tout
          </NuxtLink>
        </div>
        <div class="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="px-6 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div class="w-8 h-8 rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/30 flex items-center justify-center flex-shrink-0">
              <font-awesome-icon
                :icon="activity.icon"
                class="w-3 h-3 text-brand-blue-600 dark:text-brand-blue-400"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900 dark:text-white">
                <span class="font-medium">{{ activity.user }}</span>
                {{ activity.action }} une {{ activity.table }}
              </p>
              <p class="text-xs text-brand-blue-600 dark:text-brand-blue-400 truncate">
                {{ activity.target }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ activity.time }}
              </p>
            </div>
          </div>
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
