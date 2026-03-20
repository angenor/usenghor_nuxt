<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const { getCampaign, getResponses, getStats, exportCsv } = useAdminSurveyApi()

const campaignId = route.params.id as string

const loading = ref(true)
const error = ref<string | null>(null)
const campaign = ref<any>(null)
const stats = ref<any>(null)
const responses = ref<any[]>([])
const responsesTotal = ref(0)
const responsesPage = ref(1)
const responsesPages = ref(0)
const responsesLoading = ref(false)

const activeTab = ref<'stats' | 'responses'>('stats')

onMounted(async () => {
  try {
    const [campaignData, statsData] = await Promise.all([
      getCampaign(campaignId),
      getStats(campaignId),
    ])
    campaign.value = campaignData
    stats.value = statsData

    // Charger la première page de réponses
    await loadResponses()
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors du chargement'
  } finally {
    loading.value = false
  }
})

async function loadResponses(page: number = 1) {
  responsesLoading.value = true
  try {
    const data = await getResponses(campaignId, {
      page,
      limit: 20,
      sort_by: 'submitted_at',
      sort_order: 'desc',
    })
    responses.value = data.items
    responsesTotal.value = data.total
    responsesPage.value = data.page
    responsesPages.value = data.pages
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors du chargement des réponses'
  } finally {
    responsesLoading.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleExport() {
  try {
    await exportCsv(campaignId)
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de l\'export'
  }
}

// Extraire les clés de réponses pour les en-têtes du tableau
const responseKeys = computed(() => {
  const keys = new Set<string>()
  for (const r of responses.value) {
    if (r.response_data) {
      for (const key of Object.keys(r.response_data)) {
        keys.add(key)
      }
    }
  }
  return Array.from(keys)
})

function formatValue(val: any): string {
  if (val === null || val === undefined) return ''
  if (Array.isArray(val)) {
    return val.map(v => formatValue(v)).join(', ')
  }
  if (typeof val === 'object') {
    if (val.name && val.content) return val.name
    return JSON.stringify(val)
  }
  return String(val)
}

interface FileInfo {
  name: string
  content: string
  type?: string
}

function isFileValue(val: any): val is FileInfo | FileInfo[] {
  if (Array.isArray(val)) return val.length > 0 && val[0]?.name && val[0]?.content
  return val && typeof val === 'object' && val.name && val.content
}

function getFiles(val: any): FileInfo[] {
  if (Array.isArray(val)) return val.filter(v => v?.name && v?.content)
  if (val?.name && val?.content) return [val]
  return []
}

function isPdf(file: FileInfo): boolean {
  if (file.type?.includes('pdf')) return true
  return file.name?.toLowerCase().endsWith('.pdf') || false
}

const previewFile = ref<FileInfo | null>(null)
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 p-6">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-200 border-t-brand-blue-600" />
    </div>

    <template v-else-if="campaign">
      <!-- En-tête -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Résultats : {{ campaign.title_fr }}</h1>
          <div class="mt-1 flex items-center gap-2">
            <SurveyCampaignStatusBadge :status="campaign.status" />
            <span class="text-sm text-gray-500">{{ responsesTotal }} réponse{{ responsesTotal > 1 ? 's' : '' }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="handleExport"
          >
            Exporter CSV
          </button>
          <NuxtLink
            :to="`/admin/campagnes/${campaignId}/edit`"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Modifier la campagne
          </NuxtLink>
          <NuxtLink
            to="/admin/campagnes"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Retour
          </NuxtLink>
        </div>
      </div>

      <!-- Erreur -->
      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
        {{ error }}
      </div>

      <!-- Onglets -->
      <div class="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          :class="[
            'px-4 py-2.5 text-sm font-medium transition-colors',
            activeTab === 'stats'
              ? 'border-b-2 border-brand-blue-600 text-brand-blue-600 dark:text-brand-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
          ]"
          @click="activeTab = 'stats'"
        >
          Statistiques
        </button>
        <button
          type="button"
          :class="[
            'px-4 py-2.5 text-sm font-medium transition-colors',
            activeTab === 'responses'
              ? 'border-b-2 border-brand-blue-600 text-brand-blue-600 dark:text-brand-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
          ]"
          @click="activeTab = 'responses'"
        >
          Réponses individuelles ({{ responsesTotal }})
        </button>
      </div>

      <!-- Vue Statistiques -->
      <div v-if="activeTab === 'stats' && stats">
        <SurveyResponseStats :stats="stats" />
      </div>

      <!-- Vue Réponses individuelles -->
      <div v-if="activeTab === 'responses'" class="rounded-lg bg-white shadow dark:bg-gray-800">
        <div v-if="responsesLoading" class="flex items-center justify-center py-12">
          <div class="h-6 w-6 animate-spin rounded-full border-4 border-brand-blue-200 border-t-brand-blue-600" />
        </div>
        <div v-else-if="responses.length === 0" class="py-12 text-center text-sm text-gray-500">
          Aucune réponse pour le moment.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
              <tr>
                <th class="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Date</th>
                <th
                  v-for="key in responseKeys"
                  :key="key"
                  class="px-4 py-3 font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ key }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="response in responses" :key="response.id">
                <td class="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">
                  {{ formatDate(response.submitted_at) }}
                </td>
                <td
                  v-for="key in responseKeys"
                  :key="key"
                  class="max-w-xs px-4 py-3 text-gray-800 dark:text-gray-200"
                >
                  <!-- Fichier(s) -->
                  <template v-if="isFileValue(response.response_data?.[key])">
                    <div v-for="(file, fi) in getFiles(response.response_data[key])" :key="fi" class="flex items-center gap-2">
                      <button
                        v-if="isPdf(file)"
                        type="button"
                        class="text-sm text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
                        title="Visualiser le PDF"
                        @click="previewFile = file"
                      >
                        {{ file.name }}
                      </button>
                      <a
                        v-else
                        :href="file.content"
                        :download="file.name"
                        class="text-sm text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
                        title="Télécharger"
                      >
                        {{ file.name }}
                      </a>
                      <a
                        :href="file.content"
                        :download="file.name"
                        class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Télécharger"
                      >
                        ↓
                      </a>
                    </div>
                  </template>
                  <!-- Valeur classique -->
                  <span v-else class="truncate" :title="formatValue(response.response_data?.[key])">
                    {{ formatValue(response.response_data?.[key]) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="responsesPages > 1" class="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
          <p class="text-sm text-gray-500">
            Page {{ responsesPage }} sur {{ responsesPages }} ({{ responsesTotal }} résultat{{ responsesTotal > 1 ? 's' : '' }})
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              :disabled="responsesPage <= 1"
              class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600"
              @click="loadResponses(responsesPage - 1)"
            >
              Précédent
            </button>
            <button
              type="button"
              :disabled="responsesPage >= responsesPages"
              class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600"
              @click="loadResponses(responsesPage + 1)"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Modale prévisualisation PDF -->
    <Teleport to="body">
      <div v-if="previewFile" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="previewFile = null">
        <div class="relative flex h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ previewFile.name }}</span>
            <div class="flex items-center gap-2">
              <a
                :href="previewFile.content"
                :download="previewFile.name"
                class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Télécharger
              </a>
              <button
                type="button"
                class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                @click="previewFile = null"
              >
                ✕
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-hidden">
            <iframe
              :src="previewFile.content"
              class="h-full w-full border-0"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
