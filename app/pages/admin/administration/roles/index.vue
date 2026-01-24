<script setup lang="ts">
import type {
  RoleWithDetails,
  RoleWithPermissions,
  RoleUser,
  RoleFilters,
  RoleStats,
  PermissionCategoryGroup,
  Permission
} from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const {
  getAllRolesWithDetails,
  getRoleWithPermissions,
  getUsersByRole,
  getPermissionsByCategoryForRole,
  getRoleStats,
  isRoleCodeAvailable,
  validateRoleCode,
  validateRoleName,
  validateHierarchyLevel,
  canDeleteRole,
  canModifyRole,
  duplicateRole,
  hierarchyLevelLabels,
  getHierarchyLevelLabel,
  getHierarchyLevelColor,
  isSystemRole,
  generateRoleId
} = useMockData()

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)
const roles = ref<RoleWithDetails[]>([])
const stats = ref<RoleStats | null>(null)

// Filters
const filters = ref<RoleFilters>({
  search: undefined,
  active: undefined,
  sort_by: 'hierarchy_level',
  sort_order: 'desc'
})

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const showDuplicateModal = ref(false)
const showUsersModal = ref(false)
const editingRole = ref<RoleWithPermissions | null>(null)
const selectedRole = ref<RoleWithDetails | null>(null)
const roleUsers = ref<RoleUser[]>([])
const roleUsersTotal = ref(0)
const roleUsersPage = ref(1)

// Form data
const form = ref({
  code: '',
  name_fr: '',
  description: '',
  hierarchy_level: 50,
  active: true,
  permission_ids: [] as string[]
})

// Duplicate form
const duplicateForm = ref({
  code: '',
  name_fr: ''
})

// Permission categories for the form
const permissionCategories = ref<PermissionCategoryGroup[]>([])

// Form validation errors
const formErrors = ref<Record<string, string>>({})

// === COMPUTED ===
const filteredRoles = computed(() => {
  return getAllRolesWithDetails(filters.value)
})

const hasActiveFilters = computed(() => {
  return !!(filters.value.search || filters.value.active !== undefined)
})

const isEditing = computed(() => !!editingRole.value)

const modalTitle = computed(() => {
  return isEditing.value ? `Modifier le rôle "${editingRole.value?.name_fr}"` : 'Nouveau rôle'
})

const canSubmitForm = computed(() => {
  return form.value.code.trim() !== '' &&
    form.value.name_fr.trim() !== '' &&
    validateRoleCode(form.value.code) &&
    validateRoleName(form.value.name_fr) &&
    validateHierarchyLevel(form.value.hierarchy_level) &&
    Object.keys(formErrors.value).length === 0
})

// === METHODS ===
const loadData = async () => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    roles.value = getAllRolesWithDetails(filters.value)
    stats.value = getRoleStats()
  } finally {
    isLoading.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    search: undefined,
    active: undefined,
    sort_by: 'hierarchy_level',
    sort_order: 'desc'
  }
}

const openCreateModal = () => {
  editingRole.value = null
  form.value = {
    code: '',
    name_fr: '',
    description: '',
    hierarchy_level: 50,
    active: true,
    permission_ids: []
  }
  formErrors.value = {}
  permissionCategories.value = getPermissionsByCategoryForRole()
  showModal.value = true
}

const openEditModal = (role: RoleWithDetails) => {
  const check = canModifyRole(role.id)
  if (!check.canModify) {
    alert(check.warning || 'Ce rôle ne peut pas être modifié')
    return
  }

  const roleWithPerms = getRoleWithPermissions(role.id)
  if (!roleWithPerms) return

  editingRole.value = roleWithPerms
  form.value = {
    code: roleWithPerms.code,
    name_fr: roleWithPerms.name_fr,
    description: roleWithPerms.description || '',
    hierarchy_level: roleWithPerms.hierarchy_level,
    active: roleWithPerms.active,
    permission_ids: [...roleWithPerms.permission_ids]
  }
  formErrors.value = {}
  permissionCategories.value = getPermissionsByCategoryForRole(role.id)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingRole.value = null
}

