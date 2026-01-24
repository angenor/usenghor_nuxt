<script setup lang="ts">
import type { NewsletterCampaignWithStats, CampaignStatus, CampaignFilters, CampaignStats, CampaignRecipient } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const {
  getAllCampaigns,
  getCampaignById,
  getCampaignStats,
  getCampaignRecipients,
  getCampaignGlobalStats,
  canEditCampaign,
  canDeleteCampaign,
  canSendCampaign,
  canScheduleCampaign,
  canUnscheduleCampaign,
  duplicateCampaign,
  getActiveSubscribersCount,
  campaignStatusLabels,
  campaignStatusColors,
  sendStatusLabels,
  sendStatusColors
} = useMockData()

// === STATE ===
const isLoading = ref(true)
const searchQuery = ref('')
const statusFilter = ref<CampaignStatus | 'all'>('all')
const dateFrom = ref('')
const dateTo = ref('')
const sortBy = ref<CampaignFilters['sort_by']>('created_at')
const sortOrder = ref<CampaignFilters['sort_order']>('desc')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Modals
const showDeleteModal = ref(false)
const campaignToDelete = ref<NewsletterCampaignWithStats | null>(null)

const showSendModal = ref(false)
const campaignToSend = ref<NewsletterCampaignWithStats | null>(null)

const showScheduleModal = ref(false)
const campaignToSchedule = ref<NewsletterCampaignWithStats | null>(null)
const scheduledDate = ref('')
const scheduledTime = ref('09:00')

const showStatsModal = ref(false)
const selectedCampaign = ref<NewsletterCampaignWithStats | null>(null)
const selectedCampaignStats = ref<CampaignStats | null>(null)
const selectedCampaignRecipients = ref<CampaignRecipient[]>([])
const recipientStatusFilter = ref<'all' | 'sent' | 'opened' | 'clicked' | 'error'>('all')

// === COMPUTED ===

// Statistiques globales
const globalStats = computed(() => getCampaignGlobalStats())

// Nombre d'abonnés actifs
const activeSubscribersCount = computed(() => getActiveSubscribersCount())

// Filtres appliqués
const filters = computed<CampaignFilters>(() => ({
  search: searchQuery.value || undefined,
  status: statusFilter.value === 'all' ? undefined : statusFilter.value,
  date_from: dateFrom.value || undefined,
  date_to: dateTo.value || undefined,
  sort_by: sortBy.value,
  sort_order: sortOrder.value
}))

// Liste filtrée
const filteredCampaigns = computed(() => getAllCampaigns(filters.value))

// Pagination
const totalPages = computed(() => Math.ceil(filteredCampaigns.value.length / itemsPerPage))
const paginatedCampaigns = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredCampaigns.value.slice(start, start + itemsPerPage)
})

// Statuts disponibles
const availableStatuses: CampaignStatus[] = ['draft', 'scheduled', 'sent']

// === METHODS ===

// Initialisation
onMounted(() => {
  isLoading.value = false
})

// Réinitialiser les filtres
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
}

// Trier par colonne
const toggleSort = (column: CampaignFilters['sort_by']) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'desc'
  }
  currentPage.value = 1
}

// Format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format date courte
const formatDateShort = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Icône selon le statut
const getStatusIcon = (status: CampaignStatus) => {
  switch (status) {
    case 'draft':
      return 'file-alt'
    case 'scheduled':
      return 'clock'
    case 'sent':
      return 'paper-plane'
    default:
      return 'circle'
  }
}

// === ACTIONS ===

// Dupliquer une campagne
const handleDuplicate = (campaign: NewsletterCampaignWithStats) => {
  const duplicated = duplicateCampaign(campaign.id)
  if (duplicated) {
    console.log('Campagne dupliquée:', duplicated)
    // En production: POST /api/admin/newsletter/campaigns/{id}/duplicate
    // puis rediriger vers l'édition
    router.push(`/admin/newsletter/campagnes/${duplicated.id}/edit`)
  }
}

// Supprimer une campagne
const confirmDelete = (campaign: NewsletterCampaignWithStats) => {
  if (!canDeleteCampaign(campaign)) return
  campaignToDelete.value = campaign
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (campaignToDelete.value) {
    console.log('Suppression:', campaignToDelete.value.id)
    // En production: DELETE /api/admin/newsletter/campaigns/{id}
  }
  showDeleteModal.value = false
  campaignToDelete.value = null
}

