/**
 * Composable API - Rôles Admin
 * =============================
 *
 * Gestion des rôles via l'API backend FastAPI.
 */

import type { IdResponse, MessageResponse, PaginatedResponse } from '~/types/api'
import type { Permission } from './useAdminPermissionsApi'

// ============================================================================
// Types
// ============================================================================

export interface Role {
  id: string
  code: string
  name_fr: string
  description: string | null
  hierarchy_level: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[]
  is_system?: boolean
}

export interface RoleWithDetails extends Role {
  users_count: number
  permissions_count: number
  is_system: boolean
}

export interface RoleFilters {
  search?: string
  active?: boolean
  sort_by?: 'hierarchy_level' | 'name_fr' | 'code' | 'users_count'
  sort_order?: 'asc' | 'desc'
}

export interface RoleCreate {
  code: string
  name_fr: string
  description?: string | null
  hierarchy_level?: number
  active?: boolean
}

export interface RoleUpdate {
  code?: string
  name_fr?: string
  description?: string | null
  hierarchy_level?: number
  active?: boolean
}

export interface RoleDuplicate {
  new_code: string
  new_name: string
}

export interface RolePermissionsUpdate {
  permission_ids: string[]
}

export interface RoleUser {
  id: string
  email: string
  last_name: string
  first_name: string
  full_name: string
  active: boolean
  assigned_at: string
}

export interface RoleStats {
  total: number
  active: number
  system: number
  total_users_with_roles: number
}

export interface PermissionCategoryGroup {
  code: string
  name: string
  permissions: Array<{
    id: string
    code: string
    name_fr: string
    description: string | null
  }>
  total_count: number
  selected_count: number
}

// ============================================================================
// Labels et couleurs UI
// ============================================================================

export const hierarchyLevelLabels: Record<number, string> = {
  100: 'Super Admin',
  80: 'Administrateur',
  60: 'Admin Campus',
  40: 'Éditeur',
  30: 'Modérateur',
  20: 'Contributeur',
  10: 'Utilisateur',
  0: 'Invité',
}

export function getHierarchyLevelLabel(level: number): string {
  // Trouver le label le plus proche
  const levels = Object.keys(hierarchyLevelLabels)
    .map(Number)
    .sort((a, b) => b - a)

  for (const l of levels) {
    if (level >= l) {
      return hierarchyLevelLabels[l]
    }
  }
  return 'Invité'
}

