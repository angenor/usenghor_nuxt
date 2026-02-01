<script setup lang="ts">
import type {
  UserWithRoles,
  UserRead,
  UserSalutation,
  UserCreatePayload,
  UserUpdatePayload,
  RoleRead,
} from '~/composables/useUsersApi'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
})

const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser: deleteUserApi,
  toggleUserActive: toggleUserActiveApi,
  updateUserRoles,
  resetUserPassword,
  verifyUserEmail,
  bulkAction,
  getFullName,
  formatLastLogin,
  getRoleColor,
  validateEmail,
  validatePassword,
  canDeleteUser,
  canDeactivateUser,
  computeStats,
  salutationLabels,
  salutationOptions,
  userStatusColors,
  verificationColors,
} = useUsersApi()

const {
  getRolesForSelect,
} = useRolesApi()

// === STATE ===
const isLoading = ref(true)
const users = ref<UserWithRoles[]>([])
const roles = ref<RoleRead[]>([])
const selectedUser = ref<UserWithRoles | null>(null)
const showDetailModal = ref(false)
const showCreateModal = ref(false)
const showFilters = ref(false)
const showStatistics = ref(false)
const showDeleteConfirm = ref(false)
const userToDelete = ref<UserWithRoles | null>(null)
const showPasswordModal = ref(false)
const temporaryPassword = ref('')

// Pagination (serveur)
const currentPage = ref(1)
const itemsPerPage = ref(20)
const totalItems = ref(0)
const totalPages = ref(1)

// Filters
const filters = ref({
  search: '' as string,
  role_id: '' as string,
  active: undefined as boolean | undefined,
  sort_by: 'last_name' as string,
  sort_order: 'asc' as string,
})

// Role options (loaded from API)
const roleOptions = ref<Array<{ id: string; code: string; name_fr: string }>>([])

// Form for create/edit
const isEditing = ref(false)
const isSaving = ref(false)
const formErrors = ref<Record<string, string>>({})

const defaultFormData = {
  email: '',
  password: '',
  salutation: null as UserSalutation | null,
  last_name: '',
  first_name: '',
  birth_date: '',
  phone: '',
  phone_whatsapp: '',
  linkedin: '',
  city: '',
  address: '',
  role_ids: [] as string[],
  active: true,
}

const formData = ref({ ...defaultFormData })
const editingUserId = ref<string | null>(null)

// Selected items for bulk actions
const selectedUserIds = ref<string[]>([])

// === COMPUTED ===
const statistics = computed(() => computeStats(users.value, roles.value))

const hasActiveFilters = computed(() => {
  return !!(
    filters.value.search
    || filters.value.role_id
    || filters.value.active !== undefined
  )
})

const allSelected = computed(() => {
  return users.value.length > 0 && users.value.every(u => selectedUserIds.value.includes(u.id))
})

const someSelected = computed(() => {
  return selectedUserIds.value.length > 0 && !allSelected.value
})

// === METHODS ===
const loadData = async () => {
  isLoading.value = true
  try {
    // Charger les rôles pour le filtre
    const rolesData = await getRolesForSelect()
    roleOptions.value = rolesData.map(r => ({ id: r.id, code: r.code, name_fr: r.name_fr }))
    roles.value = rolesData as unknown as RoleRead[]

    // Charger les utilisateurs avec pagination serveur
    const response = await listUsers({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: filters.value.search || undefined,
      active: filters.value.active,
      role_id: filters.value.role_id || undefined,
    })

    // Récupérer les détails avec rôles pour chaque utilisateur
    const usersWithRoles: UserWithRoles[] = []
    for (const user of response.items) {
      try {
        const userWithRoles = await getUserById(user.id)
        usersWithRoles.push(userWithRoles)
      }
      catch {
        // Si erreur, utiliser les données de base
        usersWithRoles.push({ ...user, roles: [] } as UserWithRoles)
      }
    }

    users.value = usersWithRoles
    totalItems.value = response.total
    totalPages.value = response.pages
  }
  catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
  finally {
    isLoading.value = false
  }
}

const viewUserDetail = async (user: UserWithRoles) => {
  try {
    selectedUser.value = await getUserById(user.id)
    showDetailModal.value = true
  }
  catch {
    selectedUser.value = user
    showDetailModal.value = true
  }
}

const openCreateModal = () => {
  isEditing.value = false
  editingUserId.value = null
  formData.value = { ...defaultFormData }
  formErrors.value = {}
  showCreateModal.value = true
}

