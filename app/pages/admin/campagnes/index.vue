<script setup lang="ts">
import type { SurveyCampaignStatus } from '~/types/survey'

definePageMeta({ layout: 'admin' })

const router = useRouter()
const {
  listCampaigns,
  deleteCampaign,
  closeCampaign,
  duplicateCampaign,
} = useAdminSurveyApi()

const loading = ref(true)
const error = ref<string | null>(null)

// Données
const campaigns = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pages = ref(0)

// Filtres
const search = ref('')
const statusFilter = ref<string>('')
const sortBy = ref('created_at')
const sortOrder = ref('desc')

// Modales
const showDeleteModal = ref(false)
const showDuplicateModal = ref(false)
const selectedCampaignId = ref<string | null>(null)
const selectedCampaignTitle = ref('')
const duplicateSlug = ref('')

const statusOptions: Array<{ value: string; label: string }> = [
  { value: '', label: 'Tous les statuts' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'En pause' },
  { value: 'closed', label: 'Clôturée' },
]

// Chargement
async function loadCampaigns() {
  loading.value = true
  error.value = null
  try {
    const data = await listCampaigns({
      page: page.value,
      limit: 20,
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
    })
    campaigns.value = data.items
    total.value = data.total
    pages.value = data.pages
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors du chargement'
  } finally {
    loading.value = false
  }
}

onMounted(loadCampaigns)

// Debounce recherche
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(search, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadCampaigns()
  }, 300)
})

watch([statusFilter, sortBy, sortOrder], () => {
  page.value = 1
  loadCampaigns()
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function toggleSort(field: string) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'desc'
  }
}

function sortIndicator(field: string): string {
  if (sortBy.value !== field) return ''
  return sortOrder.value === 'asc' ? ' ↑' : ' ↓'
}

// Actions
function confirmDelete(campaign: any) {
  selectedCampaignId.value = campaign.id
  selectedCampaignTitle.value = campaign.title_fr
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!selectedCampaignId.value) return
  try {
    await deleteCampaign(selectedCampaignId.value)
    showDeleteModal.value = false
    await loadCampaigns()
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de la suppression'
  }
}

function openDuplicate(campaign: any) {
  selectedCampaignId.value = campaign.id
  selectedCampaignTitle.value = campaign.title_fr
  duplicateSlug.value = `${campaign.slug}-copie`
  showDuplicateModal.value = true
}

async function handleDuplicate() {
  if (!selectedCampaignId.value || !duplicateSlug.value) return
  try {
    const result = await duplicateCampaign(selectedCampaignId.value, duplicateSlug.value)
    showDuplicateModal.value = false
    router.push(`/admin/campagnes/${result.id}/edit`)
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de la duplication'
  }
}

async function handleClose(campaign: any) {
  if (!confirm(`Clôturer la campagne "${campaign.title_fr}" ? Cette action est irréversible.`)) return
  try {
    await closeCampaign(campaign.id)
    await loadCampaigns()
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de la clôture'
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 p-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Campagnes de sondage</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ total }} campagne{{ total > 1 ? 's' : '' }}
        </p>
      </div>
      <NuxtLink
        to="/admin/campagnes/nouveau"
        class="rounded-lg bg-brand-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-blue-700"
      >
        + Nouvelle campagne
      </NuxtLink>
    </div>

    <!-- Erreur -->
    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
      {{ error }}
    </div>

    <!-- Filtres -->
    <div class="flex flex-wrap items-center gap-3">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher..."
        class="w-64 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
      <select
        v-model="statusFilter"
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Tableau -->
    <div class="rounded-lg bg-white shadow dark:bg-gray-800">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-6 w-6 animate-spin rounded-full border-4 border-brand-blue-200 border-t-brand-blue-600" />
      </div>
      <div v-else-if="campaigns.length === 0" class="py-12 text-center text-sm text-gray-500">
        Aucune campagne trouvée.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
            <tr>
              <th
                class="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300"
                @click="toggleSort('title_fr')"
              >
                Titre{{ sortIndicator('title_fr') }}
              </th>
              <th class="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Statut</th>
              <th
                class="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300"
                @click="toggleSort('response_count')"
              >
                Réponses{{ sortIndicator('response_count') }}
              </th>
              <th
                class="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300"
                @click="toggleSort('created_at')"
              >
                Créée le{{ sortIndicator('created_at') }}
              </th>
              <th class="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="c in campaigns" :key="c.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-4 py-3">
                <NuxtLink
                  :to="`/admin/campagnes/${c.id}/edit`"
                  class="font-medium text-gray-900 hover:text-brand-blue-600 dark:text-white dark:hover:text-brand-blue-400"
                >
                  {{ c.title_fr }}
                </NuxtLink>
                <p class="text-xs text-gray-500">{{ c.slug }}</p>
              </td>
              <td class="px-4 py-3">
                <SurveyCampaignStatusBadge :status="c.status" />
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400">
                {{ c.response_count || 0 }}
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400">
                {{ formatDate(c.created_at) }}
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink
                    v-if="c.status !== 'draft'"
                    :to="`/admin/campagnes/${c.id}/resultats`"
                    class="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    title="Résultats"
                  >
                    Résultats
                  </NuxtLink>
                  <NuxtLink
                    :to="`/admin/campagnes/${c.id}/edit`"
                    class="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    Modifier
                  </NuxtLink>
                  <button
                    type="button"
                    class="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    @click="openDuplicate(c)"
                  >
                    Dupliquer
                  </button>
                  <button
                    v-if="c.status === 'active' || c.status === 'paused'"
                    type="button"
                    class="rounded px-2 py-1 text-xs text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                    @click="handleClose(c)"
                  >
                    Clôturer
                  </button>
                  <button
                    type="button"
                    class="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                    @click="confirmDelete(c)"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pages > 1" class="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
        <p class="text-sm text-gray-500">
          Page {{ page }} sur {{ pages }}
        </p>
        <div class="flex gap-2">
          <button
            type="button"
            :disabled="page <= 1"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600"
            @click="page--; loadCampaigns()"
          >
            Précédent
          </button>
          <button
            type="button"
            :disabled="page >= pages"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600"
            @click="page++; loadCampaigns()"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Modale suppression -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Confirmer la suppression</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Supprimer la campagne <strong>{{ selectedCampaignTitle }}</strong> ?
            Toutes les réponses associées seront définitivement supprimées.
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600"
              @click="showDeleteModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              @click="handleDelete"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modale duplication -->
    <Teleport to="body">
      <div v-if="showDuplicateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Dupliquer la campagne</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Créer une copie de <strong>{{ selectedCampaignTitle }}</strong> (sans les réponses).
          </p>
          <div class="mt-4">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nouveau slug</label>
            <input
              v-model="duplicateSlug"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600"
              @click="showDuplicateModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="!duplicateSlug"
              class="rounded-lg bg-brand-blue-600 px-4 py-2 text-sm text-white hover:bg-brand-blue-700 disabled:opacity-50"
              @click="handleDuplicate"
            >
              Dupliquer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