// Envoyer immédiatement
const confirmSend = (campaign: NewsletterCampaignWithStats) => {
  if (!canSendCampaign(campaign)) return
  campaignToSend.value = campaign
  showSendModal.value = true
}

const executeSend = async () => {
  if (campaignToSend.value) {
    console.log('Envoi immédiat:', campaignToSend.value.id, 'à', activeSubscribersCount.value, 'abonnés')
    // En production: POST /api/admin/newsletter/campaigns/{id}/send
  }
  showSendModal.value = false
  campaignToSend.value = null
}

// Programmer l'envoi
const openScheduleModal = (campaign: NewsletterCampaignWithStats) => {
  if (!canScheduleCampaign(campaign)) return
  campaignToSchedule.value = campaign
  // Préremplir avec demain à 9h
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  scheduledDate.value = tomorrow.toISOString().split('T')[0]
  scheduledTime.value = '09:00'
  showScheduleModal.value = true
}

const executeSchedule = async () => {
  if (campaignToSchedule.value && scheduledDate.value) {
    const sendAt = `${scheduledDate.value}T${scheduledTime.value}:00Z`
    console.log('Programmation:', campaignToSchedule.value.id, 'pour', sendAt)
    // En production: POST /api/admin/newsletter/campaigns/{id}/schedule
  }
  showScheduleModal.value = false
  campaignToSchedule.value = null
}

// Annuler la programmation
const cancelSchedule = async (campaign: NewsletterCampaignWithStats) => {
  if (!canUnscheduleCampaign(campaign)) return
  console.log('Annulation programmation:', campaign.id)
  // En production: POST /api/admin/newsletter/campaigns/{id}/unschedule
}

// Afficher les statistiques détaillées
const openStatsModal = (campaign: NewsletterCampaignWithStats) => {
  selectedCampaign.value = campaign
  selectedCampaignStats.value = getCampaignStats(campaign.id) || null
  recipientStatusFilter.value = 'all'
  loadRecipients()
  showStatsModal.value = true
}

const loadRecipients = () => {
  if (!selectedCampaign.value) return
  selectedCampaignRecipients.value = getCampaignRecipients(
    selectedCampaign.value.id,
    { status: recipientStatusFilter.value === 'all' ? undefined : recipientStatusFilter.value }
  )
}

// Watch pour recharger les destinataires quand le filtre change
watch(recipientStatusFilter, () => {
  loadRecipients()
})

