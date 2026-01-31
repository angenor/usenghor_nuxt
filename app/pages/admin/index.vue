<script setup lang="ts">
import type { ApplicationRead, ApplicationStatistics, EventStatistics, ExtendedApplicationStatistics } from '~/types/api'
import type { AuditLogWithUser } from '~/types/api'
import type { EventRead } from '~/types/api'
import type { NewsDisplay, NewsStats } from '~/types/news'

definePageMeta({
  layout: 'admin'
})

// APIs
const { listApplications, getStatistics, getExtendedStatistics, applicationStatusLabels } = useApplicationsApi()
const { listEvents, getEventsStats, eventTypeLabels } = useEventsApi()
const { listNews, getNewsStats } = useAdminNewsApi()
const { listAuditLogs, enrichLog, auditActionLabels, getTableLabel: getAuditTableLabel } = useAuditApi()

// === CHART DATA ===
// Données pour les graphiques (seront remplacées par des données API réelles)
const applicationTrendData = ref<{ date: string; value: number }[]>([])
const applicationStatusData = ref<{ category: string; value: number; color: string }[]>([])
const eventTypeData = ref<{ category: string; value: number }[]>([])
const newsPublicationData = ref<{ date: string; value: number }[]>([])

// === STATE ===
const isLoading = ref(true)
const error = ref<string | null>(null)

// Stats data
const applicationStats = ref<ApplicationStatistics>({
  total: 0,
  submitted: 0,
  under_review: 0,
  accepted: 0,
  rejected: 0,
  waitlisted: 0,
  incomplete: 0,
})
const extendedAppStats = ref<ExtendedApplicationStatistics | null>(null)
const eventStats = ref<EventStatistics | null>(null)
const newsStats = ref<NewsStats>({
  total: 0,
  published: 0,
  draft: 0,
  archived: 0,
  headline: 0,
  featured: 0,
})
const upcomingEventsCount = ref(0)

// Lists data
const recentApplications = ref<ApplicationRead[]>([])
const upcomingEventsList = ref<EventRead[]>([])
const recentNewsList = ref<NewsDisplay[]>([])
const recentActivity = ref<AuditLogWithUser[]>([])

// === COMPUTED STATS ===
const stats = computed(() => [
  {
    id: 'applications',
    label: 'Candidatures soumises',
    value: applicationStats.value.submitted + applicationStats.value.under_review,
    change: 'À traiter',
    changeType: 'neutral',
    icon: 'fa-solid fa-file-alt',
    color: 'blue'
  },
  {
    id: 'events',
    label: 'Événements à venir',
    value: upcomingEventsCount.value,
    change: 'Prochains',
    changeType: 'neutral',
    icon: 'fa-solid fa-calendar-days',
    color: 'purple'
  },
  {
    id: 'news',
    label: 'Actualités publiées',
    value: newsStats.value.published,
    change: 'En ligne',
    changeType: 'positive',
    icon: 'fa-solid fa-newspaper',
    color: 'green'
  },
  {
    id: 'total',
    label: 'Total candidatures',
    value: applicationStats.value.total,
    change: 'Global',
    changeType: 'neutral',
    icon: 'fa-solid fa-users',
    color: 'orange'
  }
])

// === CHART DATA AVAILABILITY ===
const hasApplicationTrendData = computed(() =>
  applicationTrendData.value.some(d => d.value > 0)
)
const hasApplicationStatusData = computed(() =>
  applicationStatusData.value.length > 0
)
const hasEventTypeData = computed(() =>
  eventTypeData.value.some(d => d.value > 0)
)
const hasNewsPublicationData = computed(() =>
  newsPublicationData.value.some(d => d.value > 0)
)
const hasAnyChartData = computed(() =>
  hasApplicationTrendData.value ||
  hasApplicationStatusData.value ||
  hasEventTypeData.value ||
  hasNewsPublicationData.value
)

