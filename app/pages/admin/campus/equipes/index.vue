<script setup lang="ts">
import type { CampusTeamMember, CampusTeamFilters, CampusExternalise } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const route = useRoute()

const {
  campusExternalises,
  campusPrincipal,
  getAllCampusTeamAdmin,
  getCampusTeamMemberById,
  getCampusTeamStatsAdmin,
  countCampusTeamMembers,
  generateCampusTeamId
} = useMockData()

// === STATE ===
const selectedCampusId = ref<string>('')
const searchQuery = ref('')
const filterActive = ref<boolean | undefined>(undefined)
const sortBy = ref<'display_order' | 'name' | 'position' | 'start_date'>('display_order')
const sortOrder = ref<'asc' | 'desc'>('asc')
const showDeleteModal = ref(false)
const deletingMember = ref<CampusTeamMember | null>(null)
const isDragging = ref(false)

// Initialisation depuis l'URL
onMounted(() => {
  if (route.query.campus) {
    selectedCampusId.value = route.query.campus as string
  }
})

// === COMPUTED ===

// Liste des campus avec le siège
const allCampuses = computed(() => {
  const siege = {
    id: 'siege',
    name_fr: 'Siège - Alexandrie',
    country_fr: 'Égypte',
    country: 'EG'
  }
  return [siege, ...campusExternalises.value]
})

// Statistiques globales
const stats = computed(() => getCampusTeamStatsAdmin())

// Membres filtrés
const filteredMembers = computed(() => {
  const filters: CampusTeamFilters = {
    campus_id: selectedCampusId.value || undefined,
    active: filterActive.value,
    search: searchQuery.value || undefined,
    sort_by: sortBy.value,
    sort_order: sortOrder.value
  }
  return getAllCampusTeamAdmin(filters)
})

// Campus sélectionné
const selectedCampus = computed(() => {
  if (!selectedCampusId.value) return null
  if (selectedCampusId.value === 'siege') {
    return { id: 'siege', name_fr: 'Siège - Alexandrie', country_fr: 'Égypte', country: 'EG' }
  }
  return campusExternalises.value.find(c => c.id === selectedCampusId.value)
})

// === METHODS ===
const toggleSort = (field: 'display_order' | 'name' | 'position' | 'start_date') => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const getSortIcon = (field: 'display_order' | 'name' | 'position' | 'start_date') => {
  if (sortBy.value !== field) return 'sort'
  return sortOrder.value === 'asc' ? 'sort-up' : 'sort-down'
}

// Navigation
const selectCampus = (campusId: string) => {
  selectedCampusId.value = campusId
  router.replace({ query: campusId ? { campus: campusId } : {} })
}

const addMember = () => {
  const query = selectedCampusId.value ? { campus: selectedCampusId.value } : {}
  router.push({ path: '/admin/campus/equipes/nouveau', query })
}

const editMember = (member: CampusTeamMember) => {
  router.push(`/admin/campus/equipes/${member.id}/edit`)
}

// Suppression
const openDeleteModal = (member: CampusTeamMember) => {
  deletingMember.value = member
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingMember.value = null
}

const deleteMember = () => {
  if (deletingMember.value) {
    console.log('Suppression du membre:', deletingMember.value.id)
    // En production: DELETE /api/admin/campus-team/{id}
  }
  closeDeleteModal()
}

// Toggle actif
const toggleMemberActive = (member: CampusTeamMember) => {
  console.log('Basculer le statut actif:', member.id, !member.active)
  // En production: POST /api/admin/campus-team/{id}/toggle-active
}

// Drag and drop
const handleDragStart = (event: DragEvent, index: number) => {
  if (searchQuery.value || filterActive.value !== undefined || !selectedCampusId.value) return
  isDragging.value = true
  event.dataTransfer?.setData('text/plain', index.toString())
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault()
  isDragging.value = false
  const sourceIndex = parseInt(event.dataTransfer?.getData('text/plain') || '0')
  if (sourceIndex !== targetIndex) {
    console.log('Réordonnement:', sourceIndex, '->', targetIndex)
    // En production: PUT /api/admin/campuses/{campus_id}/team/reorder
  }
}