// Watch pour reset pagination
watch([searchQuery, statusFilter, dateFrom, dateTo], () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Campagnes newsletter
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Créez et gérez vos campagnes d'emailing
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700"
        @click="router.push('/admin/newsletter/campagnes/nouveau')"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Nouvelle campagne
      </button>
    </div>

    <!-- Statistiques -->
    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <font-awesome-icon :icon="['fas', 'envelope']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.total_campaigns }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total</p>
          </div>
        </div>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'paper-plane']" class="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.sent_campaigns }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Envoyées</p>
          </div>
        </div>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <font-awesome-icon :icon="['fas', 'clock']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.scheduled_campaigns }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Programmées</p>
          </div>
        </div>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <font-awesome-icon :icon="['fas', 'file-alt']" class="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.draft_campaigns }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Brouillons</p>
          </div>
        </div>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
            <font-awesome-icon :icon="['fas', 'chart-line']" class="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.average_open_rate }}%</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Taux ouverture</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Recherche -->
        <div class="min-w-[200px] flex-1">
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recherche
          </label>
          <div class="relative">
            <font-awesome-icon
              :icon="['fas', 'search']"
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Titre, objet..."
              class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <!-- Statut -->
        <div class="w-44">
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Statut
          </label>
          <select
            v-model="statusFilter"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option v-for="status in availableStatuses" :key="status" :value="status">
              {{ campaignStatusLabels[status] }}
            </option>
          </select>
        </div>

        <!-- Date de début -->
        <div class="w-40">
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Du
          </label>
          <input
            v-model="dateFrom"
            type="date"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <!-- Date de fin -->
        <div class="w-40">
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Au
          </label>
          <input
            v-model="dateTo"
            type="date"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <!-- Reset -->
        <button
          class="rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          @click="resetFilters"
        >
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <!-- Liste des campagnes -->
    <div v-else class="space-y-4">
      <div
        v-for="campaign in paginatedCampaigns"
        :key="campaign.id"
        class="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <!-- Info principale -->
          <div class="flex-1">
            <div class="flex items-start gap-3">
              <!-- Icône statut -->
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                :class="{
                  'bg-gray-100 dark:bg-gray-700': campaign.status === 'draft',
                  'bg-blue-100 dark:bg-blue-900/30': campaign.status === 'scheduled',
                  'bg-green-100 dark:bg-green-900/30': campaign.status === 'sent'
                }"
              >
                <font-awesome-icon
                  :icon="['fas', getStatusIcon(campaign.status)]"
                  class="h-5 w-5"
                  :class="{
                    'text-gray-600 dark:text-gray-400': campaign.status === 'draft',
                    'text-blue-600 dark:text-blue-400': campaign.status === 'scheduled',
                    'text-green-600 dark:text-green-400': campaign.status === 'sent'
                  }"
                />
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="font-semibold text-gray-900 dark:text-white">
                    {{ campaign.title }}
                  </h3>
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="campaignStatusColors[campaign.status]"
                  >
                    {{ campaignStatusLabels[campaign.status] }}
                  </span>
                </div>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <font-awesome-icon :icon="['fas', 'envelope']" class="mr-1 h-3 w-3" />
                  {{ campaign.subject }}
                </p>
                <div class="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    <font-awesome-icon :icon="['fas', 'calendar']" class="mr-1" />
                    Créée le {{ formatDateShort(campaign.created_at) }}
                  </span>
                  <span v-if="campaign.status === 'scheduled' && campaign.scheduled_send_at">
                    <font-awesome-icon :icon="['fas', 'clock']" class="mr-1" />
                    Programmée le {{ formatDate(campaign.scheduled_send_at) }}
                  </span>
                  <span v-if="campaign.status === 'sent' && campaign.sent_at">
                    <font-awesome-icon :icon="['fas', 'paper-plane']" class="mr-1" />
                    Envoyée le {{ formatDate(campaign.sent_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats (pour les campagnes envoyées) -->
          <div
            v-if="campaign.status === 'sent'"
            class="flex items-center gap-6 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-700/50"
          >
            <div class="text-center">
              <p class="text-lg font-bold text-gray-900 dark:text-white">{{ campaign.recipient_count }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Destinataires</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ campaign.open_rate }}%</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Ouvertures</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-green-600 dark:text-green-400">{{ campaign.click_rate }}%</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Clics</p>
            </div>
            <button
              class="rounded p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-300"
              title="Voir les statistiques"
              @click="openStatsModal(campaign)"
            >
              <font-awesome-icon :icon="['fas', 'chart-bar']" class="h-5 w-5" />
            </button>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <!-- Actions pour brouillons -->
            <template v-if="campaign.status === 'draft'">
              <button
                class="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                @click="confirmSend(campaign)"
              >
                <font-awesome-icon :icon="['fas', 'paper-plane']" class="h-3.5 w-3.5" />
                Envoyer
              </button>
              <button
                class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="openScheduleModal(campaign)"
              >
                <font-awesome-icon :icon="['fas', 'clock']" class="h-3.5 w-3.5" />
                Programmer
              </button>
            </template>

            <!-- Actions pour programmées -->
            <template v-if="campaign.status === 'scheduled'">
              <button
                class="inline-flex items-center gap-1 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30"
                @click="cancelSchedule(campaign)"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="h-3.5 w-3.5" />
                Annuler
              </button>
            </template>

            <!-- Menu dropdown pour autres actions -->
            <div class="relative">
              <button
                class="rounded p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <font-awesome-icon :icon="['fas', 'ellipsis-v']" class="h-4 w-4" />
              </button>
              <!-- Menu simple sans dropdown pour la démo -->
            </div>

            <!-- Boutons d'action rapide -->
            <button
              v-if="canEditCampaign(campaign)"
              class="rounded p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
              title="Modifier"
              @click="router.push(`/admin/newsletter/campagnes/${campaign.id}/edit`)"
            >
              <font-awesome-icon :icon="['fas', 'pen']" class="h-4 w-4" />
            </button>
            <button
              class="rounded p-2 text-purple-600 transition-colors hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
              title="Dupliquer"
              @click="handleDuplicate(campaign)"
            >
              <font-awesome-icon :icon="['fas', 'copy']" class="h-4 w-4" />
            </button>
            <button
              v-if="canDeleteCampaign(campaign)"
              class="rounded p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              title="Supprimer"
              @click="confirmDelete(campaign)"
            >
              <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
            </button>
            <button
              v-if="campaign.status === 'sent'"
              class="rounded p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              title="Voir le détail"
              @click="router.push(`/admin/newsletter/campagnes/${campaign.id}`)"
            >
              <font-awesome-icon :icon="['fas', 'eye']" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="paginatedCampaigns.length === 0"
        class="rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800"
      >
        <font-awesome-icon :icon="['fas', 'envelope-open']" class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
        <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
          Aucune campagne trouvée
        </h3>
        <p class="mb-4 text-gray-500 dark:text-gray-400">
          Modifiez vos filtres ou créez une nouvelle campagne.
        </p>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700"
          @click="router.push('/admin/newsletter/campagnes/nouveau')"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
          Créer une campagne
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="mt-6 flex items-center justify-between"
    >
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ (currentPage - 1) * itemsPerPage + 1 }} -
        {{ Math.min(currentPage * itemsPerPage, filteredCampaigns.length) }}
        sur {{ filteredCampaigns.length }} campagnes
      </p>
      <div class="flex gap-2">
        <button
          class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Précédent
        </button>
        <button
          class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Suivant
        </button>
      </div>
    </div>

    <!-- Modal de suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showDeleteModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer la campagne
            </h3>
          </div>

          <p class="mb-6 text-gray-600 dark:text-gray-400">
            Voulez-vous vraiment supprimer la campagne <strong>"{{ campaignToDelete?.title }}"</strong> ?
            Cette action est irréversible.
          </p>

          <div class="flex justify-end gap-3">
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDeleteModal = false"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              @click="executeDelete"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal d'envoi -->
    <Teleport to="body">
      <div
        v-if="showSendModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showSendModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <font-awesome-icon :icon="['fas', 'paper-plane']" class="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Envoyer maintenant
            </h3>
          </div>

          <p class="mb-4 text-gray-600 dark:text-gray-400">
            Vous êtes sur le point d'envoyer la campagne <strong>"{{ campaignToSend?.title }}"</strong>.
          </p>

          <div class="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div class="flex items-center gap-3">
              <font-awesome-icon :icon="['fas', 'users']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p class="font-medium text-blue-900 dark:text-blue-200">
                  {{ activeSubscribersCount }} destinataires
                </p>
                <p class="text-sm text-blue-700 dark:text-blue-300">
                  Tous les abonnés actifs recevront cet email
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showSendModal = false"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              @click="executeSend"
            >
              Envoyer maintenant
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de programmation -->
    <Teleport to="body">
      <div
        v-if="showScheduleModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showScheduleModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <font-awesome-icon :icon="['fas', 'clock']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Programmer l'envoi
            </h3>
          </div>

          <p class="mb-4 text-gray-600 dark:text-gray-400">
            Programmez l'envoi de <strong>"{{ campaignToSchedule?.title }}"</strong>
          </p>

          <div class="mb-6 space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date d'envoi
              </label>
              <input
                v-model="scheduledDate"
                type="date"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Heure d'envoi
              </label>
              <input
                v-model="scheduledTime"
                type="time"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div class="mb-6 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p class="text-sm text-blue-700 dark:text-blue-300">
              <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-1" />
              La campagne sera envoyée à {{ activeSubscribersCount }} abonnés actifs.
            </p>
          </div>

          <div class="flex justify-end gap-3">
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showScheduleModal = false"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
              :disabled="!scheduledDate"
              @click="executeSchedule"
            >
              Programmer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal statistiques -->
    <Teleport to="body">
      <div
        v-if="showStatsModal && selectedCampaign && selectedCampaignStats"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showStatsModal = false"
      >
        <div class="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Statistiques de la campagne
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ selectedCampaign.title }}</p>
            </div>
            <button
              class="rounded p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              @click="showStatsModal = false"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <!-- Contenu -->
          <div class="max-h-[calc(90vh-80px)] overflow-y-auto p-4">
            <!-- Stats globales -->
            <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedCampaignStats.recipient_count }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Destinataires</p>
              </div>
              <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedCampaignStats.sent_count }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Envoyés</p>
                <p v-if="selectedCampaignStats.error_count > 0" class="text-xs text-red-500">
                  {{ selectedCampaignStats.error_count }} erreur(s)
                </p>
              </div>
              <div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ selectedCampaignStats.open_rate }}%</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Taux d'ouverture</p>
                <p class="text-xs text-gray-400">{{ selectedCampaignStats.unique_opens }} uniques</p>
              </div>
              <div class="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ selectedCampaignStats.click_rate }}%</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Taux de clics</p>
                <p class="text-xs text-gray-400">{{ selectedCampaignStats.unique_clicks }} uniques</p>
              </div>
            </div>

            <!-- Graphique par jour -->
            <div v-if="selectedCampaignStats.by_day.length > 0" class="mb-6">
              <h4 class="mb-3 font-medium text-gray-900 dark:text-white">Activité par jour</h4>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200 dark:border-gray-700">
                      <th class="py-2 text-left font-medium text-gray-700 dark:text-gray-300">Date</th>
                      <th class="py-2 text-right font-medium text-gray-700 dark:text-gray-300">Ouvertures</th>
                      <th class="py-2 text-right font-medium text-gray-700 dark:text-gray-300">Clics</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="day in selectedCampaignStats.by_day" :key="day.date" class="border-b border-gray-100 dark:border-gray-700/50">
                      <td class="py-2 text-gray-700 dark:text-gray-300">{{ formatDateShort(day.date) }}</td>
                      <td class="py-2 text-right text-blue-600 dark:text-blue-400">{{ day.opens }}</td>
                      <td class="py-2 text-right text-green-600 dark:text-green-400">{{ day.clicks }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Liste des destinataires -->
            <div>
              <div class="mb-3 flex items-center justify-between">
                <h4 class="font-medium text-gray-900 dark:text-white">Destinataires</h4>
                <select
                  v-model="recipientStatusFilter"
                  class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Tous</option>
                  <option value="sent">Envoyé</option>
                  <option value="opened">Ouvert</option>
                  <option value="clicked">Cliqué</option>
                  <option value="error">Erreur</option>
                </select>
              </div>

              <div class="max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table class="w-full text-sm">
                  <thead class="sticky top-0 bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th class="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Email</th>
                      <th class="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Nom</th>
                      <th class="px-3 py-2 text-center font-medium text-gray-700 dark:text-gray-300">Statut</th>
                      <th class="px-3 py-2 text-right font-medium text-gray-700 dark:text-gray-300">Ouvert</th>
                      <th class="px-3 py-2 text-right font-medium text-gray-700 dark:text-gray-300">Cliqué</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
                    <tr v-for="recipient in selectedCampaignRecipients.slice(0, 50)" :key="recipient.id">
                      <td class="px-3 py-2 text-gray-700 dark:text-gray-300">{{ recipient.email }}</td>
                      <td class="px-3 py-2 text-gray-500 dark:text-gray-400">{{ recipient.subscriber_name || '-' }}</td>
                      <td class="px-3 py-2 text-center">
                        <span
                          class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          :class="sendStatusColors[recipient.status]"
                        >
                          {{ sendStatusLabels[recipient.status] }}
                        </span>
                      </td>
                      <td class="px-3 py-2 text-right text-gray-500 dark:text-gray-400">
                        {{ recipient.opened_at ? formatDate(recipient.opened_at) : '-' }}
                      </td>
                      <td class="px-3 py-2 text-right text-gray-500 dark:text-gray-400">
                        {{ recipient.clicked_at ? formatDate(recipient.clicked_at) : '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="selectedCampaignRecipients.length > 50" class="border-t border-gray-200 p-3 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Affichage limité à 50 résultats sur {{ selectedCampaignRecipients.length }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