// === FETCH DATA ===
async function fetchDashboardData() {
  isLoading.value = true
  error.value = null

  try {
    // Fetch all data in parallel
    const [
      appStatsResult,
      extendedAppStatsResult,
      eventStatsResult,
      newsStatsResult,
      applicationsResult,
      upcomingEventsResult,
      newsResult,
      auditResult,
    ] = await Promise.all([
      getStatistics().catch(() => applicationStats.value),
      getExtendedStatistics({ granularity: 'month' }).catch(() => null),
      getEventsStats(12).catch(() => null),
      getNewsStats(6).catch(() => newsStats.value),
      listApplications({ limit: 5, sort_by: 'submitted_at', sort_order: 'desc' }).catch(() => ({ items: [], total: 0 })),
      listEvents({ limit: 5, from_date: new Date().toISOString(), sort_by: 'start_date', sort_order: 'asc' }).catch(() => ({ items: [], total: 0 })),
      listNews({ limit: 5, sort_by: 'updated_at', sort_order: 'desc' }).catch(() => ({ items: [], total: 0 })),
      listAuditLogs({ limit: 10 }).catch(() => ({ items: [], total: 0 })),
    ])

    // Update stats
    applicationStats.value = appStatsResult
    extendedAppStats.value = extendedAppStatsResult
    eventStats.value = eventStatsResult
    newsStats.value = newsStatsResult
    upcomingEventsCount.value = eventStatsResult?.upcoming ?? upcomingEventsResult.total

    // Update lists
    recentApplications.value = applicationsResult.items
    upcomingEventsList.value = upcomingEventsResult.items
    recentNewsList.value = newsResult.items
    recentActivity.value = auditResult.items.map(enrichLog)

    // Generate chart data from real stats
    generateChartData()
  } catch (e) {
    console.error('Error fetching dashboard data:', e)
    error.value = 'Erreur lors du chargement des données du tableau de bord'
  } finally {
    isLoading.value = false
  }
}

// Generate chart data from real statistics
function generateChartData() {
  // Application status distribution - use real data
  const realStatusData = [
    { category: 'Soumises', value: applicationStats.value.submitted, color: '#3B82F6' },
    { category: 'En révision', value: applicationStats.value.under_review, color: '#F59E0B' },
    { category: 'Acceptées', value: applicationStats.value.accepted, color: '#10B981' },
    { category: 'Refusées', value: applicationStats.value.rejected, color: '#EF4444' },
    { category: 'Liste d\'attente', value: applicationStats.value.waitlisted, color: '#F97316' },
    { category: 'Incomplètes', value: applicationStats.value.incomplete, color: '#6B7280' }
  ].filter(d => d.value > 0)

  applicationStatusData.value = realStatusData

  // Application trend data from extended statistics
  if (extendedAppStats.value?.timeline && extendedAppStats.value.timeline.length > 0) {
    applicationTrendData.value = extendedAppStats.value.timeline.map(point => ({
      date: `${point.period}-01`,
      value: point.count
    }))
  } else {
    applicationTrendData.value = []
  }

  // Event type distribution from real statistics
  if (eventStats.value?.by_type) {
    eventTypeData.value = Object.entries(eventStats.value.by_type)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        category: eventTypeLabels[type as keyof typeof eventTypeLabels] || type,
        value: count
      }))
  } else {
    eventTypeData.value = []
  }

  // News publication trend from real statistics
  if (newsStats.value.timeline && newsStats.value.timeline.length > 0) {
    newsPublicationData.value = newsStats.value.timeline.map(point => ({
      date: `${point.period}-01`,
      value: point.count
    }))
  } else {
    newsPublicationData.value = []
  }
}

// Load data on mount
onMounted(() => {
  fetchDashboardData()
})

