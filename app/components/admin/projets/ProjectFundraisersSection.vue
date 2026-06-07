<script setup lang="ts">
import type { FundraiserRead, FundraiserStatus } from '~/types/fundraising'

const props = defineProps<{
  projectId: string
}>()

const {
  listProjectFundraisers,
  attachProjectFundraiser,
  updateProjectFundraiser,
  detachProjectFundraiser,
} = useProjectsApi()

const { listFundraisers, formatCurrency } = useAdminFundraisingApi()

// État
const fundraisers = ref<FundraiserRead[]>([])
const allFundraisers = ref<FundraiserRead[]>([])
const isLoading = ref(true)
const showAddModal = ref(false)
const editing = ref<{ id: string, start_date: string, end_date: string } | null>(null)
const addForm = reactive({
  fundraiser_id: '',
  start_date: '',
  end_date: '',
})

const statusLabels: Record<FundraiserStatus, string> = {
  draft: 'Brouillon',
  active: 'Active',
  completed: 'Terminée',
}
const statusColors: Record<FundraiserStatus, string> = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

// Chargement
onMounted(async () => {
  await Promise.all([loadFundraisers(), loadAllFundraisers()])
  isLoading.value = false
})

async function loadFundraisers() {
  try {
    fundraisers.value = await listProjectFundraisers(props.projectId)
  }
  catch (err) {
    console.error('Erreur chargement levées du projet:', err)
  }
}

async function loadAllFundraisers() {
  try {
    const response = await listFundraisers({ limit: 200 })
    allFundraisers.value = response.items
  }
  catch (err) {
    console.error('Erreur chargement liste des levées:', err)
  }
}

// Levées disponibles (non rattachées à un projet)
const availableFundraisers = computed(() =>
  allFundraisers.value.filter(f => !f.project_external_id),
)

// Format période lisible
function formatPeriod(f: { start_date: string | null, end_date: string | null }): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  if (f.start_date && f.end_date) return `Du ${fmt(f.start_date)} au ${fmt(f.end_date)}`
  if (f.start_date) return `Depuis le ${fmt(f.start_date)}`
  if (f.end_date) return `Jusqu'au ${fmt(f.end_date)}`
  return 'Période non précisée'
}

// Actions
async function handleAdd() {
  if (!addForm.fundraiser_id) {
    alert('Veuillez sélectionner une levée de fonds')
    return
  }
  try {
    await attachProjectFundraiser(props.projectId, {
      fundraiser_external_id: addForm.fundraiser_id,
      start_date: addForm.start_date || null,
      end_date: addForm.end_date || null,
    })
    await Promise.all([loadFundraisers(), loadAllFundraisers()])
    showAddModal.value = false
    addForm.fundraiser_id = ''
    addForm.start_date = ''
    addForm.end_date = ''
  }
  catch (err) {
    console.error('Erreur association levée:', err)
    alert('Erreur lors de l\'association de la levée de fonds')
  }
}

async function handleUpdatePeriod() {
  if (!editing.value) return
  try {
    await updateProjectFundraiser(props.projectId, editing.value.id, {
      start_date: editing.value.start_date || null,
      end_date: editing.value.end_date || null,
    })
    await loadFundraisers()
    editing.value = null
  }
  catch (err) {
    console.error('Erreur mise à jour période:', err)
    alert('Erreur lors de la mise à jour de la période')
  }
}

async function handleDetach(fundraiserId: string) {
  if (!confirm('Dissocier cette levée de fonds du projet ? (la levée est conservée)')) return
  try {
    await detachProjectFundraiser(props.projectId, fundraiserId)
    await Promise.all([loadFundraisers(), loadAllFundraisers()])
  }
  catch (err) {
    console.error('Erreur dissociation levée:', err)
    alert('Erreur lors de la dissociation')
  }
}

function openEditPeriod(f: FundraiserRead) {
  editing.value = {
    id: f.id,
    start_date: f.start_date || '',
    end_date: f.end_date || '',
  }
}
</script>

<template>
  <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <font-awesome-icon :icon="['fas', 'hand-holding-dollar']" class="h-5 w-5 text-amber-500" />
        Levées de fonds
      </h2>
      <button
        class="text-sm text-blue-600 hover:underline dark:text-blue-400"
        @click="showAddModal = true"
      >
        + Associer une levée
      </button>
    </div>

    <!-- Chargement -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-2xl text-gray-400" />
    </div>

    <!-- Liste des levées associées (historique) -->
    <div v-else-if="fundraisers.length > 0" class="space-y-3">
      <div
        v-for="f in fundraisers"
        :key="f.id"
        class="group flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
      >
        <div class="flex items-center gap-3">
          <img
            v-if="f.cover_image_external_id"
            :src="`/api/public/media/${f.cover_image_external_id}/download?variant=low`"
            class="h-10 w-10 rounded object-cover"
          />
          <div v-else class="flex h-10 w-10 items-center justify-center rounded bg-amber-50 dark:bg-amber-900/20">
            <font-awesome-icon :icon="['fas', 'hand-holding-dollar']" class="text-amber-400" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-900 dark:text-white">{{ f.title }}</span>
              <span :class="['rounded-full px-2 py-0.5 text-xs', statusColors[f.status]]">
                {{ statusLabels[f.status] }}
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-x-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{{ formatPeriod(f) }}</span>
              <span class="text-gray-300 dark:text-gray-600">•</span>
              <span>Objectif : {{ formatCurrency(f.goal_amount) }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            class="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
            title="Modifier la période"
            @click="openEditPeriod(f)"
          >
            <font-awesome-icon :icon="['fas', 'pen']" class="h-4 w-4" />
          </button>
          <button
            class="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            title="Dissocier"
            @click="handleDetach(f.id)"
          >
            <font-awesome-icon :icon="['fas', 'unlink']" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="py-8 text-center text-gray-400">
      Aucune levée de fonds associée
    </div>

    <!-- Modal association -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Associer une levée de fonds
          </h3>

          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Levée de fonds <span class="text-red-500">*</span>
              </label>
              <select
                v-model="addForm.fundraiser_id"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Sélectionnez une levée</option>
                <option v-for="f in availableFundraisers" :key="f.id" :value="f.id">
                  {{ f.title }}
                </option>
              </select>
              <p v-if="availableFundraisers.length === 0" class="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Aucune levée disponible. Créez-en une dans la section « Levées de fonds », ou dissociez-en une d'un autre projet.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date de début
                </label>
                <input
                  v-model="addForm.start_date"
                  type="date"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date de fin
                </label>
                <input
                  v-model="addForm.end_date"
                  type="date"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showAddModal = false"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              @click="handleAdd"
            >
              Associer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal édition période -->
    <Teleport to="body">
      <div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Modifier la période
          </h3>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date de début
              </label>
              <input
                v-model="editing.start_date"
                type="date"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date de fin
              </label>
              <input
                v-model="editing.end_date"
                type="date"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="editing = null"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              @click="handleUpdatePeriod"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