const handleDragEnd = () => {
  isDragging.value = false
}

// Formatage
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getFullName = (member: CampusTeamMember) => {
  return `${member.user.first_name} ${member.user.last_name}`
}

const getCampusName = (campusId: string) => {
  if (campusId === 'siege') return 'Siège - Alexandrie'
  const campus = campusExternalises.value.find(c => c.id === campusId)
  return campus?.name_fr || campusId
}

// Flag emoji helper
const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return ''
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Équipes campus
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestion des membres des équipes de chaque campus
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700"
        @click="addMember"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter un membre
      </button>
    </div>

    <!-- Stats globales -->
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <font-awesome-icon :icon="['fas', 'users']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total membres</p>
          </div>
        </div>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.active }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Actifs</p>
          </div>
        </div>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
            <font-awesome-icon :icon="['fas', 'pause-circle']" class="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.inactive }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Inactifs</p>
          </div>
        </div>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
            <font-awesome-icon :icon="['fas', 'building']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ Object.keys(stats.by_campus).length }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Campus actifs</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sélecteur de campus -->
    <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Filtrer par campus
      </label>
      <div class="flex flex-wrap gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="!selectedCampusId
            ? 'bg-brand-red-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
          @click="selectCampus('')"
        >
          <font-awesome-icon :icon="['fas', 'globe']" class="h-4 w-4" />
          Tous les campus
          <span class="rounded-full bg-white/20 px-2 py-0.5 text-xs">{{ stats.total }}</span>
        </button>
        <button
          v-for="campus in allCampuses"
          :key="campus.id"
          class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="selectedCampusId === campus.id
            ? 'bg-brand-red-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
          @click="selectCampus(campus.id)"
        >
          <span>{{ getFlagEmoji(campus.country) }}</span>
          {{ campus.name_fr }}
          <span
            class="rounded-full px-2 py-0.5 text-xs"
            :class="selectedCampusId === campus.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'"
          >
            {{ countCampusTeamMembers(campus.id, false) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div class="flex flex-col gap-4 md:flex-row">
        <!-- Recherche -->
        <div class="flex-1">
          <div class="relative">
            <font-awesome-icon
              :icon="['fas', 'search']"
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher par nom, poste, email..."
              class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <!-- Filtre par statut -->
        <div class="w-full md:w-48">
          <select
            v-model="filterActive"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option :value="undefined">Tous les statuts</option>
            <option :value="true">Actifs</option>
            <option :value="false">Inactifs</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Info drag & drop -->
    <div
      v-if="!searchQuery && filterActive === undefined && selectedCampusId"
      class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"
    >
      <div class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
        <font-awesome-icon :icon="['fas', 'info-circle']" class="h-4 w-4" />
        <span>Glissez-déposez les lignes pour réordonner l'affichage des membres</span>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th class="w-10 px-4 py-3" />
              <th class="px-4 py-3 text-left">
                <button
                  class="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  @click="toggleSort('name')"
                >
                  Membre
                  <font-awesome-icon :icon="['fas', getSortIcon('name')]" class="h-3 w-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-left">
                <button
                  class="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  @click="toggleSort('position')"
                >
                  Poste
                  <font-awesome-icon :icon="['fas', getSortIcon('position')]" class="h-3 w-3" />
                </button>
              </th>
              <th v-if="!selectedCampusId" class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Campus
              </th>
              <th class="px-4 py-3 text-left">
                <button
                  class="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  @click="toggleSort('start_date')"
                >
                  Date début
                  <font-awesome-icon :icon="['fas', getSortIcon('start_date')]" class="h-3 w-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Statut
              </th>
              <th class="px-4 py-3 text-center">
                <button
                  class="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  @click="toggleSort('display_order')"
                >
                  Ordre
                  <font-awesome-icon :icon="['fas', getSortIcon('display_order')]" class="h-3 w-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="(member, index) in filteredMembers"
              :key="member.id"
              class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              :class="{ 'opacity-50': !member.active }"
              :draggable="!searchQuery && filterActive === undefined && !!selectedCampusId"
              @dragstart="handleDragStart($event, index)"
              @dragover="handleDragOver"
              @drop="handleDrop($event, index)"
              @dragend="handleDragEnd"
            >
              <!-- Grip -->
              <td class="px-4 py-3">
                <button
                  v-if="!searchQuery && filterActive === undefined && selectedCampusId"
                  class="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing dark:hover:text-gray-300"
                >
                  <font-awesome-icon :icon="['fas', 'grip-vertical']" class="h-4 w-4" />
                </button>
              </td>

              <!-- Membre -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                    <img
                      v-if="member.user.photo_url"
                      :src="member.user.photo_url"
                      :alt="getFullName(member)"
                      class="h-full w-full object-cover"
                    />
                    <font-awesome-icon v-else :icon="['fas', 'user']" class="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ getFullName(member) }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ member.user.email }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Poste -->
              <td class="px-4 py-3">
                <span class="text-gray-900 dark:text-white">{{ member.position }}</span>
              </td>

              <!-- Campus (si vue globale) -->
              <td v-if="!selectedCampusId" class="px-4 py-3">
                <button
                  class="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                  @click="selectCampus(member.campus_id)"
                >
                  {{ getCampusName(member.campus_id) }}
                </button>
              </td>

              <!-- Date début -->
              <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(member.start_date) }}
                <template v-if="member.end_date">
                  <br />
                  <span class="text-orange-600 dark:text-orange-400">
                    Fin: {{ formatDate(member.end_date) }}
                  </span>
                </template>
              </td>

              <!-- Statut -->
              <td class="px-4 py-3 text-center">
                <button
                  class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors"
                  :class="member.active
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'"
                  @click="toggleMemberActive(member)"
                >
                  <font-awesome-icon :icon="['fas', member.active ? 'check-circle' : 'pause-circle']" class="h-3 w-3" />
                  {{ member.active ? 'Actif' : 'Inactif' }}
                </button>
              </td>

              <!-- Ordre -->
              <td class="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                {{ member.display_order }}
              </td>

              <!-- Actions -->
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                    title="Modifier"
                    @click="editMember(member)"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    title="Retirer de l'équipe"
                    @click="openDeleteModal(member)"
                  >
                    <font-awesome-icon :icon="['fas', 'user-minus']" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div
        v-if="filteredMembers.length === 0"
        class="py-12 text-center"
      >
        <font-awesome-icon :icon="['fas', 'users']" class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
        <p class="text-gray-500 dark:text-gray-400">
          {{ selectedCampusId ? 'Aucun membre dans cette équipe' : 'Aucun membre trouvé' }}
        </p>
        <button
          v-if="searchQuery || filterActive !== undefined"
          class="mt-2 text-sm text-brand-red-600 hover:underline dark:text-brand-red-400"
          @click="searchQuery = ''; filterActive = undefined"
        >
          Réinitialiser les filtres
        </button>
        <button
          v-else-if="selectedCampusId"
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700"
          @click="addMember"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
          Ajouter le premier membre
        </button>
      </div>
    </div>

    <!-- Modal Suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingMember"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-800">
          <div class="p-6 text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon :icon="['fas', 'user-minus']" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Retirer le membre de l'équipe
            </h3>
            <p class="mb-4 text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir retirer
              <strong class="text-gray-900 dark:text-white">{{ getFullName(deletingMember) }}</strong>
              de l'équipe ?
            </p>
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Cette action ne supprime pas le compte utilisateur.
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeDeleteModal"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              @click="deleteMember"
            >
              Retirer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
