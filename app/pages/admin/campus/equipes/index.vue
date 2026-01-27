<script setup lang="ts">
import type { CampusTeamMemberDisplay, CampusTeamStats, CampusForSelect } from '~/composables/useCampusTeamApi'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const route = useRoute()

const {
  getAllTeamMembers,
  getTeamStats,
  getCampusesForSelect,
  deleteTeamMember: apiDeleteTeamMember,
  toggleTeamMemberActive: apiToggleTeamMemberActive,
  reorderTeamMembers: apiReorderTeamMembers,
  formatDate,
  getFullName,
  getFlagEmoji,
} = useCampusTeamApi()

// === STATE ===
const isLoading = ref(true)
const selectedCampusId = ref<string>('')
const searchQuery = ref('')
const filterActive = ref<boolean | undefined>(undefined)
const sortBy = ref<'display_order' | 'name' | 'position' | 'start_date'>('display_order')
const sortOrder = ref<'asc' | 'desc'>('asc')
const showDeleteModal = ref(false)
const deletingMember = ref<CampusTeamMemberDisplay | null>(null)
const isDragging = ref(false)

// Données
const allMembers = ref<CampusTeamMemberDisplay[]>([])
const campuses = ref<CampusForSelect[]>([])
const stats = ref<CampusTeamStats>({
  total: 0,
  active: 0,
  inactive: 0,
  by_campus: {},
})

// Map pour compter les membres par campus rapidement
const memberCountByCampus = ref<Map<string, number>>(new Map())

// === CHARGEMENT DES DONNÉES ===
async function loadData() {
  isLoading.value = true
  try {
    const [membersData, campusesData, statsData] = await Promise.all([
      getAllTeamMembers(),
      getCampusesForSelect(),
      getTeamStats(),
    ])

    allMembers.value = membersData
    campuses.value = campusesData
    stats.value = statsData

    // Pré-calculer les compteurs par campus
    memberCountByCampus.value.clear()
    for (const campus of campusesData) {
      const count = membersData.filter(m => m.campus_id === campus.id).length
      memberCountByCampus.value.set(campus.id, count)
    }
  }
  catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
  finally {
    isLoading.value = false
  }
}

// Initialisation
onMounted(async () => {
  if (route.query.campus) {
    selectedCampusId.value = route.query.campus as string
  }
  await loadData()
})

// === COMPUTED ===

// Membres filtrés et triés
const filteredMembers = computed(() => {
  let result = [...allMembers.value]

  // Filtre par campus
  if (selectedCampusId.value) {
    result = result.filter(m => m.campus_id === selectedCampusId.value)
  }

  // Filtre par statut actif
  if (filterActive.value !== undefined) {
    result = result.filter(m => m.active === filterActive.value)
  }

  // Filtre par recherche
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    result = result.filter((m) => {
      const fullName = `${m.user.first_name} ${m.user.last_name}`.toLowerCase()
      return (
        fullName.includes(search)
        || m.user.email.toLowerCase().includes(search)
        || m.position.toLowerCase().includes(search)
      )
    })
  }

  // Tri
  result.sort((a, b) => {
    let comparison = 0
    switch (sortBy.value) {
      case 'name':
        comparison = `${a.user.first_name} ${a.user.last_name}`.localeCompare(
          `${b.user.first_name} ${b.user.last_name}`,
        )
        break
      case 'position':
        comparison = a.position.localeCompare(b.position)
        break
      case 'start_date':
        comparison = (a.start_date || '').localeCompare(b.start_date || '')
        break
      case 'display_order':
      default:
        comparison = a.display_order - b.display_order
    }
    return sortOrder.value === 'desc' ? -comparison : comparison
  })

  return result
})

// Campus sélectionné
const selectedCampus = computed(() => {
  if (!selectedCampusId.value) return null
  return campuses.value.find(c => c.id === selectedCampusId.value)
})

// === METHODS ===
function toggleSort(field: 'display_order' | 'name' | 'position' | 'start_date') {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }
  else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

function getSortIcon(field: 'display_order' | 'name' | 'position' | 'start_date') {
  if (sortBy.value !== field) return 'sort'
  return sortOrder.value === 'asc' ? 'sort-up' : 'sort-down'
}

// Navigation
function selectCampus(campusId: string) {
  selectedCampusId.value = campusId
  router.replace({ query: campusId ? { campus: campusId } : {} })
}

