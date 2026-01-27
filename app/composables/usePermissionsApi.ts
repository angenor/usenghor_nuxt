/**
 * Composable API - Permissions
 * ============================
 *
 * Gestion des permissions via l'API backend FastAPI.
 * Aligné sur le schéma SQL: permissions (02_identity.sql)
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

export interface PermissionCreatePayload {
  code: string
  name_fr: string
  description?: string | null
  category?: string | null
}

export interface PermissionUpdatePayload {
  code?: string
  name_fr?: string
  description?: string | null
  category?: string | null
}

export interface PermissionFilters {
  page?: number
  limit?: number
  search?: string | null
  category?: string | null
}

export interface RoleInMatrix {
  id: string
  code: string
  name_fr: string
}

export interface PermissionMatrix {
  permissions: Record<string, {
    id: string
    name_fr: string
    category: string | null
    roles: Record<string, boolean>
  }>
  roles: RoleInMatrix[]
}

export interface PermissionMatrixUpdate {
  updates: Array<{
    role_id: string
    permission_id: string
    granted: boolean
  }>
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
    roles: string[] // role IDs qui ont cette permission
  }>
  total_count: number
  selected_count?: number
}

export interface PermissionStats {
  total: number
  categories_count: number
  roles_count: number
  active_roles: number
}

// ============================================================================
// Constants
// ============================================================================

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

export function usePermissionsApi() {
  const { apiFetch } = useApi()

  // Cache
  const permissionsCache = ref<PermissionRead[]>([])
  const matrixCache = ref<PermissionMatrix | null>(null)

  // =========================================================================
  // PERMISSIONS - API Calls
  // =========================================================================

  /**
   * Liste les permissions avec pagination et filtres.
   */
  async function listPermissions(params: PermissionFilters = {}): Promise<PaginatedResponse<PermissionRead>> {
    return apiFetch<PaginatedResponse<PermissionRead>>('/api/admin/permissions', {
      query: {
        page: params.page ?? 1,
        limit: params.limit ?? 100,
        search: params.search,
        category: params.category,
      },
    })
  }

  /**
   * Récupère toutes les permissions (pour les selects et la matrice).
   */
  async function getAllPermissions(): Promise<PermissionRead[]> {
    if (permissionsCache.value.length > 0) {
      return permissionsCache.value
    }

    try {
      const response = await listPermissions({ limit: 500 })
      permissionsCache.value = response.items
      return response.items
    }
    catch (error) {
      console.error('Erreur lors du chargement des permissions:', error)
      return []
    }
  }

  /**
   * Récupère une permission par son ID.
   */
  async function getPermissionById(id: string): Promise<PermissionRead> {
    return apiFetch<PermissionRead>(`/api/admin/permissions/${id}`)
  }

  /**
   * Crée une nouvelle permission.
   */
  async function createPermission(data: PermissionCreatePayload): Promise<{ id: string; message: string }> {
    const result = await apiFetch<{ id: string; message: string }>('/api/admin/permissions', {
      method: 'POST',
      body: data,
    })
    invalidateCache()
    return result
  }

  /**
   * Met à jour une permission.
   */
  async function updatePermission(id: string, data: PermissionUpdatePayload): Promise<PermissionRead> {
    const result = await apiFetch<PermissionRead>(`/api/admin/permissions/${id}`, {
      method: 'PUT',
      body: data,
    })
    invalidateCache()
    return result
  }

  /**
   * Récupère les rôles ayant une permission.
   */
  async function getPermissionRoles(permissionId: string): Promise<Array<{
    id: string
    code: string
    name_fr: string
    description: string | null
    hierarchy_level: number
    active: boolean
  }>> {
    return apiFetch(`/api/admin/permissions/${permissionId}/roles`)
  }

  // =========================================================================
  // MATRICE PERMISSIONS/RÔLES
  // =========================================================================

  /**
   * Récupère la matrice permissions/rôles.
   */
  async function getPermissionsMatrix(): Promise<PermissionMatrix> {
    if (matrixCache.value) {
      return matrixCache.value
    }

    const result = await apiFetch<PermissionMatrix>('/api/admin/permissions/matrix')
    matrixCache.value = result
    return result
  }

  /**
   * Met à jour la matrice permissions/rôles.
   */
  async function updatePermissionsMatrix(data: PermissionMatrixUpdate): Promise<MessageResponse> {
    const result = await apiFetch<MessageResponse>('/api/admin/permissions/matrix', {
      method: 'PUT',
      body: data,
    })
    invalidateMatrixCache()
    return result
  }

  /**
   * Bascule une permission pour un rôle dans la matrice.
   */
  async function togglePermissionForRole(roleId: string, permissionId: string, granted: boolean): Promise<MessageResponse> {
    return updatePermissionsMatrix({
      updates: [{ role_id: roleId, permission_id: permissionId, granted }],
    })
  }

  // =========================================================================
  // HELPERS
  // =========================================================================

  /**
   * Groupe les permissions par catégorie.
   */
  function groupPermissionsByCategory(
    permissions: PermissionRead[],
    matrix?: PermissionMatrix | null,
  ): PermissionCategoryGroup[] {
    const grouped = new Map<string, PermissionRead[]>()

    permissions.forEach((perm) => {
      const category = perm.category || 'other'
      if (!grouped.has(category)) {
        grouped.set(category, [])
      }
      grouped.get(category)!.push(perm)
    })

    return Array.from(grouped.entries())
      .map(([code, perms]) => {
        const categoryPerms = perms.map((p) => {
          // Calculer le nombre de rôles et leurs IDs
          let rolesCount = 0
          const roleIds: string[] = []

          if (matrix) {
            const permMatrix = matrix.permissions[p.code]
            if (permMatrix) {
              matrix.roles.forEach((role) => {
                if (permMatrix.roles[role.code]) {
                  rolesCount++
                  roleIds.push(role.id)
                }
              })
            }
          }

          return {
            id: p.id,
            code: p.code,
            name_fr: p.name_fr,
            description: p.description,
            roles_count: rolesCount,
            roles: roleIds,
          }
        })

        return {
          code,
          name: permissionCategoryLabels[code] || code,
          permissions: categoryPerms.sort((a, b) => a.code.localeCompare(b.code)),
          total_count: categoryPerms.length,
        }
      })
      .sort((a, b) => {
        const order = Object.keys(permissionCategoryLabels)
        const indexA = order.indexOf(a.code)
        const indexB = order.indexOf(b.code)
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
      })
  }

  /**
   * Calcule les statistiques des permissions.
   */
  async function getPermissionStats(): Promise<PermissionStats> {
    const permissions = await getAllPermissions()
    const matrix = await getPermissionsMatrix()

    const categories = new Set(permissions.map(p => p.category || 'other'))
    const activeRoles = matrix.roles.filter((r) => {
      // On considère tous les rôles comme actifs sauf si on a l'info
      return true
    }).length

    return {
      total: permissions.length,
      categories_count: categories.size,
      roles_count: matrix.roles.length,
      active_roles: activeRoles,
    }
  }

  /**
   * Récupère les catégories de permissions disponibles.
   */
  async function getPermissionCategories(): Promise<string[]> {
    const permissions = await getAllPermissions()
    const categories = new Set(permissions.map(p => p.category || 'other'))
    return Array.from(categories).sort((a, b) => {
      const order = Object.keys(permissionCategoryLabels)
      const indexA = order.indexOf(a)
      const indexB = order.indexOf(b)
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
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
   * Valide le format d'un code de permission.
   */
  function validatePermissionCode(code: string): boolean {
    // Format: category.action (ex: users.view, programs.create)
    const pattern = /^[a-z]+\.[a-z]+$/
    return pattern.test(code)
  }

  /**
   * Vérifie si un code de permission est déjà utilisé.
   */
  async function isPermissionCodeTaken(code: string, excludeId?: string): Promise<boolean> {
    const permissions = await getAllPermissions()
    return permissions.some(p => p.code === code && p.id !== excludeId)
  }

  /**
   * Vérifie si une permission peut être supprimée.
   */
  async function canDeletePermission(permissionId: string): Promise<{ canDelete: boolean; reason?: string }> {
    const roles = await getPermissionRoles(permissionId)
    if (roles.length > 0) {
      const roleNames = roles.map(r => r.name_fr).join(', ')
      return {
        canDelete: false,
        reason: `Cette permission est utilisée par ${roles.length} rôle(s): ${roleNames}. Retirez-la des rôles avant de la supprimer.`,
      }
    }
    return { canDelete: true }
  }

  /**
   * Invalide le cache des permissions.
   */
  function invalidateCache(): void {
    permissionsCache.value = []
    matrixCache.value = null
  }

  /**
   * Invalide le cache de la matrice.
   */
  function invalidateMatrixCache(): void {
    matrixCache.value = null
  }

  return {
    // API - Permissions
    listPermissions,
    getAllPermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    getPermissionRoles,

    // API - Matrice
    getPermissionsMatrix,
    updatePermissionsMatrix,
    togglePermissionForRole,

    // Helpers
    groupPermissionsByCategory,
    getPermissionStats,
    getPermissionCategories,
    getCategoryLabel,
    getCategoryIcon,
    validatePermissionCode,
    isPermissionCodeTaken,
    canDeletePermission,
    invalidateCache,
    invalidateMatrixCache,

    // Cache
    permissionsCache,
    matrixCache,

    // Constants
    permissionCategoryLabels,
    permissionCategoryIcons,
  }
}
