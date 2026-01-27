/**
 * Composable API - Roles
 * ======================
 *
 * Gestion des rôles et permissions via l'API backend FastAPI.
 * Aligné sur le schéma SQL: roles, permissions (02_identity.sql)
 */

import type { MessageResponse, PaginatedResponse } from '~/types/api'

// ============================================================================
// Types Backend (alignés sur les schemas Pydantic)
// ============================================================================

export interface PermissionRead {
  id: string
  code: string
  name_fr: string
  description: string | null
  category: string | null
  created_at: string
}

export interface RoleRead {
  id: string
  code: string
  name_fr: string
  description: string | null
  hierarchy_level: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface RoleWithPermissions extends RoleRead {
  permissions: PermissionRead[]
}

export interface RoleCreatePayload {
  code: string
  name_fr: string
  description?: string | null
  hierarchy_level?: number
  active?: boolean
}

export interface RoleUpdatePayload {
  code?: string
  name_fr?: string
  description?: string | null
  hierarchy_level?: number
  active?: boolean
}

export interface RoleDuplicatePayload {
  new_code: string
  new_name: string
}

export interface RolePermissionsUpdatePayload {
  permission_ids: string[]
}

export interface RoleFilters {
  page?: number
  limit?: number
  search?: string | null
  active?: boolean | null
}

export interface RoleForSelect {
  id: string
  code: string
  name_fr: string
  hierarchy_level: number
}

export interface PermissionGrouped {
  category: string
  permissions: PermissionRead[]
}

export interface RoleComparison {
  roles: Array<{ id: string; code: string; name_fr: string }>
  permissions: Record<string, {
    name_fr: string
    category: string
    roles: Record<string, boolean>
  }>
}

// ============================================================================
// Constants
// ============================================================================

export const roleColors: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  evaluator: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  campus_manager: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
  newsletter_manager: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

export const permissionCategoryLabels: Record<string, string> = {
  users: 'Utilisateurs',
  editorial: 'Éditorial',
  news: 'Actualités',
  events: 'Événements',
  programs: 'Programmes',
  applications: 'Candidatures',
  media: 'Médiathèque',
  campuses: 'Campus',
  partners: 'Partenaires',
  newsletter: 'Newsletter',
  stats: 'Statistiques',
  settings: 'Paramètres',
}

export const permissionCategoryIcons: Record<string, string> = {
  users: 'fa-users',
  editorial: 'fa-pen-fancy',
  news: 'fa-newspaper',
  events: 'fa-calendar-alt',
  programs: 'fa-graduation-cap',
  applications: 'fa-file-alt',
  media: 'fa-photo-video',
  campuses: 'fa-university',
  partners: 'fa-handshake',
  newsletter: 'fa-envelope',
  stats: 'fa-chart-bar',
  settings: 'fa-cog',
}

// ============================================================================
// Composable
// ============================================================================

export function useRolesApi() {
  const { apiFetch } = useApi()

  // Cache pour les rôles
  const rolesCache = ref<RoleRead[]>([])
  const permissionsCache = ref<PermissionRead[]>([])

  // =========================================================================
  // ROLES - API Calls
  // =========================================================================

  /**
   * Liste les rôles avec pagination et filtres.
   */
  async function listRoles(params: RoleFilters = {}): Promise<PaginatedResponse<RoleRead>> {
    return apiFetch<PaginatedResponse<RoleRead>>('/api/admin/roles', {
      query: {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        search: params.search,
        active: params.active,
      },
    })
  }

  /**
   * Récupère un rôle par son ID (avec ses permissions).
   */
  async function getRoleById(id: string): Promise<RoleWithPermissions> {
    return apiFetch<RoleWithPermissions>(`/api/admin/roles/${id}`)
  }

  /**
   * Crée un nouveau rôle.
   */
  async function createRole(data: RoleCreatePayload): Promise<{ id: string; message: string }> {
    return apiFetch<{ id: string; message: string }>('/api/admin/roles', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un rôle.
   */
  async function updateRole(id: string, data: RoleUpdatePayload): Promise<RoleRead> {
    return apiFetch<RoleRead>(`/api/admin/roles/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un rôle.
   */
  async function deleteRole(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/roles/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Duplique un rôle avec ses permissions.
   */
  async function duplicateRole(id: string, data: RoleDuplicatePayload): Promise<RoleWithPermissions> {
    return apiFetch<RoleWithPermissions>(`/api/admin/roles/${id}/duplicate`, {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Bascule le statut actif d'un rôle.
   */
  async function toggleRoleActive(id: string): Promise<RoleRead> {
    return apiFetch<RoleRead>(`/api/admin/roles/${id}/toggle-active`, {
      method: 'POST',
    })
  }

  /**
   * Récupère les permissions d'un rôle.
   */
  async function getRolePermissions(roleId: string): Promise<PermissionRead[]> {
    return apiFetch<PermissionRead[]>(`/api/admin/roles/${roleId}/permissions`)
  }

  /**
   * Met à jour les permissions d'un rôle.
   */
  async function updateRolePermissions(roleId: string, permissionIds: string[]): Promise<RoleWithPermissions> {
    return apiFetch<RoleWithPermissions>(`/api/admin/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: { permission_ids: permissionIds },
    })
  }

  /**
   * Récupère les utilisateurs ayant un rôle.
   */
  async function getRoleUsers(roleId: string): Promise<Array<{
    id: string
    email: string
    last_name: string
    first_name: string
    active: boolean
  }>> {
    return apiFetch(`/api/admin/roles/${roleId}/users`)
  }

  /**
   * Compare les permissions de plusieurs rôles.
   */
  async function compareRoles(roleIds: string[]): Promise<RoleComparison> {
    return apiFetch<RoleComparison>('/api/admin/roles/compare', {
      query: {
        role_ids: roleIds.join(','),
      },
    })
  }

  // =========================================================================
  // PERMISSIONS - API Calls
  // =========================================================================

  /**
   * Liste toutes les permissions via l'API backend.
   */
  async function listPermissions(): Promise<PermissionRead[]> {
    if (permissionsCache.value.length > 0) {
      return permissionsCache.value
    }

    try {
      const response = await apiFetch<{ items: PermissionRead[] }>('/api/admin/permissions', {
        query: { limit: 500 },
      })
      permissionsCache.value = response.items
      return response.items
    }
    catch (error) {
      console.error('Erreur lors du chargement des permissions:', error)
      return []
    }
  }

  // =========================================================================
  // HELPERS
  // =========================================================================

  /**
   * Récupère tous les rôles actifs (pour les selects).
   */
  async function getActiveRoles(): Promise<RoleRead[]> {
    if (rolesCache.value.length > 0) {
      return rolesCache.value.filter(r => r.active)
    }

    try {
      const response = await listRoles({ limit: 100, active: true })
      rolesCache.value = response.items
      return response.items
    }
    catch (error) {
      console.error('Erreur lors du chargement des rôles:', error)
      throw error
    }
  }

  /**
   * Liste des rôles actifs pour un select.
   */
  async function getRolesForSelect(): Promise<RoleForSelect[]> {
    const roles = await getActiveRoles()
    return roles
      .map(r => ({
        id: r.id,
        code: r.code,
        name_fr: r.name_fr,
        hierarchy_level: r.hierarchy_level,
      }))
      .sort((a, b) => a.hierarchy_level - b.hierarchy_level)
  }

  /**
   * Recherche un rôle dans le cache par ID.
   */
  function getRoleFromCache(id: string | null): RoleRead | null {
    if (!id) return null
    return rolesCache.value.find(r => r.id === id) || null
  }

  /**
   * Invalide le cache des rôles.
   */
  function invalidateCache(): void {
    rolesCache.value = []
    permissionsCache.value = []
  }

  /**
   * Obtient la couleur d'un rôle.
   */
  function getRoleColor(roleCode: string): string {
    return roleColors[roleCode] || roleColors.viewer
  }

  /**
   * Groupe les permissions par catégorie.
   */
  function groupPermissionsByCategory(permissions: PermissionRead[]): PermissionGrouped[] {
    const grouped = new Map<string, PermissionRead[]>()

    permissions.forEach((perm) => {
      const category = perm.category || 'other'
      if (!grouped.has(category)) {
        grouped.set(category, [])
      }
      grouped.get(category)!.push(perm)
    })

    return Array.from(grouped.entries())
      .map(([category, perms]) => ({
        category,
        permissions: perms.sort((a, b) => a.code.localeCompare(b.code)),
      }))
      .sort((a, b) => {
        const order = Object.keys(permissionCategoryLabels)
        return order.indexOf(a.category) - order.indexOf(b.category)
      })
  }

  /**
   * Obtient le libellé d'une catégorie de permission.
   */
  function getCategoryLabel(category: string): string {
    return permissionCategoryLabels[category] || category
  }

  /**
   * Obtient l'icône d'une catégorie de permission.
   */
  function getCategoryIcon(category: string): string {
    return permissionCategoryIcons[category] || 'fa-lock'
  }

  /**
   * Vérifie si un rôle peut être supprimé.
   */
  function canDeleteRole(role: RoleRead): { canDelete: boolean; reason?: string } {
    // Rôles système ne peuvent pas être supprimés
    const systemRoles = ['super_admin', 'admin']
    if (systemRoles.includes(role.code)) {
      return { canDelete: false, reason: 'Les rôles système ne peuvent pas être supprimés' }
    }
    return { canDelete: true }
  }

  /**
   * Vérifie si un rôle peut être désactivé.
   */
  function canDeactivateRole(role: RoleRead): { canDeactivate: boolean; reason?: string } {
    // Super admin ne peut pas être désactivé
    if (role.code === 'super_admin') {
      return { canDeactivate: false, reason: 'Le rôle super administrateur ne peut pas être désactivé' }
    }
    return { canDeactivate: true }
  }

  return {
    // API - Roles
    listRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    duplicateRole,
    toggleRoleActive,
    getRolePermissions,
    updateRolePermissions,
    getRoleUsers,
    compareRoles,

    // API - Permissions
    listPermissions,

    // Helpers
    getActiveRoles,
    getRolesForSelect,
    getRoleFromCache,
    invalidateCache,
    getRoleColor,
    groupPermissionsByCategory,
    getCategoryLabel,
    getCategoryIcon,
    canDeleteRole,
    canDeactivateRole,

    // Cache
    rolesCache,
    permissionsCache,

    // Constants
    roleColors,
    permissionCategoryLabels,
    permissionCategoryIcons,
  }
}