export function getHierarchyLevelColor(level: number): string {
  if (level >= 100) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  if (level >= 80) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
  if (level >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  if (level >= 40) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  if (level >= 20) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

// Rôles système qui ne peuvent pas être supprimés
const SYSTEM_ROLES = ['super_admin', 'admin', 'editor', 'viewer', 'user', 'moderator', 'campus_admin']

export function isSystemRole(code: string): boolean {
  return SYSTEM_ROLES.includes(code)
}

// ============================================================================
// Composable
// ============================================================================

export function useAdminRolesApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // CRUD Roles
  // =========================================================================

  /**
   * Liste les rôles avec pagination et filtres.
   */
  async function listRoles(params: RoleFilters & {
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<Role>> {
    return apiFetch<PaginatedResponse<Role>>('/api/admin/roles', {
      query: {
        page: params.page || 1,
        limit: params.limit || 50,
        search: params.search,
        active: params.active,
      },
    })
  }

  /**
   * Récupère tous les rôles (sans pagination).
   */
  async function getAllRoles(): Promise<Role[]> {
    const response = await listRoles({ limit: 100 })
    return response.items
  }

  /**
   * Récupère un rôle par son ID avec ses permissions.
   */
  async function getRoleById(id: string): Promise<RoleWithPermissions> {
    return apiFetch<RoleWithPermissions>(`/api/admin/roles/${id}`)
  }

  /**
   * Crée un nouveau rôle.
   */
  async function createRole(data: RoleCreate): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/roles', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un rôle.
   */
  async function updateRole(id: string, data: RoleUpdate): Promise<Role> {
    return apiFetch<Role>(`/api/admin/roles/${id}`, {
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
  async function duplicateRole(id: string, data: RoleDuplicate): Promise<RoleWithPermissions> {
    return apiFetch<RoleWithPermissions>(`/api/admin/roles/${id}/duplicate`, {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Bascule le statut actif d'un rôle.
   */
  async function toggleRoleActive(id: string): Promise<Role> {
    return apiFetch<Role>(`/api/admin/roles/${id}/toggle-active`, {
      method: 'POST',
    })
  }

  // =========================================================================
  // Permissions
  // =========================================================================

  /**
   * Récupère les permissions d'un rôle.
   */
  async function getRolePermissions(roleId: string): Promise<Permission[]> {
    return apiFetch<Permission[]>(`/api/admin/roles/${roleId}/permissions`)
  }

  /**
   * Met à jour les permissions d'un rôle.
   */
  async function updateRolePermissions(
    roleId: string,
    data: RolePermissionsUpdate,
  ): Promise<RoleWithPermissions> {
    return apiFetch<RoleWithPermissions>(`/api/admin/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: data,
    })
  }

  // =========================================================================
  // Users
  // =========================================================================

  /**
   * Récupère les utilisateurs ayant un rôle.
   */
  async function getRoleUsers(roleId: string): Promise<RoleUser[]> {
    const users = await apiFetch<Array<{
      id: string
      email: string
      last_name: string
      first_name: string
      active: boolean
      created_at: string
    }>>(`/api/admin/roles/${roleId}/users`)

    // Transformer pour ajouter full_name et assigned_at
    return users.map(u => ({
      id: u.id,
      email: u.email,
      last_name: u.last_name,
      first_name: u.first_name,
      full_name: `${u.first_name} ${u.last_name}`,
      active: u.active,
      assigned_at: u.created_at,
    }))
  }

  // =========================================================================
  // Compare
  // =========================================================================

  /**
   * Compare les permissions de plusieurs rôles.
   */
  async function compareRoles(roleIds: string[]): Promise<{
    roles: Array<{ id: string; code: string; name_fr: string }>
    permissions: Record<string, {
      name_fr: string
      category: string
      roles: Record<string, boolean>
    }>
  }> {
    return apiFetch(`/api/admin/roles/compare`, {
      query: { role_ids: roleIds.join(',') },
    })
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Enrichit les rôles avec les informations supplémentaires.
   */
  async function enrichRolesWithDetails(roles: Role[]): Promise<RoleWithDetails[]> {
    // Pour chaque rôle, récupérer le nombre d'utilisateurs et de permissions
    const enrichedRoles: RoleWithDetails[] = []

    for (const role of roles) {
      try {
        const [users, roleWithPerms] = await Promise.all([
          getRoleUsers(role.id).catch(() => []),
          getRoleById(role.id).catch(() => null),
        ])

        enrichedRoles.push({
          ...role,
          users_count: users.length,
          permissions_count: roleWithPerms?.permissions.length ?? 0,
          is_system: isSystemRole(role.code),
        })
      }
      catch {
        enrichedRoles.push({
          ...role,
          users_count: 0,
          permissions_count: 0,
          is_system: isSystemRole(role.code),
        })
      }
    }

    return enrichedRoles
  }

  /**
   * Calcule les statistiques des rôles.
   */
  function calculateStats(roles: RoleWithDetails[]): RoleStats {
    return {
      total: roles.length,
      active: roles.filter(r => r.active).length,
      system: roles.filter(r => r.is_system).length,
      total_users_with_roles: roles.reduce((sum, r) => sum + r.users_count, 0),
    }
  }

  /**
   * Groupe les permissions par catégorie pour un formulaire.
   */
  function groupPermissionsByCategory(
    permissions: Permission[],
    selectedIds: string[] = [],
  ): PermissionCategoryGroup[] {
    const grouped = new Map<string, Permission[]>()

    const categoryLabels: Record<string, string> = {
      users: 'Utilisateurs',
      programs: 'Programmes',
      applications: 'Candidatures',
      events: 'Événements',
      news: 'Actualités',
      campuses: 'Campus',
      partners: 'Partenaires',
      editorial: 'Éditorial',
      newsletter: 'Newsletter',
      admin: 'Administration',
      projects: 'Projets',
      media: 'Médias',
      services: 'Services',
      sectors: 'Départements',
    }

    permissions.forEach((p) => {
      const category = p.category || 'other'
      if (!grouped.has(category)) {
        grouped.set(category, [])
      }
      grouped.get(category)!.push(p)
    })

    return Array.from(grouped.entries()).map(([code, perms]) => ({
      code,
      name: categoryLabels[code] || code,
      permissions: perms.map(p => ({
        id: p.id,
        code: p.code,
        name_fr: p.name_fr,
        description: p.description,
      })),
      total_count: perms.length,
      selected_count: perms.filter(p => selectedIds.includes(p.id)).length,
    }))
  }

  /**
   * Valide le format d'un code de rôle.
   */
  function validateRoleCode(code: string): boolean {
    // Format: snake_case (ex: content_manager)
    return /^[a-z][a-z0-9_]{1,49}$/.test(code)
  }

  /**
   * Valide le nom d'un rôle.
   */
  function validateRoleName(name: string): boolean {
    return name.length >= 2 && name.length <= 100
  }

  /**
   * Valide le niveau hiérarchique.
   */
  function validateHierarchyLevel(level: number): boolean {
    return Number.isInteger(level) && level >= 0 && level <= 100
  }

  /**
   * Vérifie si un code de rôle est disponible.
   */
  function isCodeAvailable(code: string, roles: Role[], excludeId?: string): boolean {
    return !roles.some(r => r.code === code && r.id !== excludeId)
  }

  /**
   * Vérifie si un rôle peut être supprimé.
   */
  function canDeleteRole(role: RoleWithDetails): { canDelete: boolean; reason?: string } {
    if (role.is_system) {
      return { canDelete: false, reason: 'Les rôles système ne peuvent pas être supprimés' }
    }
    if (role.users_count > 0) {
      return {
        canDelete: false,
        reason: `Ce rôle est assigné à ${role.users_count} utilisateur(s)`,
      }
    }
    return { canDelete: true }
  }

  /**
   * Vérifie si un rôle peut être modifié.
   */
  function canModifyRole(role: RoleWithDetails): { canModify: boolean; warning?: string } {
    if (role.code === 'super_admin') {
      return { canModify: false, warning: 'Le super administrateur ne peut pas être modifié' }
    }
    if (role.is_system && role.users_count > 0) {
      return {
        canModify: true,
        warning: `Attention: Ce rôle système est assigné à ${role.users_count} utilisateur(s)`,
      }
    }
    return { canModify: true }
  }

  return {
    // CRUD
    listRoles,
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    duplicateRole,
    toggleRoleActive,

    // Permissions
    getRolePermissions,
    updateRolePermissions,

    // Users
    getRoleUsers,

    // Compare
    compareRoles,

    // Helpers
    enrichRolesWithDetails,
    calculateStats,
    groupPermissionsByCategory,
    validateRoleCode,
    validateRoleName,
    validateHierarchyLevel,
    isCodeAvailable,
    canDeleteRole,
    canModifyRole,

    // Labels & Colors
    hierarchyLevelLabels,
    getHierarchyLevelLabel,
    getHierarchyLevelColor,
    isSystemRole,
  }
}
