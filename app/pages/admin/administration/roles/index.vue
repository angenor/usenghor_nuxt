<script setup lang="ts">
import {
  useAdminRolesApi,
  getHierarchyLevelLabel,
  getHierarchyLevelColor,
  isSystemRole,
  type RoleWithDetails,
  type RoleWithPermissions,
  type RoleUser,
  type RoleFilters,
  type RoleStats,
  type PermissionCategoryGroup,
} from '~/composables/useAdminRolesApi'
import { useAdminPermissionsApi, type Permission } from '~/composables/useAdminPermissionsApi'

definePageMeta({
  layout: 'admin'
})

// Composables
const {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  duplicateRole,
  toggleRoleActive,
  updateRolePermissions,
  getRoleUsers,
  enrichRolesWithDetails,
  calculateStats,
  groupPermissionsByCategory,
  validateRoleCode,
  validateRoleName,
  validateHierarchyLevel,
  isCodeAvailable,
  canDeleteRole,
  canModifyRole,
} = useAdminRolesApi()

const { getAllPermissions } = useAdminPermissionsApi()

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)
const roles = ref<RoleWithDetails[]>([])
const allPermissions = ref<Permission[]>([])
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
  let result = [...roles.value]

  // Filter by search
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(r =>
      r.code.toLowerCase().includes(search) ||
      r.name_fr.toLowerCase().includes(search)
    )
  }

  // Filter by active status
  if (filters.value.active !== undefined) {
    result = result.filter(r => r.active === filters.value.active)
  }

  // Sort
  if (filters.value.sort_by) {
    result.sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      switch (filters.value.sort_by) {
        case 'hierarchy_level':
          aVal = a.hierarchy_level
          bVal = b.hierarchy_level
          break
        case 'name_fr':
          aVal = a.name_fr.toLowerCase()
          bVal = b.name_fr.toLowerCase()
          break
        case 'code':
          aVal = a.code.toLowerCase()
          bVal = b.code.toLowerCase()
          break
        case 'users_count':
          aVal = a.users_count
          bVal = b.users_count
          break
        default:
          return 0
      }

      if (aVal < bVal) return filters.value.sort_order === 'asc' ? -1 : 1
      if (aVal > bVal) return filters.value.sort_order === 'asc' ? 1 : -1
      return 0
    })
  }

  return result
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
    // Charger les rôles et les permissions en parallèle
    const [rolesResponse, permsData] = await Promise.all([
      getAllRoles(),
      getAllPermissions(),
    ])

    allPermissions.value = permsData

    // Enrichir les rôles avec les détails
    roles.value = await enrichRolesWithDetails(rolesResponse)
    stats.value = calculateStats(roles.value)
  }
  catch (error) {
    console.error('Erreur lors du chargement:', error)
  }
  finally {
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
  permissionCategories.value = groupPermissionsByCategory(allPermissions.value, [])
  showModal.value = true
}

const openEditModal = async (role: RoleWithDetails) => {
  const check = canModifyRole(role)
  if (!check.canModify) {
    alert(check.warning || 'Ce rôle ne peut pas être modifié')
    return
  }

  isSaving.value = true
  try {
    const roleWithPerms = await getRoleById(role.id)

    editingRole.value = roleWithPerms
    form.value = {
      code: roleWithPerms.code,
      name_fr: roleWithPerms.name_fr,
      description: roleWithPerms.description || '',
      hierarchy_level: roleWithPerms.hierarchy_level,
      active: roleWithPerms.active,
      permission_ids: roleWithPerms.permissions.map(p => p.id)
    }
    formErrors.value = {}
    permissionCategories.value = groupPermissionsByCategory(
      allPermissions.value,
      roleWithPerms.permissions.map(p => p.id)
    )
    showModal.value = true
  }
  catch (error) {
    console.error('Erreur lors du chargement du rôle:', error)
    alert('Erreur lors du chargement du rôle')
  }
  finally {
    isSaving.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  editingRole.value = null
}

const validateForm = () => {
  formErrors.value = {}

  if (!validateRoleCode(form.value.code)) {
    formErrors.value.code = 'Le code doit être en snake_case (2-50 caractères, lettres minuscules, chiffres et underscores)'
  }
  else if (!isCodeAvailable(form.value.code, roles.value, editingRole.value?.id)) {
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
    if (isEditing.value && editingRole.value) {
      // Mise à jour
      await updateRole(editingRole.value.id, {
        code: form.value.code,
        name_fr: form.value.name_fr,
        description: form.value.description || null,
        hierarchy_level: form.value.hierarchy_level,
        active: form.value.active,
      })

      // Mettre à jour les permissions
      await updateRolePermissions(editingRole.value.id, {
        permission_ids: form.value.permission_ids,
      })
    }
    else {
      // Création
      const result = await createRole({
        code: form.value.code,
        name_fr: form.value.name_fr,
        description: form.value.description || null,
        hierarchy_level: form.value.hierarchy_level,
        active: form.value.active,
      })

      // Ajouter les permissions au nouveau rôle
      if (form.value.permission_ids.length > 0) {
        await updateRolePermissions(result.id, {
          permission_ids: form.value.permission_ids,
        })
      }
    }

    closeModal()
    await loadData()
  }
  catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    alert('Erreur lors de la sauvegarde du rôle')
  }
  finally {
    isSaving.value = false
  }
}

