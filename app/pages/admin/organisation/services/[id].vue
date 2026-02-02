<script setup lang="ts">
import type {
  ServiceWithDetails,
  ServiceTeamMemberRead,
  ServiceTeamMemberCreate,
  ServiceTeamMemberUpdate,
} from '~/composables/useServicesApi'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const serviceId = route.params.id as string

const {
  getServiceById,
  updateService,
  getServiceTeamMembers,
  addServiceTeamMember,
  updateServiceTeamMember,
  deleteServiceTeamMember,
  getSectorsForSelect,
} = useServicesApi()

const { apiFetch } = useApi()

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)
const service = ref<ServiceWithDetails | null>(null)
const activeTab = ref<'info' | 'team' | 'objectives' | 'achievements' | 'projects'>('info')

// Team management
const teamMembers = ref<ServiceTeamMemberRead[]>([])
const showAddMemberModal = ref(false)
const showEditMemberModal = ref(false)
const showDeleteMemberModal = ref(false)
const editingMember = ref<ServiceTeamMemberRead | null>(null)
const deletingMember = ref<ServiceTeamMemberRead | null>(null)

// Form state for team member
const newMember = ref<ServiceTeamMemberCreate>({
  user_external_id: '',
  position: '',
  display_order: 0,
  start_date: null,
  end_date: null,
  active: true,
})

// Users list for select
interface UserCandidate {
  id: string
  name: string
  email: string
  photo_external_id: string | null
}
const userCandidates = ref<UserCandidate[]>([])

// Sectors for info editing
const sectors = ref<Array<{ id: string; name: string; code: string }>>([])

// === LOAD DATA ===
async function loadService() {
  isLoading.value = true
  try {
    service.value = await getServiceById(serviceId)
    teamMembers.value = service.value?.team || []
  }
  catch (error) {
    console.error('Erreur lors du chargement du service:', error)
    router.push('/admin/organisation/services')
  }
  finally {
    isLoading.value = false
  }
}

async function loadTeamMembers() {
  try {
    teamMembers.value = await getServiceTeamMembers(serviceId)
  }
  catch (error) {
    console.error('Erreur lors du chargement de l\'équipe:', error)
  }
}

async function loadUserCandidates() {
  try {
    const response = await apiFetch<{
      items: Array<{
        id: string
        first_name: string
        last_name: string
        email: string
        salutation: string | null
        photo_external_id: string | null
      }>
    }>('/api/admin/users', {
      query: { limit: 100, active: true },
    })
    userCandidates.value = response.items.map(user => ({
      id: user.id,
      name: user.salutation
        ? `${user.salutation} ${user.first_name} ${user.last_name}`
        : `${user.first_name} ${user.last_name}`,
      email: user.email,
      photo_external_id: user.photo_external_id,
    }))
  }
  catch (err) {
    console.error('Erreur chargement des utilisateurs:', err)
  }
}

async function loadSectors() {
  try {
    sectors.value = await getSectorsForSelect()
  }
  catch (err) {
    console.error('Erreur chargement des secteurs:', err)
  }
}

onMounted(async () => {
  await Promise.all([
    loadService(),
    loadUserCandidates(),
    loadSectors(),
  ])
})

// === TEAM MEMBER CRUD ===
function openAddMemberModal() {
  newMember.value = {
    user_external_id: '',
    position: '',
    display_order: teamMembers.value.length,
    start_date: null,
    end_date: null,
    active: true,
  }
  showAddMemberModal.value = true
}

function openEditMemberModal(member: ServiceTeamMemberRead) {
  editingMember.value = member
  newMember.value = {
    user_external_id: member.user_external_id,
    position: member.position,
    display_order: member.display_order,
    start_date: member.start_date,
    end_date: member.end_date,
    active: member.active,
  }
  showEditMemberModal.value = true
}

function openDeleteMemberModal(member: ServiceTeamMemberRead) {
  deletingMember.value = member
  showDeleteMemberModal.value = true
}

function closeModals() {
  showAddMemberModal.value = false
  showEditMemberModal.value = false
  showDeleteMemberModal.value = false
  editingMember.value = null
  deletingMember.value = null
}

