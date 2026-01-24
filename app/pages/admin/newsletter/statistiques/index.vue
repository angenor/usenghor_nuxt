<script setup lang="ts">
import type {
  NewsletterGlobalStats,
  SubscriberEvolutionPoint,
  CampaignPerformance,
  SourceDistribution,
  SendTimeRecommendation,
  SubscriberSource
} from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const {
  getNewsletterGlobalStats,
  getSubscriberEvolution,
  getCampaignPerformance,
  getSourceDistribution,
  getBestSendTimes,
  sourceLabels,
  sourceColors
} = useMockData()

// === FILTRES ===
const dateFrom = ref('')
const dateTo = ref('')

// Presets de période
const periodPreset = ref<'month' | 'quarter' | 'year' | 'custom'>('year')

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
    case 'custom':
      // Ne rien faire, l'utilisateur choisit
      break
  }
}

// Initialisation avec l'année en cours
onMounted(() => {
  setPeriodPreset('year')
})

// === DONNÉES ===
const globalStats = computed<NewsletterGlobalStats>(() =>
  getNewsletterGlobalStats(dateFrom.value || undefined, dateTo.value || undefined)
)

const subscriberEvolution = computed<SubscriberEvolutionPoint[]>(() =>
  getSubscriberEvolution(dateFrom.value || undefined, dateTo.value || undefined, 'month')
)

const campaignPerformance = computed<CampaignPerformance[]>(() =>
  getCampaignPerformance(dateFrom.value || undefined, dateTo.value || undefined, 'sent_at', 'desc')
)

const sourceDistribution = computed<SourceDistribution[]>(() => getSourceDistribution())

const bestSendTimes = computed<SendTimeRecommendation>(() => getBestSendTimes())

// === GRAPHIQUE DONUT (Sources) ===
const sourceColorMap: Record<SubscriberSource, string> = {
  website_form: '#3B82F6',
  manual: '#A855F7',
  import: '#F59E0B',
  registration: '#10B981',
  event: '#06B6D4'
}