const openEditModal = (user: UserWithRoles) => {
  isEditing.value = true
  editingUserId.value = user.id
  formData.value = {
    email: user.email,
    password: '',
    salutation: user.salutation,
    last_name: user.last_name,
    first_name: user.first_name,
    birth_date: user.birth_date || '',
    phone: user.phone || '',
    phone_whatsapp: user.phone_whatsapp || '',
    linkedin: user.linkedin || '',
    city: user.city || '',
    address: user.address || '',
    role_ids: user.roles.map(r => r.id),
    active: user.active,
  }
  selectedUser.value = user
  formErrors.value = {}
  showCreateModal.value = true
}

const validateForm = (): boolean => {
  formErrors.value = {}

  if (!formData.value.email) {
    formErrors.value.email = 'L\'email est requis'
  }
  else if (!validateEmail(formData.value.email)) {
    formErrors.value.email = 'Format d\'email invalide'
  }

  if (!isEditing.value && !formData.value.password) {
    formErrors.value.password = 'Le mot de passe est requis'
  }
  else if (formData.value.password) {
    const passwordValidation = validatePassword(formData.value.password)
    if (!passwordValidation.valid) {
      formErrors.value.password = passwordValidation.errors[0]
    }
  }

  if (!formData.value.last_name) {
    formErrors.value.last_name = 'Le nom est requis'
  }

  if (!formData.value.first_name) {
    formErrors.value.first_name = 'Le prénom est requis'
  }

  if (formData.value.role_ids.length === 0) {
    formErrors.value.role_ids = 'Au moins un rôle est requis'
  }

  return Object.keys(formErrors.value).length === 0
}

const saveUser = async () => {
  if (!validateForm()) return

  isSaving.value = true
  try {
    if (isEditing.value && editingUserId.value) {
      // Mise à jour
      const updateData: UserUpdatePayload = {
        email: formData.value.email,
        last_name: formData.value.last_name,
        first_name: formData.value.first_name,
        salutation: formData.value.salutation,
        birth_date: formData.value.birth_date || null,
        phone: formData.value.phone || null,
        phone_whatsapp: formData.value.phone_whatsapp || null,
        linkedin: formData.value.linkedin || null,
        city: formData.value.city || null,
        address: formData.value.address || null,
        active: formData.value.active,
      }
      await updateUser(editingUserId.value, updateData)

      // Mettre à jour les rôles
      await updateUserRoles(editingUserId.value, formData.value.role_ids)
    }
    else {
      // Création
      const createData: UserCreatePayload = {
        email: formData.value.email,
        password: formData.value.password,
        last_name: formData.value.last_name,
        first_name: formData.value.first_name,
        salutation: formData.value.salutation,
        birth_date: formData.value.birth_date || null,
        phone: formData.value.phone || null,
        phone_whatsapp: formData.value.phone_whatsapp || null,
        linkedin: formData.value.linkedin || null,
        city: formData.value.city || null,
        address: formData.value.address || null,
      }
      const result = await createUser(createData)

      // Assigner les rôles
      if (formData.value.role_ids.length > 0) {
        await updateUserRoles(result.id, formData.value.role_ids)
      }
    }

    showCreateModal.value = false
    loadData()
  }
  catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    formErrors.value.general = 'Une erreur est survenue lors de la sauvegarde'
  }
  finally {
    isSaving.value = false
  }
}

const confirmDelete = (user: UserWithRoles) => {
  const canDelete = canDeleteUser(user)
  if (!canDelete.canDelete) {
    alert(canDelete.reason)
    return
  }
  userToDelete.value = user
  showDeleteConfirm.value = true
}

const handleDeleteUser = async () => {
  if (!userToDelete.value) return

  isSaving.value = true
  try {
    await deleteUserApi(userToDelete.value.id)
    showDeleteConfirm.value = false
    userToDelete.value = null
    loadData()
  }
  catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
  finally {
    isSaving.value = false
  }
}

const toggleUserActive = async (user: UserWithRoles) => {
  if (user.active) {
    const canDeactivate = canDeactivateUser(user)
    if (!canDeactivate.canDeactivate) {
      alert(canDeactivate.reason)
      return
    }
  }

  try {
    await toggleUserActiveApi(user.id)
    loadData()
  }
  catch (error) {
    console.error('Erreur lors du changement de statut:', error)
  }
}

const handleResetPassword = async (user: UserWithRoles) => {
  try {
    const result = await resetUserPassword(user.id)
    temporaryPassword.value = result.temporary_password
    showPasswordModal.value = true
  }
  catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)
  }
}

