/**
 * Composable API - Permissions Admin
 * ===================================
 *
 * Gestion des permissions via l'API backend FastAPI.
 */

import type { IdResponse, MessageResponse, PaginatedResponse } from '~/types/api'

// ============================================================================
// Types
// ============================================================================

export interface Permission {
  id: string
  code: string
  name_fr: string
  description: string | null
  category: string | null
  created_at: string
}

export interface PermissionFilters {
  search?: string
  category?: string
}

export interface PermissionCreate {
  code: string
  name_fr: string
  description?: string | null
  category?: string | null
}

export interface PermissionUpdate {
  code?: string
  name_fr?: string
  description?: string | null
  category?: string | null
}

export interface PermissionMatrix {
  permissions: Record<string, unknown>
  roles: Array<{
    id: string
    code: string
    name_fr: string
  }>
}

export interface PermissionMatrixUpdate {
  updates: Array<{
    role_id: string
    permission_id: string
    granted: boolean
  }>
}

export interface PermissionStats {
  total: number
  categories_count: number
  active_roles: number
  roles_count: number
}

export interface PermissionCategoryGroup {
  code: string
  name: string
  permissions: Array<{
    id: string
    code: string
    name_fr: string
    description: string | null
    roles_count: number
  }>
}

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

// ============================================================================
// Labels UI
// ============================================================================

export const permissionCategoryLabels: Record<string, string> = {
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

// ============================================================================
// Composable
// ============================================================================

export function useAdminPermissionsApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // CRUD Permissions
  // =========================================================================

  /**
   * Liste les permissions avec pagination et filtres.
   */
  async function listPermissions(params: PermissionFilters & {
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<Permission>> {
    return apiFetch<PaginatedResponse<Permission>>('/api/admin/permissions', {
      query: {
        page: params.page || 1,
        limit: params.limit || 100,
        search: params.search,
        category: params.category,
      },
    })
  }

  /**
   * Récupère toutes les permissions (sans pagination).
   */
  async function getAllPermissions(): Promise<Permission[]> {
    const response = await listPermissions({ limit: 200 })
    return response.items
  }

  /**
   * Récupère une permission par son ID.
   */
  async function getPermissionById(id: string): Promise<Permission> {
    return apiFetch<Permission>(`/api/admin/permissions/${id}`)
  }

  /**
   * Crée une nouvelle permission.
   */
  async function createPermission(data: PermissionCreate): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/permissions', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour une permission.
   */
  async function updatePermission(id: string, data: PermissionUpdate): Promise<Permission> {
    return apiFetch<Permission>(`/api/admin/permissions/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Récupère les rôles ayant une permission.
   */
  async function getPermissionRoles(permissionId: string): Promise<Role[]> {
    return apiFetch<Role[]>(`/api/admin/permissions/${permissionId}/roles`)
  }

  // =========================================================================
  // Matrix
  // =========================================================================

  /**
   * Récupère la matrice permissions/rôles.
   */
  async function getPermissionMatrix(): Promise<PermissionMatrix> {
    return apiFetch<PermissionMatrix>('/api/admin/permissions/matrix')
  }

  /**
   * Met à jour la matrice permissions/rôles.
   */
  async function updatePermissionMatrix(updates: PermissionMatrixUpdate): Promise<MessageResponse> {
    return apiFetch<MessageResponse>('/api/admin/permissions/matrix', {
      method: 'PUT',
      body: updates,
    })
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Récupère les catégories uniques des permissions.
   */
  function getCategories(permissions: Permission[]): string[] {
    const categories = new Set<string>()
    permissions.forEach((p) => {
      if (p.category) {
        categories.add(p.category)
      }
    })
    return Array.from(categories).sort()
  }

  /**
   * Groupe les permissions par catégorie.
   */
  function groupByCategory(
    permissions: Permission[],
    rolePermissions: Map<string, string[]>,
  ): PermissionCategoryGroup[] {
    const grouped = new Map<string, Permission[]>()

    permissions.forEach((p) => {
      const category = p.category || 'other'
      if (!grouped.has(category)) {
        grouped.set(category, [])
      }
      grouped.get(category)!.push(p)
    })

    return Array.from(grouped.entries()).map(([code, perms]) => ({
      code,
      name: permissionCategoryLabels[code] || code,
      permissions: perms.map(p => ({
        id: p.id,
        code: p.code,
        name_fr: p.name_fr,
        description: p.description,
        roles_count: countRolesForPermission(p.id, rolePermissions),
      })),
    }))
  }

  /**
   * Compte le nombre de rôles ayant une permission.
   */
  function countRolesForPermission(
    permissionId: string,
    rolePermissions: Map<string, string[]>,
  ): number {
    let count = 0
    rolePermissions.forEach((permIds) => {
      if (permIds.includes(permissionId)) {
        count++
      }
    })
    return count
  }

  /**
   * Calcule les statistiques des permissions.
   */
  function calculateStats(
    permissions: Permission[],
    roles: Role[],
  ): PermissionStats {
    const categories = new Set<string>()
    permissions.forEach((p) => {
      if (p.category) {
        categories.add(p.category)
      }
    })

    return {
      total: permissions.length,
      categories_count: categories.size,
      active_roles: roles.filter(r => r.active).length,
      roles_count: roles.length,
    }
  }

  /**
   * Valide le format d'un code de permission.
   */
  function validatePermissionCode(code: string): boolean {
    // Format: category.action (ex: users.view, programs.create)
    return /^[a-z_]+\.[a-z_]+$/.test(code)
  }

  /**
   * Vérifie si un code de permission est déjà utilisé.
   */
  function isCodeTaken(code: string, permissions: Permission[], excludeId?: string): boolean {
    return permissions.some(p => p.code === code && p.id !== excludeId)
  }

  return {
    // CRUD
    listPermissions,
    getAllPermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    getPermissionRoles,

    // Matrix
    getPermissionMatrix,
    updatePermissionMatrix,

    // Helpers
    getCategories,
    groupByCategory,
    calculateStats,
    validatePermissionCode,
    isCodeTaken,

    // Labels
    permissionCategoryLabels,
  }
}