async function saveMember() {
  isSaving.value = true
  try {
    if (editingMember.value) {
      await updateServiceTeamMember(serviceId, editingMember.value.id, newMember.value as ServiceTeamMemberUpdate)
    }
    else {
      await addServiceTeamMember(serviceId, newMember.value)
    }
    closeModals()
    await loadTeamMembers()
  }
  catch (error) {
    console.error('Erreur lors de la sauvegarde du membre:', error)
  }
  finally {
    isSaving.value = false
  }
}

async function deleteMemberAction() {
  if (!deletingMember.value) return

  isSaving.value = true
  try {
    await deleteServiceTeamMember(serviceId, deletingMember.value.id)
    closeModals()
    await loadTeamMembers()
  }
  catch (error) {
    console.error('Erreur lors de la suppression du membre:', error)
  }
  finally {
    isSaving.value = false
  }
}

// Get user info from candidates
function getUserInfo(userId: string): UserCandidate | undefined {
  return userCandidates.value.find(u => u.id === userId)
}

// Format date
function formatDate(dateString: string | null): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="p-6">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <font-awesome-icon :icon="['fas', 'spinner']" class="w-8 h-8 text-brand-red-600 animate-spin mb-4" />
        <p class="text-gray-500 dark:text-gray-400">Chargement du service...</p>
      </div>
    </div>

    <template v-else-if="service">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button
            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            @click="router.push('/admin/organisation/services')"
          >
            <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-5 h-5" />
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ service.name }}
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gestion du service et de son équipe
            </p>
          </div>
        </div>
        <span
          class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
          :class="service.active
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'"
        >
          {{ service.active ? 'Actif' : 'Inactif' }}
        </span>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav class="flex gap-4">
          <button
            v-for="tab in [
              { key: 'info', label: 'Informations', icon: 'info-circle' },
              { key: 'team', label: 'Équipe', icon: 'users' },
              { key: 'objectives', label: 'Objectifs', icon: 'bullseye' },
              { key: 'achievements', label: 'Réalisations', icon: 'trophy' },
              { key: 'projects', label: 'Projets', icon: 'diagram-project' },
            ]"
            :key="tab.key"
            class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
            :class="activeTab === tab.key
              ? 'border-brand-red-600 text-brand-red-600 dark:text-brand-red-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
            @click="activeTab = tab.key as typeof activeTab"
          >
            <font-awesome-icon :icon="['fas', tab.icon]" class="w-4 h-4" />
            {{ tab.label }}
            <span
              v-if="tab.key === 'team'"
              class="ml-1 px-2 py-0.5 text-xs rounded-full"
              :class="activeTab === 'team'
                ? 'bg-brand-red-100 text-brand-red-700 dark:bg-brand-red-900/30 dark:text-brand-red-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
            >
              {{ teamMembers.length }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Tab Content: Team -->
      <div v-if="activeTab === 'team'">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Équipe du service</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Gérez les membres de l'équipe</p>
          </div>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-red-600 rounded-lg hover:bg-brand-red-700 transition-colors"
            @click="openAddMemberModal"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="w-4 h-4" />
            Ajouter un membre
          </button>
        </div>

        <!-- Team Members List -->
        <div v-if="teamMembers.length > 0" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Membre
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Poste
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Période
                </th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="member in teamMembers"
                :key="member.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                :class="{ 'opacity-50': !member.active }"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                      <img
                        v-if="member.user?.photo_external_id || getUserInfo(member.user_external_id)?.photo_external_id"
                        :src="`/api/media/${member.user?.photo_external_id || getUserInfo(member.user_external_id)?.photo_external_id}`"
                        :alt="member.user ? `${member.user.first_name} ${member.user.last_name}` : getUserInfo(member.user_external_id)?.name"
                        class="w-full h-full object-cover"
                      />
                      <font-awesome-icon v-else :icon="['fas', 'user']" class="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ member.user ? `${member.user.first_name} ${member.user.last_name}` : getUserInfo(member.user_external_id)?.name || 'Utilisateur inconnu' }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ member.user?.email || getUserInfo(member.user_external_id)?.email || '' }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="text-gray-900 dark:text-white">{{ member.position }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  <span v-if="member.start_date">
                    {{ formatDate(member.start_date) }}
                    <span v-if="member.end_date"> → {{ formatDate(member.end_date) }}</span>
                    <span v-else> → En cours</span>
                  </span>
                  <span v-else>—</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                    :class="member.active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'"
                  >
                    {{ member.active ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Modifier"
                      @click="openEditMemberModal(member)"
                    >
                      <font-awesome-icon :icon="['fas', 'edit']" class="w-4 h-4" />
                    </button>
                    <button
                      class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Supprimer"
                      @click="openDeleteMemberModal(member)"
                    >
                      <font-awesome-icon :icon="['fas', 'trash']" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 py-12 text-center"
        >
          <font-awesome-icon :icon="['fas', 'users']" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p class="text-gray-500 dark:text-gray-400 mb-4">Aucun membre dans l'équipe</p>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-red-600 rounded-lg hover:bg-brand-red-700 transition-colors"
            @click="openAddMemberModal"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="w-4 h-4" />
            Ajouter le premier membre
          </button>
        </div>
      </div>

      <!-- Tab Content: Info (placeholder) -->
      <div v-else-if="activeTab === 'info'" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations du service</h2>
        <div class="grid grid-cols-2 gap-6">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Nom</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ service.name }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ service.email || '—' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ service.phone || '—' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Secteur</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ sectors.find(s => s.id === service.sector_id)?.name || '—' }}</p>
          </div>
          <div class="col-span-2">
            <p class="text-sm text-gray-500 dark:text-gray-400">Description</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ service.description || '—' }}</p>
          </div>
          <div class="col-span-2">
            <p class="text-sm text-gray-500 dark:text-gray-400">Mission</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ service.mission || '—' }}</p>
          </div>
        </div>
      </div>

      <!-- Tab Content: Other tabs (placeholder) -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
        <font-awesome-icon :icon="['fas', 'tools']" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400">Cette section sera bientôt disponible.</p>
        <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Utilisez la page "Objectifs" dans le menu pour gérer les objectifs, réalisations et projets.</p>
      </div>
    </template>

    <!-- Modal Add/Edit Member -->
    <Teleport to="body">
      <div
        v-if="showAddMemberModal || showEditMemberModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ editingMember ? 'Modifier le membre' : 'Ajouter un membre' }}
            </h2>
            <button
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
              @click="closeModals"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
            </button>
          </div>

          <div class="p-4 space-y-4">
            <!-- Utilisateur -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Utilisateur *
              </label>
              <select
                v-model="newMember.user_external_id"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
              >
                <option value="">Sélectionner un utilisateur</option>
                <option v-for="user in userCandidates" :key="user.id" :value="user.id">
                  {{ user.name }} ({{ user.email }})
                </option>
              </select>
            </div>

            <!-- Poste -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Poste / Fonction *
              </label>
              <input
                v-model="newMember.position"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
                placeholder="Ex: Chef de service, Chargé de mission..."
              />
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de début
                </label>
                <input
                  v-model="newMember.start_date"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de fin
                </label>
                <input
                  v-model="newMember.end_date"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Ordre d'affichage -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ordre d'affichage
              </label>
              <input
                v-model.number="newMember.display_order"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
              />
            </div>

            <!-- Actif -->
            <div class="flex items-center gap-3">
              <input
                id="member-active"
                v-model="newMember.active"
                type="checkbox"
                class="w-4 h-4 text-brand-red-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-brand-red-500"
              />
              <label for="member-active" class="text-sm text-gray-700 dark:text-gray-300">
                Membre actif
              </label>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              :disabled="isSaving"
              @click="closeModals"
            >
              Annuler
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-brand-red-600 hover:bg-brand-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!newMember.user_external_id || !newMember.position || isSaving"
              @click="saveMember"
            >
              <span v-if="isSaving">Enregistrement...</span>
              <span v-else>{{ editingMember ? 'Enregistrer' : 'Ajouter' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Delete Member -->
    <Teleport to="body">
      <div
        v-if="showDeleteMemberModal && deletingMember"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
          <div class="p-6 text-center">
            <div class="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Supprimer le membre
            </h3>
            <p class="text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir retirer
              <strong class="text-gray-900 dark:text-white">
                {{ deletingMember.user ? `${deletingMember.user.first_name} ${deletingMember.user.last_name}` : getUserInfo(deletingMember.user_external_id)?.name || 'ce membre' }}
              </strong>
              de l'équipe ?
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              :disabled="isSaving"
              @click="closeModals"
            >
              Annuler
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSaving"
              @click="deleteMemberAction"
            >
              <span v-if="isSaving">Suppression...</span>
              <span v-else>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