const handleVerifyEmail = async (user: UserWithRoles) => {
  try {
    await verifyUserEmail(user.id)
    loadData()
  }
  catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error)
  }
}

const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
  if (selectedUserIds.value.length === 0) return

  const confirmMessage = action === 'delete'
    ? `Êtes-vous sûr de vouloir supprimer ${selectedUserIds.value.length} utilisateur(s) ?`
    : `Êtes-vous sûr de vouloir ${action === 'activate' ? 'activer' : 'désactiver'} ${selectedUserIds.value.length} utilisateur(s) ?`

  if (!confirm(confirmMessage)) return

  try {
    await bulkAction({
      user_ids: selectedUserIds.value,
      action,
    })
    selectedUserIds.value = []
    loadData()
  }
  catch (error) {
    console.error('Erreur lors de l\'action en masse:', error)
  }
}

const clearFilters = () => {
  filters.value = {
    search: '',
    role_id: '',
    active: undefined,
    sort_by: 'last_name',
    sort_order: 'asc',
  }
  currentPage.value = 1
  loadData()
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadData()
  }
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedUserIds.value = []
  }
  else {
    selectedUserIds.value = users.value.map(u => u.id)
  }
}

const toggleUserSelection = (userId: string) => {
  const index = selectedUserIds.value.indexOf(userId)
  if (index === -1) {
    selectedUserIds.value.push(userId)
  }
  else {
    selectedUserIds.value.splice(index, 1)
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const copyPassword = () => {
  navigator.clipboard.writeText(temporaryPassword.value)
}

// Watch filters to reload (avec debounce pour la recherche)
const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1
  loadData()
}, 300)

watch(() => filters.value.search, () => {
  debouncedSearch()
})

watch([() => filters.value.role_id, () => filters.value.active], () => {
  currentPage.value = 1
  loadData()
})