const validateForm = () => {
  formErrors.value = {}

  if (!validateRoleCode(form.value.code)) {
    formErrors.value.code = 'Le code doit être en snake_case (2-50 caractères, lettres minuscules, chiffres et underscores)'
  } else if (!isRoleCodeAvailable(form.value.code, editingRole.value?.id)) {
    formErrors.value.code = 'Ce code est déjà utilisé'
  }

  if (!validateRoleName(form.value.name_fr)) {
    formErrors.value.name_fr = 'Le nom doit contenir entre 2 et 100 caractères'
  }

  if (!validateHierarchyLevel(form.value.hierarchy_level)) {
    formErrors.value.hierarchy_level = 'Le niveau doit être un entier entre 0 et 100'
  }

  return Object.keys(formErrors.value).length === 0
}

const saveRole = async () => {
  if (!validateForm()) return

  isSaving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    if (isEditing.value) {
      console.log('Mise à jour du rôle:', { id: editingRole.value?.id, ...form.value })
    } else {
      console.log('Création du rôle:', { id: generateRoleId(), ...form.value })
    }

    closeModal()
    await loadData()
  } finally {
    isSaving.value = false
  }
}

const openDeleteModal = (role: RoleWithDetails) => {
  const check = canDeleteRole(role.id)
  if (!check.canDelete) {
    alert(check.reason || 'Ce rôle ne peut pas être supprimé')
    return
  }
  selectedRole.value = role
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!selectedRole.value) return

  isSaving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Suppression du rôle:', selectedRole.value.id)
    showDeleteModal.value = false
    selectedRole.value = null
    await loadData()
  } finally {
    isSaving.value = false
  }
}

const openDuplicateModal = (role: RoleWithDetails) => {
  selectedRole.value = role
  duplicateForm.value = {
    code: `${role.code}_copy`,
    name_fr: `${role.name_fr} (copie)`
  }
  showDuplicateModal.value = true
}

const confirmDuplicate = async () => {
  if (!selectedRole.value) return

  if (!validateRoleCode(duplicateForm.value.code)) {
    alert('Le code doit être en snake_case (lettres minuscules, chiffres et underscores)')
    return
  }

  if (!isRoleCodeAvailable(duplicateForm.value.code)) {
    alert('Ce code est déjà utilisé')
    return
  }

  isSaving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newRole = duplicateRole(selectedRole.value.id, duplicateForm.value.code, duplicateForm.value.name_fr)
    console.log('Duplication du rôle:', newRole)
    showDuplicateModal.value = false
    selectedRole.value = null
    await loadData()
  } finally {
    isSaving.value = false
  }
}

const toggleRoleActive = async (role: RoleWithDetails) => {
  if (role.code === 'super_admin') {
    alert('Le super administrateur ne peut pas être désactivé')
    return
  }

  isSaving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log('Toggle active pour le rôle:', role.id, !role.active)
    await loadData()
  } finally {
    isSaving.value = false
  }
}

const openUsersModal = (role: RoleWithDetails) => {
  selectedRole.value = role
  roleUsersPage.value = 1
  loadRoleUsers()
  showUsersModal.value = true
}

const loadRoleUsers = () => {
  if (!selectedRole.value) return
  const result = getUsersByRole(selectedRole.value.id, roleUsersPage.value, 10)
  roleUsers.value = result.users
  roleUsersTotal.value = result.total
}

const togglePermission = (permissionId: string) => {
  const index = form.value.permission_ids.indexOf(permissionId)
  if (index === -1) {
    form.value.permission_ids.push(permissionId)
  } else {
    form.value.permission_ids.splice(index, 1)
  }
  updateCategoryCounts()
}

const toggleCategory = (category: PermissionCategoryGroup) => {
  const categoryPermIds = category.permissions.map(p => p.id)
  const allSelected = categoryPermIds.every(id => form.value.permission_ids.includes(id))

  if (allSelected) {
    form.value.permission_ids = form.value.permission_ids.filter(id => !categoryPermIds.includes(id))
  } else {
    categoryPermIds.forEach(id => {
      if (!form.value.permission_ids.includes(id)) {
        form.value.permission_ids.push(id)
      }
    })
  }
  updateCategoryCounts()
}

const updateCategoryCounts = () => {
  permissionCategories.value = permissionCategories.value.map(cat => ({
    ...cat,
    selected_count: cat.permissions.filter(p => form.value.permission_ids.includes(p.id)).length
  }))
}

