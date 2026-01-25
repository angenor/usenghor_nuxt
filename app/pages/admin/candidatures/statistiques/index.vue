<script setup lang="ts">
import type {
  ApplicationStatus,
  ExtendedApplicationStatistics,
  TimelineDataPoint,
  ProgramStatistics,
  CallStatistics,
  StatisticsFilters,
} from '~/types/api'

definePageMeta({
  layout: 'admin',
})

// API Composables
const { getExtendedStatistics, applicationStatusLabels } = useApplicationsApi()
const { listCalls } = useApplicationCallsApi()

// === ÉTATS ===
const loading = ref(true)
const error = ref<string | null>(null)
const stats = ref<ExtendedApplicationStatistics | null>(null)
const calls = ref<{ id: string; title: string }[]>([])

// === FILTRES ===
const dateFrom = ref('')
const dateTo = ref('')
const selectedCallId = ref<string>('')

// Presets de période
const periodPreset = ref<'month' | 'quarter' | 'year' | 'academic' | 'custom'>('year')

const setPeriodPreset = (preset: typeof periodPreset.value) => {
  periodPreset.value = preset
  const now = new Date()

  switch (preset) {
    case 'month':
      dateFrom.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      dateTo.value = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      break
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3)
      dateFrom.value = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0]
      dateTo.value = new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString().split('T')[0]
      break
    case 'year':
      dateFrom.value = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
      dateTo.value = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
      break
    case 'academic':
      // Année académique: septembre N-1 à août N
      const academicYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
      dateFrom.value = new Date(academicYear, 8, 1).toISOString().split('T')[0]
      dateTo.value = new Date(academicYear + 1, 7, 31).toISOString().split('T')[0]
      break
    case 'custom':
      // Ne rien faire, l'utilisateur choisit
      break
  }
}

// === CHARGEMENT DES DONNÉES ===
async function loadStatistics() {
  loading.value = true
  error.value = null

  try {
    const filters: StatisticsFilters = {
      call_id: selectedCallId.value || undefined,
      date_from: dateFrom.value || undefined,
      date_to: dateTo.value || undefined,
      granularity: 'month',
    }

    stats.value = await getExtendedStatistics(filters)
  }
  catch (e) {
    error.value = 'Erreur lors du chargement des statistiques'
    console.error(e)
  }
  finally {
    loading.value = false
  }
}

async function loadCalls() {
  try {
    const response = await listCalls({ limit: 100 })
    calls.value = response.items.map(c => ({ id: c.id, title: c.title }))
  }
  catch (e) {
    console.error('Erreur chargement appels:', e)
  }
}

// Refetch avec debounce quand les filtres changent
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch([dateFrom, dateTo, selectedCallId], () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadStatistics()
  }, 300)
})

// Initialisation
onMounted(async () => {
  setPeriodPreset('year')
  await Promise.all([loadCalls(), loadStatistics()])
})

// === DONNÉES COMPUTÉES ===
const globalStats = computed(() =>
  stats.value || {
    total: 0,
    pending: 0,
    acceptance_rate: 0,
    completion_rate: 0,
    by_status: {
      submitted: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
      waitlisted: 0,
      incomplete: 0,
    },
    timeline: [],
    by_program: [],
    by_call: [],
  },
)

const timelineData = computed<TimelineDataPoint[]>(() => stats.value?.timeline || [])
const programStats = computed<ProgramStatistics[]>(() => stats.value?.by_program || [])
const callStats = computed<CallStatistics[]>(() => stats.value?.by_call || [])

// === GRAPHIQUE DONUT (SVG) ===
const statusColors: Record<ApplicationStatus, string> = {
  submitted: '#3B82F6',
  under_review: '#F59E0B',
  accepted: '#10B981',
  rejected: '#EF4444',
  waitlisted: '#F97316',
  incomplete: '#6B7280'
}