// Load data on mount
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Utilisateurs
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestion des comptes utilisateurs et de leurs accès
        </p>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="showStatistics = !showStatistics"
        >
          <font-awesome-icon :icon="['fas', 'chart-bar']" class="h-4 w-4" />
          Statistiques
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="showFilters = !showFilters"
        >
          <font-awesome-icon :icon="['fas', 'filter']" class="h-4 w-4" />
          Filtres
          <span
            v-if="hasActiveFilters"
            class="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs text-white"
          >
            !
          </span>
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          @click="openCreateModal"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
          Nouvel utilisateur
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <template v-else>
      <!-- Statistics Panel -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="showStatistics" class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Statistiques
          </h3>

          <!-- Stats Cards -->
          <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ statistics.total }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Total
              </p>
            </div>
            <div class="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ statistics.active }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Actifs
              </p>
            </div>
            <div class="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <p class="text-2xl font-bold text-red-600 dark:text-red-400">
                {{ statistics.inactive }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Inactifs
              </p>
            </div>
            <div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ statistics.email_verified }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Emails vérifiés
              </p>
            </div>
            <div class="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {{ statistics.last_registrations }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Inscrits (30j)
              </p>
            </div>
            <div class="rounded-lg bg-teal-50 p-4 dark:bg-teal-900/20">
              <p class="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {{ statistics.last_logins }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Connectés (7j)
              </p>
            </div>
          </div>

          <!-- By Role -->
          <div>
            <h4 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Par rôle
            </h4>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="item in statistics.by_role"
                :key="item.role_id"
                class="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50"
              >
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.role_name }}</span>
                <span class="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-900 dark:bg-gray-600 dark:text-white">
                  {{ item.count }}
                </span>
              </div>
              <p v-if="statistics.by_role.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
                Aucune donnée
              </p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Filters Panel -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="showFilters" class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Filtres
            </h3>
            <button
              v-if="hasActiveFilters"
              type="button"
              class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              @click="clearFilters"
            >
              Réinitialiser
            </button>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Search -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Recherche</label>
              <input
                v-model="filters.search"
                type="text"
                placeholder="Nom, prénom, email..."
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Role -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
              <select
                v-model="filters.role_id"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">
                  Tous les rôles
                </option>
                <option v-for="role in roleOptions" :key="role.id" :value="role.id">
                  {{ role.name_fr }}
                </option>
              </select>
            </div>

            <!-- Status -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
              <select
                v-model="filters.active"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option :value="undefined">
                  Tous
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
      </Transition>

      <!-- Results count & bulk actions -->
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ totalItems }} utilisateur{{ totalItems > 1 ? 's' : '' }}
          <span v-if="selectedUserIds.length > 0" class="ml-2 font-medium text-primary-600 dark:text-primary-400">
            ({{ selectedUserIds.length }} sélectionné{{ selectedUserIds.length > 1 ? 's' : '' }})
          </span>
        </p>
        <div v-if="selectedUserIds.length > 0" class="flex gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="handleBulkAction('activate')"
          >
            <font-awesome-icon :icon="['fas', 'check']" class="h-3 w-3" />
            Activer
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="handleBulkAction('deactivate')"
          >
            <font-awesome-icon :icon="['fas', 'ban']" class="h-3 w-3" />
            Désactiver
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-600 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/20"
            @click="handleBulkAction('delete')"
          >
            <font-awesome-icon :icon="['fas', 'trash']" class="h-3 w-3" />
            Supprimer
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="selectedUserIds = []"
          >
            Désélectionner
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    :checked="allSelected"
                    :indeterminate="someSelected"
                    class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                    @change="toggleSelectAll"
                  />
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Utilisateur
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Rôles
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Statut
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Dernière connexion
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="user in users"
                :key="user.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                :class="{ 'bg-primary-50 dark:bg-primary-900/10': selectedUserIds.includes(user.id) }"
              >
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedUserIds.includes(user.id)"
                    class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                    @change="toggleUserSelection(user.id)"
                  />
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="relative h-10 w-10 flex-shrink-0">
                      <div
                        class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      >
                        <font-awesome-icon :icon="['fas', 'user']" class="h-5 w-5" />
                      </div>
                      <!-- Online indicator -->
                      <span
                        v-if="user.active && user.last_login_at && new Date(user.last_login_at) > new Date(Date.now() - 15 * 60 * 1000)"
                        class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-400 dark:border-gray-800"
                      />
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ getFullName(user) }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ user.email }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="role in user.roles"
                      :key="role.id"
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="getRoleColor(role.code)"
                    >
                      {{ role.name_fr }}
                    </span>
                    <span
                      v-if="user.roles.length === 0"
                      class="text-sm text-gray-400 dark:text-gray-500"
                    >
                      Aucun rôle
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-col gap-1">
                    <span
                      class="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="user.active ? userStatusColors.active : userStatusColors.inactive"
                    >
                      {{ user.active ? 'Actif' : 'Inactif' }}
                    </span>
                    <span
                      class="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="user.email_verified ? verificationColors.verified : verificationColors.not_verified"
                    >
                      <font-awesome-icon
                        :icon="['fas', user.email_verified ? 'check-circle' : 'exclamation-circle']"
                        class="mr-1 h-3 w-3"
                      />
                      {{ user.email_verified ? 'Vérifié' : 'Non vérifié' }}
                    </span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {{ formatLastLogin(user.last_login_at) }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      title="Voir le détail"
                      @click="viewUserDetail(user)"
                    >
                      <font-awesome-icon :icon="['fas', 'eye']" class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      title="Modifier"
                      @click="openEditModal(user)"
                    >
                      <font-awesome-icon :icon="['fas', 'pen']" class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      :title="user.active ? 'Désactiver' : 'Activer'"
                      @click="toggleUserActive(user)"
                    >
                      <font-awesome-icon :icon="['fas', user.active ? 'toggle-on' : 'toggle-off']" class="h-4 w-4" />
                    </button>
                    <button
                      v-if="!user.email_verified"
                      type="button"
                      class="rounded-lg p-2 text-blue-500 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/20"
                      title="Marquer email vérifié"
                      @click="handleVerifyEmail(user)"
                    >
                      <font-awesome-icon :icon="['fas', 'envelope-circle-check']" class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-2 text-orange-500 hover:bg-orange-100 hover:text-orange-700 dark:hover:bg-orange-900/20"
                      title="Réinitialiser mot de passe"
                      @click="handleResetPassword(user)"
                    >
                      <font-awesome-icon :icon="['fas', 'key']" class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-2 text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20"
                      title="Supprimer"
                      @click="confirmDelete(user)"
                    >
                      <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  <font-awesome-icon :icon="['fas', 'users']" class="mb-2 h-8 w-8" />
                  <p>Aucun utilisateur trouvé</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700/50"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              Page {{ currentPage }} sur {{ totalPages }}
            </span>
          </div>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
              :disabled="currentPage === 1"
              @click="goToPage(1)"
            >
              <font-awesome-icon :icon="['fas', 'angles-left']" class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <font-awesome-icon :icon="['fas', 'angle-left']" class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <font-awesome-icon :icon="['fas', 'angle-right']" class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
              :disabled="currentPage === totalPages"
              @click="goToPage(totalPages)"
            >
              <font-awesome-icon :icon="['fas', 'angles-right']" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showDetailModal && selectedUser"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        @click.self="showDetailModal = false"
      >
        <div class="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <div class="relative h-12 w-12">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                >
                  <font-awesome-icon :icon="['fas', 'user']" class="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ getFullName(selectedUser) }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ selectedUser.email }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              @click="showDetailModal = false"
            >
              <font-awesome-icon :icon="['fas', 'xmark']" class="h-5 w-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="max-h-[60vh] overflow-y-auto p-4">
            <!-- Status badges -->
            <div class="mb-6 flex flex-wrap gap-2">
              <span
                class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                :class="selectedUser.active ? userStatusColors.active : userStatusColors.inactive"
              >
                {{ selectedUser.active ? 'Actif' : 'Inactif' }}
              </span>
              <span
                class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                :class="selectedUser.email_verified ? verificationColors.verified : verificationColors.not_verified"
              >
                <font-awesome-icon
                  :icon="['fas', selectedUser.email_verified ? 'check-circle' : 'exclamation-circle']"
                  class="mr-1.5 h-4 w-4"
                />
                {{ selectedUser.email_verified ? 'Email vérifié' : 'Email non vérifié' }}
              </span>
            </div>

            <!-- Roles -->
            <div class="mb-6">
              <h4 class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Rôles
              </h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="role in selectedUser.roles"
                  :key="role.id"
                  class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                  :class="getRoleColor(role.code)"
                >
                  {{ role.name_fr }}
                </span>
                <span
                  v-if="selectedUser.roles.length === 0"
                  class="text-sm text-gray-400 dark:text-gray-500"
                >
                  Aucun rôle assigné
                </span>
              </div>
            </div>

            <!-- Info Grid -->
            <div class="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Téléphone
                </p>
                <p class="text-gray-900 dark:text-white">
                  {{ selectedUser.phone || '-' }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  WhatsApp
                </p>
                <p class="text-gray-900 dark:text-white">
                  {{ selectedUser.phone_whatsapp || '-' }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ville
                </p>
                <p class="text-gray-900 dark:text-white">
                  {{ selectedUser.city || '-' }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Date de naissance
                </p>
                <p class="text-gray-900 dark:text-white">
                  {{ formatDate(selectedUser.birth_date) }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  LinkedIn
                </p>
                <p class="text-gray-900 dark:text-white">
                  <a
                    v-if="selectedUser.linkedin"
                    :href="selectedUser.linkedin"
                    target="_blank"
                    class="text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Profil LinkedIn
                  </a>
                  <span v-else>-</span>
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Dernière connexion
                </p>
                <p class="text-gray-900 dark:text-white">
                  {{ formatLastLogin(selectedUser.last_login_at) }}
                </p>
              </div>
            </div>

            <!-- Address -->
            <div v-if="selectedUser.address" class="mb-6">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Adresse
              </p>
              <p class="text-gray-900 dark:text-white">
                {{ selectedUser.address }}
              </p>
            </div>

            <!-- Dates -->
            <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Créé le
                  </p>
                  <p class="text-gray-900 dark:text-white">
                    {{ formatDateTime(selectedUser.created_at) }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Modifié le
                  </p>
                  <p class="text-gray-900 dark:text-white">
                    {{ formatDateTime(selectedUser.updated_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDetailModal = false"
            >
              Fermer
            </button>
            <button
              type="button"
              class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              @click="showDetailModal = false; openEditModal(selectedUser)"
            >
              Modifier
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        @click.self="showCreateModal = false"
      >
        <div class="w-full max-w-3xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}
            </h3>
            <button
              type="button"
              class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              @click="showCreateModal = false"
            >
              <font-awesome-icon :icon="['fas', 'xmark']" class="h-5 w-5" />
            </button>
          </div>

          <!-- Body -->
          <form class="admin-scrollbar max-h-[60vh] overflow-y-auto p-4" @submit.prevent="saveUser" data-lenis-prevent>
            <!-- General error -->
            <div v-if="formErrors.general" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {{ formErrors.general }}
            </div>

            <!-- Identification -->
            <div class="mb-6">
              <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Identification
              </h4>
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.email"
                    type="email"
                    class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
                  />
                  <p v-if="formErrors.email" class="mt-1 text-sm text-red-500">
                    {{ formErrors.email }}
                  </p>
                </div>
                <div :class="isEditing ? 'sm:col-span-2' : ''">
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mot de passe <span v-if="!isEditing" class="text-red-500">*</span>
                    <span v-if="isEditing" class="text-gray-400">(laisser vide pour ne pas changer)</span>
                  </label>
                  <input
                    v-model="formData.password"
                    type="password"
                    class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="formErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
                  />
                  <p v-if="formErrors.password" class="mt-1 text-sm text-red-500">
                    {{ formErrors.password }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Personal info -->
            <div class="mb-6">
              <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Informations personnelles
              </h4>
              <div class="grid gap-4 sm:grid-cols-3">
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Civilité</label>
                  <select
                    v-model="formData.salutation"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option :value="null">
                      -
                    </option>
                    <option v-for="option in salutationOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nom <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.last_name"
                    type="text"
                    class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="formErrors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
                  />
                  <p v-if="formErrors.last_name" class="mt-1 text-sm text-red-500">
                    {{ formErrors.last_name }}
                  </p>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prénom <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.first_name"
                    type="text"
                    class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="formErrors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
                  />
                  <p v-if="formErrors.first_name" class="mt-1 text-sm text-red-500">
                    {{ formErrors.first_name }}
                  </p>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date de naissance</label>
                  <input
                    v-model="formData.birth_date"
                    type="date"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <!-- Contact -->
            <div class="mb-6">
              <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Coordonnées
              </h4>
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                  <input
                    v-model="formData.phone"
                    type="tel"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</label>
                  <input
                    v-model="formData.phone_whatsapp"
                    type="tel"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Ville</label>
                  <input
                    v-model="formData.city"
                    type="text"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</label>
                  <input
                    v-model="formData.linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div class="sm:col-span-2">
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
                  <textarea
                    v-model="formData.address"
                    rows="2"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <!-- Roles & Access -->
            <div class="mb-6">
              <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Rôles et accès
              </h4>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rôles <span class="text-red-500">*</span>
                </label>
                <div class="space-y-2 rounded-lg border p-3" :class="formErrors.role_ids ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'">
                  <label
                    v-for="role in roleOptions"
                    :key="role.id"
                    class="flex items-center gap-2"
                  >
                    <input
                      v-model="formData.role_ids"
                      type="checkbox"
                      :value="role.id"
                      class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="getRoleColor(role.code)"
                    >
                      {{ role.name_fr }}
                    </span>
                  </label>
                </div>
                <p v-if="formErrors.role_ids" class="mt-1 text-sm text-red-500">
                  {{ formErrors.role_ids }}
                </p>
              </div>
            </div>

            <!-- Options -->
            <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <label class="flex items-center gap-2">
                <input
                  v-model="formData.active"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">Compte actif</span>
              </label>
            </div>
          </form>

          <!-- Footer -->
          <div class="flex justify-end gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showCreateModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              :disabled="isSaving"
              @click="saveUser"
            >
              <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
              {{ isEditing ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteConfirm && userToDelete"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        @click.self="showDeleteConfirm = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="p-6">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer l'utilisateur
            </h3>
            <p class="text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer <strong class="text-gray-900 dark:text-white">{{ getFullName(userToDelete) }}</strong> ?
              Cette action est irréversible.
            </p>
          </div>
          <div class="flex justify-end gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDeleteConfirm = false"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              :disabled="isSaving"
              @click="handleDeleteUser"
            >
              <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Password Reset Modal -->
    <Teleport to="body">
      <div
        v-if="showPasswordModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        @click.self="showPasswordModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="p-6">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <font-awesome-icon :icon="['fas', 'key']" class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Mot de passe réinitialisé
            </h3>
            <p class="mb-4 text-gray-500 dark:text-gray-400">
              Le nouveau mot de passe temporaire est :
            </p>
            <div class="flex items-center gap-2 rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
              <code class="flex-1 font-mono text-lg text-gray-900 dark:text-white">{{ temporaryPassword }}</code>
              <button
                type="button"
                class="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"
                title="Copier"
                @click="copyPassword"
              >
                <font-awesome-icon :icon="['fas', 'copy']" class="h-4 w-4" />
              </button>
            </div>
            <p class="mt-4 text-sm text-amber-600 dark:text-amber-400">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="mr-1" />
              L'utilisateur devra changer ce mot de passe à sa prochaine connexion.
            </p>
          </div>
          <div class="flex justify-end border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              type="button"
              class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              @click="showPasswordModal = false"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