function addMember() {
  const query = selectedCampusId.value ? { campus: selectedCampusId.value } : {}
  router.push({ path: '/admin/campus/equipes/nouveau', query })
}

function editMember(member: CampusTeamMemberDisplay) {
  router.push(`/admin/campus/equipes/${member.id}/edit`)
}

// Suppression
function openDeleteModal(member: CampusTeamMemberDisplay) {
  deletingMember.value = member
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deletingMember.value = null
}

async function deleteMember() {
  if (!deletingMember.value) return

  try {
    await apiDeleteTeamMember(deletingMember.value.id)
    closeDeleteModal()
    await loadData()
  }
  catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

// Toggle actif
async function toggleMemberActive(member: CampusTeamMemberDisplay) {
  try {
    await apiToggleTeamMemberActive(member.id)
    await loadData()
  }
  catch (error) {
    console.error('Erreur lors du basculement:', error)
  }
}

// Drag and drop
function handleDragStart(event: DragEvent, index: number) {
  if (searchQuery.value || filterActive.value !== undefined || !selectedCampusId.value) return
  isDragging.value = true
  event.dataTransfer?.setData('text/plain', index.toString())
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}

async function handleDrop(event: DragEvent, targetIndex: number) {
  event.preventDefault()
  isDragging.value = false
  const sourceIndex = Number.parseInt(event.dataTransfer?.getData('text/plain') || '0')
  if (sourceIndex !== targetIndex) {
    // Réorganiser le tableau localement d'abord
    const members = [...filteredMembers.value]
    const [movedMember] = members.splice(sourceIndex, 1)
    members.splice(targetIndex, 0, movedMember)

    // Envoyer le nouvel ordre au backend
    const memberIds = members.map(m => m.id)
    try {
      await apiReorderTeamMembers(memberIds)
      await loadData()
    }
    catch (error) {
      console.error('Erreur lors du réordonnement:', error)
    }
  }
}

function handleDragEnd() {
  isDragging.value = false
}

// Helpers
function getCampusName(campusId: string): string {
  const campus = campuses.value.find(c => c.id === campusId)
  return campus?.name || campusId
}

function getCampusMemberCount(campusId: string): number {
  return memberCountByCampus.value.get(campusId) || 0
}

function getCampusCountryCode(campus: CampusForSelect): string {
  // Mapper les codes campus vers les codes pays
  const codeToCountry: Record<string, string> = {
    ALX: 'EG',
    ABJ: 'CI',
    DKR: 'SN',
    YAO: 'CM',
    LBV: 'GA',
    TNR: 'MG',
    RBA: 'MA',
  }
  return codeToCountry[campus.code] || ''
}
</script>

<template>
  <div class="p-6">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <template v-else>
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
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ stats.total }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Total membres
              </p>
            </div>
          </div>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <font-awesome-icon :icon="['fas', 'check-circle']" class="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ stats.active }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Actifs
              </p>
            </div>
          </div>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
              <font-awesome-icon :icon="['fas', 'pause-circle']" class="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ stats.inactive }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Inactifs
              </p>
            </div>
          </div>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <font-awesome-icon :icon="['fas', 'building']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ Object.keys(stats.by_campus).length }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Campus actifs
              </p>
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
            v-for="campus in campuses"
            :key="campus.id"
            class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="selectedCampusId === campus.id
              ? 'bg-brand-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
            @click="selectCampus(campus.id)"
          >
            <span>{{ getFlagEmoji(getCampusCountryCode(campus)) }}</span>
            {{ campus.name }}
            <span
              class="rounded-full px-2 py-0.5 text-xs"
              :class="selectedCampusId === campus.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'"
            >
              {{ getCampusMemberCount(campus.id) }}
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
              <option :value="undefined">
                Tous les statuts
              </option>
              <option :value="true">
                Actifs
              </option>
              <option :value="false">
                Inactifs
              </option>
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
                        :alt="getFullName(member.user)"
                        class="h-full w-full object-cover"
                      />
                      <font-awesome-icon v-else :icon="['fas', 'user']" class="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ getFullName(member.user) }}
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
                <strong class="text-gray-900 dark:text-white">{{ getFullName(deletingMember.user) }}</strong>
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
    </template>
  </div>
</template>