const donutData = computed(() => {
  const total = sourceDistribution.value.reduce((sum, s) => sum + s.count, 0)
  if (total === 0) return []

  let cumulativePercent = 0
  return sourceDistribution.value.map(source => {
    const startPercent = cumulativePercent
    cumulativePercent += source.percentage
    return {
      ...source,
      startPercent,
      endPercent: cumulativePercent,
      color: sourceColorMap[source.source],
      label: sourceLabels[source.source]
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

// === GRAPHIQUE BARRES (Évolution) ===
const maxEvolutionCount = computed(() => {
  if (subscriberEvolution.value.length === 0) return 1
  return Math.max(...subscriberEvolution.value.map(d => d.new_subscribers))
})

const formatPeriod = (period: string) => {
  const [year, month] = period.split('-')
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  return `${months[parseInt(month) - 1]} ${year.slice(2)}`
}

// Formater le taux
const formatRate = (rate: number) => {
  return `${rate.toFixed(1)}%`
}

// Formater la date
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// === EXPORT CSV ===
const exportCSV = () => {
  const rows: string[][] = []

  // En-tête
  rows.push(['Statistiques Newsletter'])
  rows.push(['Période', `${dateFrom.value || 'Début'} - ${dateTo.value || 'Fin'}`])
  rows.push([])

  // KPIs
  rows.push(['=== INDICATEURS CLÉS ==='])
  rows.push(['Abonnés actifs', globalStats.value.subscribers.total_active.toString()])
  rows.push(['Nouveaux abonnés (période)', globalStats.value.subscribers.new_this_period.toString()])
  rows.push(['Désinscriptions (période)', globalStats.value.subscribers.unsubscribed_this_period.toString()])
  rows.push(['Taux de croissance', `${globalStats.value.subscribers.growth_rate}%`])
  rows.push([])

  // Campagnes
  rows.push(['=== CAMPAGNES ==='])
  rows.push(['Campagnes envoyées', globalStats.value.campaigns.sent_count.toString()])
  rows.push(['Emails envoyés', globalStats.value.campaigns.total_emails_sent.toString()])
  rows.push(['Taux d\'ouverture moyen', `${globalStats.value.campaigns.avg_open_rate}%`])
  rows.push(['Taux de clic moyen', `${globalStats.value.campaigns.avg_click_rate}%`])
  rows.push(['Taux de désinscription moyen', `${globalStats.value.campaigns.avg_unsubscribe_rate}%`])
  rows.push([])

  // Évolution
  rows.push(['=== ÉVOLUTION DES ABONNÉS ==='])
  rows.push(['Période', 'Nouveaux', 'Désinscriptions', 'Croissance nette'])
  subscriberEvolution.value.forEach(point => {
    rows.push([point.period, point.new_subscribers.toString(), point.unsubscribes.toString(), point.net_growth.toString()])
  })
  rows.push([])

  // Performance campagnes
  rows.push(['=== PERFORMANCE DES CAMPAGNES ==='])
  rows.push(['Titre', 'Date envoi', 'Destinataires', 'Taux ouverture', 'Taux clic'])
  campaignPerformance.value.forEach(camp => {
    rows.push([camp.title, formatDate(camp.sent_at), camp.recipient_count.toString(), `${camp.open_rate}%`, `${camp.click_rate}%`])
  })
  rows.push([])

  // Par source
  rows.push(['=== RÉPARTITION PAR SOURCE ==='])
  rows.push(['Source', 'Nombre', 'Pourcentage'])
  sourceDistribution.value.forEach(source => {
    rows.push([sourceLabels[source.source], source.count.toString(), `${source.percentage}%`])
  })

  // Convertir en CSV
  const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')

  // Télécharger
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `statistiques-newsletter-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// Reset filtres
const resetFilters = () => {
  setPeriodPreset('year')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Statistiques Newsletter
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Analyse des performances de vos campagnes et de l'évolution des abonnés
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
              v-for="(label, key) in { month: 'Ce mois', quarter: 'Trimestre', year: 'Année', custom: 'Personnalisé' }"
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

        <!-- Reset -->
        <button
          v-if="periodPreset === 'custom'"
          class="text-sm text-blue-600 hover:underline dark:text-blue-400"
          @click="resetFilters"
        >
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <font-awesome-icon icon="fa-solid fa-users" class="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Abonnés actifs</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ globalStats.subscribers.total_active }}</p>
            <p
              v-if="globalStats.subscribers.growth_rate !== 0"
              class="text-xs"
              :class="globalStats.subscribers.growth_rate > 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ globalStats.subscribers.growth_rate > 0 ? '+' : '' }}{{ globalStats.subscribers.growth_rate }}%
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
            <font-awesome-icon icon="fa-solid fa-paper-plane" class="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Campagnes envoyées</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ globalStats.campaigns.sent_count }}</p>
            <p class="text-xs text-gray-500">{{ globalStats.campaigns.total_emails_sent.toLocaleString() }} emails</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon icon="fa-solid fa-envelope-open" class="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Taux d'ouverture</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ globalStats.campaigns.avg_open_rate }}%</p>
            <p class="text-xs text-gray-500">Moyenne des campagnes</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30">
            <font-awesome-icon icon="fa-solid fa-mouse-pointer" class="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Taux de clic</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ globalStats.campaigns.avg_click_rate }}%</p>
            <p class="text-xs text-gray-500">Moyenne des campagnes</p>
          </div>
        </div>
      </div>
    </div>

    <!-- KPIs secondaires -->
    <div class="grid grid-cols-3 gap-4">
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Nouveaux abonnés</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">+{{ globalStats.subscribers.new_this_period }}</p>
          </div>
          <font-awesome-icon icon="fa-solid fa-user-plus" class="h-8 w-8 text-green-200 dark:text-green-900/50" />
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Désinscriptions</p>
            <p class="text-2xl font-bold text-red-600 dark:text-red-400">-{{ globalStats.subscribers.unsubscribed_this_period }}</p>
          </div>
          <font-awesome-icon icon="fa-solid fa-user-minus" class="h-8 w-8 text-red-200 dark:text-red-900/50" />
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Taux désinscription</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.campaigns.avg_unsubscribe_rate }}%</p>
          </div>
          <font-awesome-icon icon="fa-solid fa-chart-line" class="h-8 w-8 text-gray-200 dark:text-gray-700" />
        </div>
      </div>
    </div>

    <!-- Graphiques -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Évolution des abonnés -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Évolution des abonnés
        </h2>

        <div v-if="subscriberEvolution.length > 0" class="space-y-3">
          <div
            v-for="point in subscriberEvolution"
            :key="point.period"
            class="flex items-center gap-3"
          >
            <span class="w-16 text-right text-sm text-gray-500 dark:text-gray-400">
              {{ formatPeriod(point.period) }}
            </span>
            <div class="flex-1">
              <div class="flex gap-1">
                <!-- Nouveaux -->
                <div
                  class="flex h-6 items-center justify-end rounded-l-full bg-green-500 px-2 text-xs font-medium text-white transition-all"
                  :style="{ width: `${Math.max((point.new_subscribers / maxEvolutionCount) * 50, 5)}%` }"
                  :title="`+${point.new_subscribers} nouveaux`"
                >
                  <span v-if="point.new_subscribers > 0">+{{ point.new_subscribers }}</span>
                </div>
                <!-- Désinscriptions -->
                <div
                  v-if="point.unsubscribes > 0"
                  class="flex h-6 items-center justify-start rounded-r-full bg-red-400 px-2 text-xs font-medium text-white transition-all"
                  :style="{ width: `${Math.max((point.unsubscribes / maxEvolutionCount) * 50, 5)}%` }"
                  :title="`-${point.unsubscribes} désinscriptions`"
                >
                  -{{ point.unsubscribes }}
                </div>
              </div>
            </div>
            <span
              class="w-12 text-right text-sm font-medium"
              :class="point.net_growth >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ point.net_growth >= 0 ? '+' : '' }}{{ point.net_growth }}
            </span>
          </div>
        </div>
        <p v-else class="text-center text-gray-500 dark:text-gray-400">
          Aucune donnée pour cette période
        </p>

        <div class="mt-4 flex items-center justify-center gap-6 text-xs">
          <div class="flex items-center gap-2">
            <span class="h-3 w-3 rounded-full bg-green-500"></span>
            <span class="text-gray-600 dark:text-gray-400">Nouveaux</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-3 w-3 rounded-full bg-red-400"></span>
            <span class="text-gray-600 dark:text-gray-400">Désinscriptions</span>
          </div>
        </div>
      </div>

      <!-- Répartition par source -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Sources d'inscription
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
                {{ globalStats.subscribers.total_active }}
              </text>
              <text x="100" y="115" text-anchor="middle" class="fill-gray-500 text-sm dark:fill-gray-400">
                abonnés
              </text>
            </svg>
          </div>

          <!-- Légende -->
          <div class="flex-1 space-y-2">
            <div
              v-for="segment in donutData"
              :key="segment.source"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: segment.color }"></span>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ segment.label }}</span>
              </div>
              <div class="text-right">
                <span class="font-medium text-gray-900 dark:text-white">{{ segment.count }}</span>
                <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">({{ segment.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance des campagnes -->
    <div class="rounded-lg bg-white shadow dark:bg-gray-800">
      <div class="border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Performance des campagnes
        </h2>
      </div>
      <div class="admin-scrollbar overflow-x-auto" data-lenis-prevent>
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Campagne</th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Date d'envoi</th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Destinataires</th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Taux d'ouverture</th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Taux de clic</th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Performance</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="campaign in campaignPerformance" :key="campaign.campaign_id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{{ campaign.title }}</td>
              <td class="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">{{ formatDate(campaign.sent_at) }}</td>
              <td class="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">{{ campaign.recipient_count }}</td>
              <td class="px-4 py-3 text-center">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="campaign.open_rate >= 40 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : campaign.open_rate >= 25 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'"
                >
                  {{ campaign.open_rate }}%
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="campaign.click_rate >= 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : campaign.click_rate >= 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'"
                >
                  {{ campaign.click_rate }}%
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      class="h-2 rounded-full transition-all"
                      :class="campaign.open_rate >= 40 ? 'bg-green-500' : campaign.open_rate >= 25 ? 'bg-yellow-500' : 'bg-red-500'"
                      :style="{ width: `${Math.min(campaign.open_rate * 2, 100)}%` }"
                    ></div>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="campaignPerformance.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                Aucune campagne envoyée sur cette période
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Meilleurs créneaux d'envoi -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Par heure -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Meilleures heures d'envoi
        </h2>

        <div class="space-y-3">
          <div
            v-for="(time, index) in bestSendTimes.by_hour.slice(0, 5)"
            :key="time.hour"
            class="flex items-center gap-3"
          >
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
              :class="index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
            >
              {{ index + 1 }}
            </span>
            <span class="w-12 text-sm font-medium text-gray-900 dark:text-white">{{ time.hour }}h00</span>
            <div class="flex-1">
              <div class="h-4 rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  class="h-4 rounded-full bg-blue-500 transition-all"
                  :style="{ width: `${time.open_rate}%` }"
                ></div>
              </div>
            </div>
            <span class="w-16 text-right text-sm text-gray-600 dark:text-gray-400">{{ time.open_rate }}%</span>
          </div>
        </div>

        <div class="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <div class="flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-lightbulb" class="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span class="text-sm text-blue-800 dark:text-blue-300">
              Recommandation : envoyez vos newsletters à <strong>{{ bestSendTimes.recommendation.best_hour }}h00</strong>
            </span>
          </div>
        </div>
      </div>

      <!-- Par jour -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Meilleurs jours d'envoi
        </h2>

        <div class="space-y-3">
          <div
            v-for="(day, index) in bestSendTimes.by_day"
            :key="day.day"
            class="flex items-center gap-3"
          >
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
              :class="index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
            >
              {{ index + 1 }}
            </span>
            <span class="w-20 text-sm font-medium text-gray-900 dark:text-white">{{ day.day_label }}</span>
            <div class="flex-1">
              <div class="h-4 rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  class="h-4 rounded-full bg-purple-500 transition-all"
                  :style="{ width: `${day.open_rate}%` }"
                ></div>
              </div>
            </div>
            <span class="w-16 text-right text-sm text-gray-600 dark:text-gray-400">{{ day.open_rate }}%</span>
          </div>
        </div>

        <div class="mt-4 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
          <div class="flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-calendar-check" class="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span class="text-sm text-purple-800 dark:text-purple-300">
              Recommandation : le <strong>{{ bestSendTimes.recommendation.best_day_label }}</strong> est le jour idéal
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