const openDeleteModal = (role: RoleWithDetails) => {
  const check = canDeleteRole(role)
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
    await deleteRole(selectedRole.value.id)
    showDeleteModal.value = false
    selectedRole.value = null
    await loadData()
  }
  catch (error) {
    console.error('Erreur lors de la suppression:', error)
    alert('Erreur lors de la suppression du rôle')
  }
  finally {
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

  if (!isCodeAvailable(duplicateForm.value.code, roles.value)) {
    alert('Ce code est déjà utilisé')
    return
  }

  isSaving.value = true
  try {
    await duplicateRole(selectedRole.value.id, {
      new_code: duplicateForm.value.code,
      new_name: duplicateForm.value.name_fr,
    })
    showDuplicateModal.value = false
    selectedRole.value = null
    await loadData()
  }
  catch (error) {
    console.error('Erreur lors de la duplication:', error)
    alert('Erreur lors de la duplication du rôle')
  }
  finally {
    isSaving.value = false
  }
}

const handleToggleRoleActive = async (role: RoleWithDetails) => {
  if (role.code === 'super_admin') {
    alert('Le super administrateur ne peut pas être désactivé')
    return
  }

  isSaving.value = true
  try {
    await toggleRoleActive(role.id)
    await loadData()
  }
  catch (error) {
    console.error('Erreur lors du changement de statut:', error)
    alert('Erreur lors du changement de statut')
  }
  finally {
    isSaving.value = false
  }
}

const openUsersModal = async (role: RoleWithDetails) => {
  selectedRole.value = role
  roleUsersPage.value = 1
  await loadRoleUsers()
  showUsersModal.value = true
}

const loadRoleUsers = async () => {
  if (!selectedRole.value) return

  try {
    const users = await getRoleUsers(selectedRole.value.id)
    roleUsers.value = users
    roleUsersTotal.value = users.length
  }
  catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
    roleUsers.value = []
    roleUsersTotal.value = 0
  }
}

const togglePermission = (permissionId: string) => {
  const index = form.value.permission_ids.indexOf(permissionId)
  if (index === -1) {
    form.value.permission_ids.push(permissionId)
  }
  else {
    form.value.permission_ids.splice(index, 1)
  }
  updateCategoryCounts()
}

const toggleCategory = (category: PermissionCategoryGroup) => {
  const categoryPermIds = category.permissions.map(p => p.id)
  const allSelected = categoryPermIds.every(id => form.value.permission_ids.includes(id))

  if (allSelected) {
    form.value.permission_ids = form.value.permission_ids.filter(id => !categoryPermIds.includes(id))
  }
  else {
    categoryPermIds.forEach((id) => {
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
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouveau rôle
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>

    <template v-else>
      <!-- Stats Cards -->
      <div v-if="stats" class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
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
              <svg class="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
              <svg class="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
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
              <svg class="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
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
            <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                v-if="filters.sort_order === 'asc'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
              />
            </svg>
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
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ role.name_fr }}
                        <span
                          v-if="role.is_system"
                          class="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                        >
                          <svg class="mr-1 h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
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
                    <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
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
                    @click="handleToggleRoleActive(role)"
                  >
                    <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        v-if="role.active"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                      <path
                        v-else
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
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
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      title="Dupliquer"
                      @click="openDuplicateModal(role)"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-2 text-gray-500 hover:bg-red-100 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                      title="Supprimer"
                      :disabled="role.is_system || role.users_count > 0"
                      @click="openDeleteModal(role)"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredRoles.length === 0">
                <td colspan="7" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  <svg class="mx-auto mb-2 h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
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
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="admin-scrollbar max-h-[70vh] overflow-y-auto p-4" data-lenis-prevent>
            <!-- Warning for system roles -->
            <div
              v-if="isEditing && editingRole && isSystemRole(editingRole.code)"
              class="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20"
            >
              <div class="flex items-start gap-3">
                <svg class="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
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
                    :disabled="isEditing && editingRole && isSystemRole(editingRole.code)"
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
              <svg v-if="isSaving" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
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
              <svg class="h-7 w-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
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
                <svg v-if="isSaving" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
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
              <svg v-if="isSaving" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
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
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
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
                  <svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
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
