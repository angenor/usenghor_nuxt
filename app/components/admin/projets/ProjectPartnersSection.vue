<script setup lang="ts">
import type { ProjectPartnerRead } from '~/types/api'
import type { PartnerDisplay } from '~/composables/usePartnersApi'

const props = defineProps<{
  projectId: string
}>()

const {
  listProjectPartners,
  addProjectPartner,
  updateProjectPartner,
  removeProjectPartner,
} = useProjectsApi()

const {
  getAllPartners,
  partnerTypeLabels,
  partnerTypeColors,
} = usePartnersApi()

// État
const partners = ref<ProjectPartnerRead[]>([])
const allPartners = ref<PartnerDisplay[]>([])
const isLoading = ref(true)
const showAddModal = ref(false)
const editingPartner = ref<{ partnerId: string; role: string } | null>(null)
const newPartnerForm = reactive({
  partner_id: '',
  role: '',
})

// Chargement
onMounted(async () => {
  await Promise.all([loadPartners(), loadAllPartners()])
  isLoading.value = false
})

async function loadPartners() {
  try {
    partners.value = await listProjectPartners(props.projectId)
  }
  catch (err) {
    console.error('Erreur chargement partenaires:', err)
  }
}

async function loadAllPartners() {
  try {
    allPartners.value = await getAllPartners()
  }
  catch (err) {
    console.error('Erreur chargement liste partenaires:', err)
  }
}

// Partenaires disponibles (non encore associés)
const availablePartners = computed(() => {
  const assignedIds = new Set(partners.value.map(p => p.partner_external_id))
  return allPartners.value.filter(p => !assignedIds.has(p.id))
})

// Enrichir les partenaires avec les infos complètes
const enrichedPartners = computed(() => {
  return partners.value.map((pp) => {
    const partner = allPartners.value.find(p => p.id === pp.partner_external_id)
    return { ...pp, partner }
  })
})

// Actions
async function handleAdd() {
  if (!newPartnerForm.partner_id) {
    alert('Veuillez sélectionner un partenaire')
    return
  }

  try {
    await addProjectPartner(props.projectId, {
      partner_external_id: newPartnerForm.partner_id,
      partner_role: newPartnerForm.role || null,
    })
    await loadPartners()
    showAddModal.value = false
    newPartnerForm.partner_id = ''
    newPartnerForm.role = ''
  }
  catch (err) {
    console.error('Erreur ajout partenaire:', err)
    alert('Erreur lors de l\'ajout du partenaire')
  }
}

async function handleUpdateRole() {
  if (!editingPartner.value) return

  try {
    await updateProjectPartner(
      props.projectId,
      editingPartner.value.partnerId,
      { partner_role: editingPartner.value.role || null },
    )
    await loadPartners()
    editingPartner.value = null
  }
  catch (err) {
    console.error('Erreur mise à jour rôle:', err)
    alert('Erreur lors de la mise à jour')
  }
}

async function handleRemove(partnerId: string) {
  if (!confirm('Retirer ce partenaire du projet ?')) return

  try {
    await removeProjectPartner(props.projectId, partnerId)
    await loadPartners()
  }
  catch (err) {
    console.error('Erreur suppression partenaire:', err)
    alert('Erreur lors de la suppression')
  }
}

function openEditRole(partnerId: string, currentRole: string | null) {
  editingPartner.value = {
    partnerId,
    role: currentRole || '',
  }
}
</script>

<template>
  <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <font-awesome-icon :icon="['fas', 'handshake']" class="h-5 w-5 text-orange-500" />
        Partenaires
      </h2>
      <button
        class="text-sm text-blue-600 hover:underline dark:text-blue-400"
        @click="showAddModal = true"
      >
        + Ajouter
      </button>
    </div>

    <!-- Chargement -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-2xl text-gray-400" />
    </div>

    <!-- Liste des partenaires -->
    <div v-else-if="enrichedPartners.length > 0" class="space-y-3">
      <div
        v-for="item in enrichedPartners"
        :key="item.partner_external_id"
        class="group flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
      >
        <div class="flex items-center gap-3">
          <img
            v-if="item.partner?.logo_external_id"
            :src="`https://picsum.photos/seed/${item.partner.logo_external_id}/40/40`"
            class="h-10 w-10 rounded object-contain"
          />
          <div v-else class="flex h-10 w-10 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
            <font-awesome-icon :icon="['fas', 'building']" class="text-gray-400" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-900 dark:text-white">
                {{ item.partner?.name || 'Partenaire inconnu' }}
              </span>
              <span
                v-if="item.partner?.type"
                :class="['rounded-full px-2 py-0.5 text-xs', partnerTypeColors[item.partner.type]]"
              >
                {{ partnerTypeLabels[item.partner.type] }}
              </span>
            </div>
            <div v-if="item.partner_role" class="text-sm text-gray-500 dark:text-gray-400">
              Rôle: {{ item.partner_role }}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            class="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
            title="Modifier le rôle"
            @click="openEditRole(item.partner_external_id, item.partner_role)"
          >
            <font-awesome-icon :icon="['fas', 'pen']" class="h-4 w-4" />
          </button>
          <button
            class="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            title="Retirer"
            @click="handleRemove(item.partner_external_id)"
          >
            <font-awesome-icon :icon="['fas', 'unlink']" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="py-8 text-center text-gray-400">
      Aucun partenaire associé
    </div>

    <!-- Modal ajout partenaire -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Ajouter un partenaire
          </h3>

          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Partenaire <span class="text-red-500">*</span>
              </label>
              <select
                v-model="newPartnerForm.partner_id"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Sélectionnez un partenaire</option>
                <option v-for="p in availablePartners" :key="p.id" :value="p.id">
                  {{ p.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rôle dans le projet
              </label>
              <input
                v-model="newPartnerForm.role"
                type="text"
                placeholder="Ex: Financeur, Partenaire technique..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
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
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal édition rôle -->
    <Teleport to="body">
      <div v-if="editingPartner" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Modifier le rôle
          </h3>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Rôle dans le projet
            </label>
            <input
              v-model="editingPartner.role"
              type="text"
              placeholder="Ex: Financeur, Partenaire technique..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="editingPartner = null"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              @click="handleUpdateRole"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