const isCategoryFullySelected = (category: PermissionCategoryGroup) => {
  return category.permissions.every(p => form.value.permission_ids.includes(p.id))
}

const isCategoryPartiallySelected = (category: PermissionCategoryGroup) => {
  const selected = category.permissions.filter(p => form.value.permission_ids.includes(p.id)).length
  return selected > 0 && selected < category.permissions.length
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Watch filters
watch(filters, () => {
  roles.value = getAllRolesWithDetails(filters.value)
}, { deep: true })

// Watch users page
watch(roleUsersPage, () => {
  loadRoleUsers()
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gestion des rôles</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les rôles et leurs permissions
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        @click="openCreateModal"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Nouveau rôle
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <template v-else>
      <!-- Stats Cards -->
      <div v-if="stats" class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <font-awesome-icon :icon="['fas', 'user-shield']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Total rôles</p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
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
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <font-awesome-icon :icon="['fas', 'lock']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.system }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Système</p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <font-awesome-icon :icon="['fas', 'users']" class="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total_users_with_roles }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Utilisateurs</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Search -->
          <div class="flex-1">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Rechercher par nom ou code..."
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Active filter -->
          <div class="w-40">
            <select
              v-model="filters.active"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option :value="undefined">Tous les statuts</option>
              <option :value="true">Actifs</option>
              <option :value="false">Inactifs</option>
            </select>
          </div>

          <!-- Sort -->
          <div class="w-48">
            <select
              v-model="filters.sort_by"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="hierarchy_level">Niveau hiérarchique</option>
              <option value="name_fr">Nom</option>
              <option value="code">Code</option>
              <option value="users_count">Utilisateurs</option>
            </select>
          </div>

          <!-- Sort order -->
          <button
            type="button"
            class="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            @click="filters.sort_order = filters.sort_order === 'asc' ? 'desc' : 'asc'"
          >
            <font-awesome-icon
              :icon="['fas', filters.sort_order === 'asc' ? 'sort-amount-up' : 'sort-amount-down']"
              class="h-4 w-4 text-gray-500 dark:text-gray-400"
            />
          </button>

          <!-- Clear filters -->
          <button
            v-if="hasActiveFilters"
            type="button"
            class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            @click="clearFilters"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Results count -->
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ filteredRoles.length }} rôle{{ filteredRoles.length > 1 ? 's' : '' }}
        </p>
      </div>

      <!-- Roles Table -->
      <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Rôle
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Code
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Niveau
                </th>
                <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Permissions
                </th>
                <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Utilisateurs
                </th>
                <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Statut
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="role in filteredRoles"
                :key="role.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-lg"
                      :class="getHierarchyLevelColor(role.hierarchy_level)"
                    >
                      <font-awesome-icon :icon="['fas', 'user-shield']" class="h-5 w-5" />
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ role.name_fr }}
                        <span
                          v-if="role.is_system"
                          class="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                        >
                          <font-awesome-icon :icon="['fas', 'lock']" class="mr-1 h-2.5 w-2.5" />
                          Système
                        </span>
                      </p>
                      <p v-if="role.description" class="max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                        {{ role.description }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <code class="rounded bg-gray-100 px-2 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {{ role.code }}
                  </code>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="getHierarchyLevelColor(role.hierarchy_level)"
                  >
                    {{ role.hierarchy_level }} - {{ getHierarchyLevelLabel(role.hierarchy_level) }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-center">
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    {{ role.code === 'super_admin' ? 'Toutes' : role.permissions_count }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-center">
                  <button
                    v-if="role.users_count > 0"
                    type="button"
                    class="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    @click="openUsersModal(role)"
                  >
                    <font-awesome-icon :icon="['fas', 'users']" class="h-3 w-3" />
                    {{ role.users_count }}
                  </button>
                  <span v-else class="text-sm text-gray-500 dark:text-gray-400">0</span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-center">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
                    :class="role.active
                      ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'"
                    :disabled="role.code === 'super_admin'"
                    @click="toggleRoleActive(role)"
                  >
                    <font-awesome-icon :icon="['fas', role.active ? 'check-circle' : 'times-circle']" class="h-3 w-3" />
                    {{ role.active ? 'Actif' : 'Inactif' }}
                  </button>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      title="Modifier"
                      :disabled="role.code === 'super_admin'"
                      @click="openEditModal(role)"
                    >
                      <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      title="Dupliquer"
                      @click="openDuplicateModal(role)"
                    >
                      <font-awesome-icon :icon="['fas', 'copy']" class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-2 text-gray-500 hover:bg-red-100 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                      title="Supprimer"
                      :disabled="role.is_system || role.users_count > 0"
                      @click="openDeleteModal(role)"
                    >
                      <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredRoles.length === 0">
                <td colspan="7" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  <font-awesome-icon :icon="['fas', 'inbox']" class="mb-2 h-8 w-8" />
                  <p>Aucun rôle trouvé</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        @click.self="closeModal"
      >
        <div class="w-full max-w-4xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ modalTitle }}
            </h3>
            <button
              type="button"
              class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              @click="closeModal"
            >
              <font-awesome-icon :icon="['fas', 'xmark']" class="h-5 w-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="max-h-[70vh] overflow-y-auto p-4">
            <!-- Warning for system roles -->
            <div
              v-if="isEditing && editingRole?.is_system"
              class="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20"
            >
              <div class="flex items-start gap-3">
                <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p class="font-medium text-yellow-800 dark:text-yellow-200">Rôle système</p>
                  <p class="text-sm text-yellow-700 dark:text-yellow-300">
                    Ce rôle est utilisé par le système. Toute modification affectera tous les utilisateurs ayant ce rôle.
                  </p>
                </div>
              </div>
            </div>

            <div class="grid gap-6 lg:grid-cols-2">
              <!-- Left column: Basic info -->
              <div class="space-y-4">
                <h4 class="font-medium text-gray-900 dark:text-white">Informations générales</h4>

                <!-- Code -->
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Code <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.code"
                    type="text"
                    placeholder="ex: content_manager"
                    class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="formErrors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
                    :disabled="isEditing && editingRole?.is_system"
                    @blur="validateForm"
                  />
                  <p v-if="formErrors.code" class="mt-1 text-sm text-red-500">{{ formErrors.code }}</p>
                  <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Format snake_case (lettres minuscules, chiffres, underscores)
                  </p>
                </div>

                <!-- Name -->
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nom français <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.name_fr"
                    type="text"
                    placeholder="ex: Gestionnaire de contenus"
                    class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="formErrors.name_fr ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
                    @blur="validateForm"
                  />
                  <p v-if="formErrors.name_fr" class="mt-1 text-sm text-red-500">{{ formErrors.name_fr }}</p>
                </div>

                <!-- Description -->
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    v-model="form.description"
                    rows="3"
                    placeholder="Description du rôle..."
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <!-- Hierarchy level -->
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Niveau hiérarchique <span class="text-red-500">*</span>
                  </label>
                  <div class="flex items-center gap-4">
                    <input
                      v-model.number="form.hierarchy_level"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      class="flex-1"
                      @input="validateForm"
                    />
                    <span
                      class="inline-flex min-w-[80px] items-center justify-center rounded-full px-3 py-1 text-sm font-medium"
                      :class="getHierarchyLevelColor(form.hierarchy_level)"
                    >
                      {{ form.hierarchy_level }}
                    </span>
                  </div>
                  <p v-if="formErrors.hierarchy_level" class="mt-1 text-sm text-red-500">{{ formErrors.hierarchy_level }}</p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Plus le niveau est élevé, plus le rôle a de privilèges (0-100)
                  </p>
                </div>

                <!-- Active -->
                <div class="flex items-center gap-3">
                  <input
                    id="role-active"
                    v-model="form.active"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label for="role-active" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rôle actif
                  </label>
                </div>
              </div>

              <!-- Right column: Permissions -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h4 class="font-medium text-gray-900 dark:text-white">Permissions</h4>
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    {{ form.permission_ids.length }} sélectionnée{{ form.permission_ids.length > 1 ? 's' : '' }}
                  </span>
                </div>

                <div class="max-h-[400px] space-y-3 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <div
                    v-for="category in permissionCategories"
                    :key="category.code"
                    class="rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <!-- Category header -->
                    <button
                      type="button"
                      class="flex w-full items-center justify-between rounded-t-lg bg-gray-50 px-3 py-2 text-left hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                      @click="toggleCategory(category)"
                    >
                      <div class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          :checked="isCategoryFullySelected(category)"
                          :indeterminate="isCategoryPartiallySelected(category)"
                          class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                          @click.stop
                          @change="toggleCategory(category)"
                        />
                        <span class="font-medium text-gray-900 dark:text-white">{{ category.name }}</span>
                      </div>
                      <span class="text-sm text-gray-500 dark:text-gray-400">
                        {{ category.selected_count }}/{{ category.total_count }}
                      </span>
                    </button>

                    <!-- Category permissions -->
                    <div class="divide-y divide-gray-100 dark:divide-gray-700">
                      <label
                        v-for="permission in category.permissions"
                        :key="permission.id"
                        class="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                      >
                        <input
                          type="checkbox"
                          :checked="form.permission_ids.includes(permission.id)"
                          class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                          @change="togglePermission(permission.id)"
                        />
                        <div class="flex-1">
                          <p class="text-sm text-gray-900 dark:text-white">{{ permission.name_fr }}</p>
                          <p v-if="permission.description" class="text-xs text-gray-500 dark:text-gray-400">
                            {{ permission.description }}
                          </p>
                        </div>
                        <code class="text-xs text-gray-400">{{ permission.code }}</code>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              :disabled="!canSubmitForm || isSaving"
              @click="saveRole"
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
        v-if="showDeleteModal && selectedRole"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        @click.self="showDeleteModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="p-6 text-center">
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer le rôle
            </h3>
            <p class="mb-6 text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer le rôle <strong>{{ selectedRole.name_fr }}</strong> ?
              Cette action est irréversible.
            </p>
            <div class="flex justify-center gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="showDeleteModal = false"
              >
                Annuler
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                :disabled="isSaving"
                @click="confirmDelete"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Duplicate Modal -->
    <Teleport to="body">
      <div
        v-if="showDuplicateModal && selectedRole"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        @click.self="showDuplicateModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Dupliquer le rôle "{{ selectedRole.name_fr }}"
            </h3>
          </div>
          <div class="space-y-4 p-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code du nouveau rôle
              </label>
              <input
                v-model="duplicateForm.code"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom du nouveau rôle
              </label>
              <input
                v-model="duplicateForm.name_fr"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Le nouveau rôle sera créé avec les mêmes permissions et sera désactivé par défaut.
            </p>
          </div>
          <div class="flex justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDuplicateModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              :disabled="isSaving"
              @click="confirmDuplicate"
            >
              <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
              <font-awesome-icon v-else :icon="['fas', 'copy']" class="h-4 w-4" />
              Dupliquer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Users Modal -->
    <Teleport to="body">
      <div
        v-if="showUsersModal && selectedRole"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        @click.self="showUsersModal = false"
      >
        <div class="w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="border-b border-gray-200 p-4 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Utilisateurs du rôle "{{ selectedRole.name_fr }}"
              </h3>
              <button
                type="button"
                class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                @click="showUsersModal = false"
              >
                <font-awesome-icon :icon="['fas', 'xmark']" class="h-5 w-5" />
              </button>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ roleUsersTotal }} utilisateur{{ roleUsersTotal > 1 ? 's' : '' }} avec ce rôle
            </p>
          </div>
          <div class="max-h-[50vh] overflow-y-auto p-4">
            <div class="space-y-3">
              <div
                v-for="user in roleUsers"
                :key="user.id"
                class="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <font-awesome-icon :icon="['fas', 'user']" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900 dark:text-white">{{ user.full_name }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                </div>
                <div class="text-right text-xs text-gray-500 dark:text-gray-400">
                  Assigné le<br />{{ formatDate(user.assigned_at) }}
                </div>
              </div>
              <p v-if="roleUsers.length === 0" class="text-center text-gray-500 dark:text-gray-400">
                Aucun utilisateur avec ce rôle
              </p>
            </div>
          </div>
          <div
            v-if="roleUsersTotal > 10"
            class="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-700"
          >
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              :disabled="roleUsersPage === 1"
              @click="roleUsersPage--"
            >
              Précédent
            </button>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              Page {{ roleUsersPage }} / {{ Math.ceil(roleUsersTotal / 10) }}
            </span>
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              :disabled="roleUsersPage >= Math.ceil(roleUsersTotal / 10)"
              @click="roleUsersPage++"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