// === HELPERS ===
const getApplicationStatusClasses = (status: string) => {
  const colors: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    under_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    waitlisted: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    incomplete: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  }
  return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
}

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
    </div>

    <!-- Error message -->
    <div v-if="error" class="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
      <div class="flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="h-4 w-4" />
        {{ error }}
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

    <!-- Charts section - affiché uniquement si au moins un graphique a des données -->
    <div v-if="hasAnyChartData" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Application trend chart -->
      <div
        v-if="hasApplicationTrendData"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tendance des candidatures
        </h3>
        <ChartsAmAreaChart
          :data="applicationTrendData"
          height="250px"
          color="#3B82F6"
          :gradient-fill="true"
        />
      </div>

      <!-- Application status donut -->
      <div
        v-if="hasApplicationStatusData"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Répartition par statut
        </h3>
        <ChartsAmDonutChart
          :data="applicationStatusData"
          height="250px"
          :inner-radius="50"
          :center-value="applicationStats.total"
          center-label="Total"
          :show-legend="true"
        />
      </div>

      <!-- Event types chart -->
      <div
        v-if="hasEventTypeData"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Événements par type
        </h3>
        <ChartsAmBarChart
          :data="eventTypeData"
          height="250px"
        />
      </div>

      <!-- News publication trend -->
      <div
        v-if="hasNewsPublicationData"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Publications par mois
        </h3>
        <ChartsAmLineChart
          :data="newsPublicationData"
          height="250px"
        />
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
        <div v-if="isLoading" class="p-6 text-center text-gray-500 dark:text-gray-400">
          <font-awesome-icon icon="fa-solid fa-spinner" class="w-5 h-5 animate-spin" />
        </div>
        <div v-else-if="recentApplications.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
          Aucune candidature récente
        </div>
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="app in recentApplications"
            :key="app.id"
            class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-gray-500 dark:text-gray-400">
                    {{ app.reference_number }}
                  </span>
                  <span
                    :class="[
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      getApplicationStatusClasses(app.status)
                    ]"
                  >
                    {{ applicationStatusLabels[app.status] }}
                  </span>
                </div>
                <p class="text-sm font-medium text-gray-900 dark:text-white mt-1 truncate">
                  {{ app.last_name }} {{ app.first_name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ app.email }}
                </p>
              </div>
              <div class="text-right ml-4">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(app.submitted_at) }}
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
        <div v-if="isLoading" class="p-6 text-center text-gray-500 dark:text-gray-400">
          <font-awesome-icon icon="fa-solid fa-spinner" class="w-5 h-5 animate-spin" />
        </div>
        <div v-else-if="upcomingEventsList.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
          Aucun événement à venir
        </div>
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
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
                    {{ formatDate(event.start_date) }}
                  </span>
                  <span v-if="event.venue || event.city" class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                    <font-awesome-icon icon="fa-solid fa-location-dot" class="w-3 h-3" />
                    {{ event.venue || event.city }}
                  </span>
                  <span v-else-if="event.is_online" class="text-xs text-indigo-500 flex items-center gap-1">
                    <font-awesome-icon icon="fa-solid fa-video" class="w-3 h-3" />
                    En ligne
                  </span>
                </div>
              </div>
              <div v-if="event.registration_required && event.max_attendees" class="flex items-center gap-1 ml-4">
                <font-awesome-icon icon="fa-solid fa-users" class="w-3 h-3 text-gray-400" />
                <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {{ event.max_attendees }}
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
        <div v-if="isLoading" class="p-6 text-center text-gray-500 dark:text-gray-400">
          <font-awesome-icon icon="fa-solid fa-spinner" class="w-5 h-5 animate-spin" />
        </div>
        <div v-else-if="recentNewsList.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
          Aucune actualité récente
        </div>
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
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
                  <span v-if="news.author" class="text-xs text-gray-500 dark:text-gray-400">
                    Par {{ news.author.name }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDate(news.published_at || news.updated_at) }}
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
        <div v-if="isLoading" class="p-6 text-center text-gray-500 dark:text-gray-400">
          <font-awesome-icon icon="fa-solid fa-spinner" class="w-5 h-5 animate-spin" />
        </div>
        <div v-else-if="recentActivity.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
          Aucune activité récente
        </div>
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="px-6 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div class="w-8 h-8 rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/30 flex items-center justify-center flex-shrink-0">
              <font-awesome-icon
                :icon="getActionIcon(activity.action)"
                class="w-3 h-3 text-brand-blue-600 dark:text-brand-blue-400"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900 dark:text-white">
                <span class="font-medium">{{ activity.user?.name || 'Système' }}</span>
                {{ getActionLabel(activity.action) }} {{ getAuditTableLabel(activity.table_name) }}
              </p>
              <p v-if="activity.summary" class="text-xs text-brand-blue-600 dark:text-brand-blue-400 truncate">
                {{ activity.summary }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ formatRelativeTime(activity.created_at) }}
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
          to="/admin/mediatheque"
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