const donutData = computed(() => {
  const total = globalStats.value.total
  if (total === 0) return []

  const statuses: ApplicationStatus[] = ['submitted', 'under_review', 'accepted', 'rejected', 'waitlisted', 'incomplete']
  let cumulativePercent = 0

  return statuses
    .filter(status => globalStats.value.by_status[status] > 0)
    .map(status => {
      const count = globalStats.value.by_status[status]
      const percent = (count / total) * 100
      const startPercent = cumulativePercent
      cumulativePercent += percent

      return {
        status,
        count,
        percent: Math.round(percent * 10) / 10,
        startPercent,
        endPercent: cumulativePercent,
        color: statusColors[status],
        label: applicationStatusLabels[status]
      }
    })
})

// Calcul du chemin SVG pour un arc
const getArcPath = (startPercent: number, endPercent: number, radius: number = 80, innerRadius: number = 50) => {
  const startAngle = (startPercent / 100) * 360 - 90
  const endAngle = (endPercent / 100) * 360 - 90

  const startRad = (startAngle * Math.PI) / 180
  const endRad = (endAngle * Math.PI) / 180

  const x1 = 100 + radius * Math.cos(startRad)
  const y1 = 100 + radius * Math.sin(startRad)
  const x2 = 100 + radius * Math.cos(endRad)
  const y2 = 100 + radius * Math.sin(endRad)

  const x3 = 100 + innerRadius * Math.cos(endRad)
  const y3 = 100 + innerRadius * Math.sin(endRad)
  const x4 = 100 + innerRadius * Math.cos(startRad)
  const y4 = 100 + innerRadius * Math.sin(startRad)

  const largeArc = endPercent - startPercent > 50 ? 1 : 0

  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`
}

// === GRAPHIQUE BARRES (Timeline) ===
const maxTimelineCount = computed(() => {
  if (timelineData.value.length === 0) return 1
  return Math.max(...timelineData.value.map(d => d.count))
})

const formatPeriod = (period: string) => {
  const [year, month] = period.split('-')
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  return months[parseInt(month) - 1] || period
}

// === EXPORT ===
const exportCSV = () => {
  // Préparer les données
  const rows: string[][] = []

  // En-tête
  rows.push(['Statistiques des candidatures'])
  rows.push(['Période', `${dateFrom.value || 'Début'} - ${dateTo.value || 'Fin'}`])
  rows.push([])

  // KPIs
  rows.push(['=== INDICATEURS CLÉS ==='])
  rows.push(['Total candidatures', globalStats.value.total.toString()])
  rows.push(['En attente', globalStats.value.pending.toString()])
  rows.push(['Taux d\'acceptation', `${globalStats.value.acceptance_rate}%`])
  rows.push(['Taux de complétion', `${globalStats.value.completion_rate}%`])
  rows.push([])

  // Par statut
  rows.push(['=== PAR STATUT ==='])
  rows.push(['Statut', 'Nombre'])
  Object.entries(globalStats.value.by_status).forEach(([status, count]) => {
    rows.push([applicationStatusLabels[status as ApplicationStatus], count.toString()])
  })
  rows.push([])

  // Par programme
  rows.push(['=== PAR PROGRAMME ==='])
  rows.push(['Programme', 'Total', 'Acceptées', 'Taux'])
  programStats.value.forEach((p) => {
    rows.push([p.program_title, p.total.toString(), p.accepted.toString(), `${p.acceptance_rate}%`])
  })
  rows.push([])

  // Par appel
  rows.push(['=== PAR APPEL ==='])
  rows.push(['Appel', 'Total', 'Soumises', 'En cours', 'Acceptées', 'Rejetées', 'Liste attente', 'Incomplètes'])
  callStats.value.forEach((c) => {
    rows.push([
      c.call_title,
      c.total.toString(),
      c.submitted.toString(),
      c.under_review.toString(),
      c.accepted.toString(),
      c.rejected.toString(),
      c.waitlisted.toString(),
      c.incomplete.toString(),
    ])
  })

  // Convertir en CSV
  const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')

  // Télécharger
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `statistiques-candidatures-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// Reset filtres
const resetFilters = () => {
  selectedCallId.value = ''
  setPeriodPreset('year')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Statistiques des candidatures
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Analyse et suivi des candidatures par période, programme et pays
        </p>
      </div>

      <button
        class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
        @click="exportCSV"
      >
        <font-awesome-icon icon="fa-solid fa-file-csv" class="h-4 w-4" />
        Exporter CSV
      </button>
    </div>

    <!-- Filtres -->
    <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div class="flex flex-wrap items-center gap-4">
        <!-- Présets de période -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Période :</span>
          <div class="flex rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              v-for="(label, key) in { month: 'Ce mois', quarter: 'Trimestre', year: 'Année', academic: 'Année acad.', custom: 'Personnalisé' }"
              :key="key"
              class="px-3 py-1.5 text-sm transition-colors first:rounded-l-lg last:rounded-r-lg"
              :class="periodPreset === key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
              @click="setPeriodPreset(key as typeof periodPreset)"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <!-- Dates personnalisées -->
        <div v-if="periodPreset === 'custom'" class="flex items-center gap-2">
          <input
            v-model="dateFrom"
            type="date"
            class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <span class="text-gray-500">-</span>
          <input
            v-model="dateTo"
            type="date"
            class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <!-- Filtre par appel -->
        <select
          v-model="selectedCallId"
          class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Tous les appels</option>
          <option v-for="call in calls" :key="call.id" :value="call.id">
            {{ call.title }}
          </option>
        </select>

        <!-- Reset -->
        <button
          v-if="selectedCallId"
          class="text-sm text-blue-600 hover:underline dark:text-blue-400"
          @click="resetFilters"
        >
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3">
        <svg class="h-6 w-6 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-gray-600 dark:text-gray-400">Chargement des statistiques...</span>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
      <div class="flex items-center gap-3">
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="h-5 w-5 text-red-500" />
        <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
        <button
          class="ml-auto text-sm text-red-600 hover:underline dark:text-red-400"
          @click="loadStatistics"
        >
          Réessayer
        </button>
      </div>
    </div>

    <!-- Contenu principal -->
    <template v-else>

    <!-- KPIs -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <font-awesome-icon icon="fa-solid fa-file-lines" class="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total candidatures</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ globalStats.total }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <font-awesome-icon icon="fa-solid fa-clock" class="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">En attente</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ globalStats.pending }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon icon="fa-solid fa-check-circle" class="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Taux d'acceptation</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ globalStats.acceptance_rate }}%</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
            <font-awesome-icon icon="fa-solid fa-clipboard-check" class="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Dossiers complets</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ globalStats.completion_rate }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Graphiques -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Donut Chart - Répartition par statut -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Répartition par statut
        </h2>

        <div class="flex items-center gap-8">
          <!-- SVG Donut -->
          <div class="relative">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <template v-if="donutData.length > 0">
                <path
                  v-for="(segment, index) in donutData"
                  :key="index"
                  :d="getArcPath(segment.startPercent, segment.endPercent)"
                  :fill="segment.color"
                  class="transition-opacity hover:opacity-80"
                />
              </template>
              <circle v-else cx="100" cy="100" r="65" fill="none" stroke="#E5E7EB" stroke-width="30" class="dark:stroke-gray-700" />

              <!-- Centre -->
              <text x="100" y="95" text-anchor="middle" class="fill-gray-900 text-2xl font-bold dark:fill-white">
                {{ globalStats.total }}
              </text>
              <text x="100" y="115" text-anchor="middle" class="fill-gray-500 text-sm dark:fill-gray-400">
                candidatures
              </text>
            </svg>
          </div>

          <!-- Légende -->
          <div class="flex-1 space-y-2">
            <div
              v-for="segment in donutData"
              :key="segment.status"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: segment.color }"></span>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ segment.label }}</span>
              </div>
              <div class="text-right">
                <span class="font-medium text-gray-900 dark:text-white">{{ segment.count }}</span>
                <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">({{ segment.percent }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bar Chart - Évolution temporelle -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Évolution des candidatures
        </h2>

        <div v-if="timelineData.length > 0" class="space-y-3">
          <div
            v-for="point in timelineData"
            :key="point.period"
            class="flex items-center gap-3"
          >
            <span class="w-12 text-right text-sm text-gray-500 dark:text-gray-400">
              {{ formatPeriod(point.period) }}
            </span>
            <div class="flex-1">
              <div class="h-6 rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  class="flex h-6 items-center justify-end rounded-full bg-blue-500 px-2 text-xs font-medium text-white transition-all"
                  :style="{ width: `${Math.max((point.count / maxTimelineCount) * 100, 10)}%` }"
                >
                  {{ point.count }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-center text-gray-500 dark:text-gray-400">
          Aucune donnée pour cette période
        </p>
      </div>
    </div>

    <!-- Tableaux -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Par programme -->
      <div class="rounded-lg bg-white shadow dark:bg-gray-800">
        <div class="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Par programme
          </h2>
        </div>
        <div class="admin-scrollbar max-h-80 overflow-y-auto" data-lenis-prevent>
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="sticky top-0 bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Programme</th>
                <th class="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Total</th>
                <th class="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Acceptées</th>
                <th class="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Taux</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="prog in programStats" :key="prog.program_id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ prog.program_title }}</td>
                <td class="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">{{ prog.total }}</td>
                <td class="px-4 py-3 text-right text-sm text-green-600 dark:text-green-400">{{ prog.accepted }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">{{ prog.acceptance_rate }}%</td>
              </tr>
              <tr v-if="programStats.length === 0">
                <td colspan="4" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucune donnée
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Par pays - Masqué temporairement (nécessite table countries) -->
      <!-- <div class="rounded-lg bg-white shadow dark:bg-gray-800">
        <div class="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Par pays (nationalité)
          </h2>
        </div>
        <p class="p-4 text-sm text-gray-500 dark:text-gray-400">
          Fonctionnalité à venir
        </p>
      </div> -->
    </div>

    <!-- Tableau par appel -->
    <div class="rounded-lg bg-white shadow dark:bg-gray-800">
      <div class="border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Détail par appel à candidatures
        </h2>
      </div>
      <div class="admin-scrollbar overflow-x-auto" data-lenis-prevent>
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Appel</th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Total</th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                <span class="inline-flex items-center gap-1">
                  <span class="h-2 w-2 rounded-full bg-blue-500"></span>
                  Soumises
                </span>
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                <span class="inline-flex items-center gap-1">
                  <span class="h-2 w-2 rounded-full bg-yellow-500"></span>
                  En cours
                </span>
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                <span class="inline-flex items-center gap-1">
                  <span class="h-2 w-2 rounded-full bg-green-500"></span>
                  Acceptées
                </span>
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                <span class="inline-flex items-center gap-1">
                  <span class="h-2 w-2 rounded-full bg-red-500"></span>
                  Rejetées
                </span>
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                <span class="inline-flex items-center gap-1">
                  <span class="h-2 w-2 rounded-full bg-orange-500"></span>
                  Liste att.
                </span>
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                <span class="inline-flex items-center gap-1">
                  <span class="h-2 w-2 rounded-full bg-gray-500"></span>
                  Incomplètes
                </span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="call in callStats" :key="call.call_id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{{ call.call_title }}</td>
              <td class="px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white">{{ call.total }}</td>
              <td class="px-4 py-3 text-center text-sm text-blue-600 dark:text-blue-400">{{ call.submitted }}</td>
              <td class="px-4 py-3 text-center text-sm text-yellow-600 dark:text-yellow-400">{{ call.under_review }}</td>
              <td class="px-4 py-3 text-center text-sm text-green-600 dark:text-green-400">{{ call.accepted }}</td>
              <td class="px-4 py-3 text-center text-sm text-red-600 dark:text-red-400">{{ call.rejected }}</td>
              <td class="px-4 py-3 text-center text-sm text-orange-600 dark:text-orange-400">{{ call.waitlisted }}</td>
              <td class="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">{{ call.incomplete }}</td>
            </tr>
            <tr v-if="callStats.length === 0">
              <td colspan="8" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                Aucune donnée
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tableau évaluateurs - Masqué temporairement (nécessite table reviews) -->
    <!-- <div class="rounded-lg bg-white shadow dark:bg-gray-800">
      <div class="border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Statistiques des évaluateurs
        </h2>
      </div>
      <p class="p-4 text-sm text-gray-500 dark:text-gray-400">
        Fonctionnalité à venir
      </p>
    </div> -->

    </template>
  </div>
</template>
