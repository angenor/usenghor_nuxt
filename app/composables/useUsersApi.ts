/**
 * Composable API - Users
 * ======================
 *
 * Gestion des utilisateurs via l'API backend FastAPI.
 * Aligné sur le schéma SQL: users (02_identity.sql)
 */

import type { MessageResponse, PaginatedResponse } from '~/types/api'

// ============================================================================
// Types Backend (alignés sur les schemas Pydantic)
// ============================================================================

// Aligné sur l'enum PostgreSQL: salutation AS ENUM ('Mr', 'Mrs', 'Dr', 'Pr')
export type UserSalutation = 'Mr' | 'Mrs' | 'Dr' | 'Pr'

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

export interface PermissionRead {
  id: string
  code: string
  name_fr: string
  description: string | null
  category: string | null
  created_at: string
}

export interface RoleWithPermissions extends RoleRead {
  permissions: PermissionRead[]
}

export interface UserRead {
  id: string
  email: string
  last_name: string
  first_name: string
  salutation: UserSalutation | null
  birth_date: string | null
  phone: string | null
  phone_whatsapp: string | null
  linkedin: string | null
  city: string | null
  address: string | null
  active: boolean
  email_verified: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
  photo_external_id: string | null
  nationality_external_id: string | null
  residence_country_external_id: string | null
}

export interface UserWithRoles extends UserRead {
  roles: RoleRead[]
}

export interface UserCreatePayload {
  email: string
  password: string
  last_name: string
  first_name: string
  salutation?: UserSalutation | null
  birth_date?: string | null
  phone?: string | null
  phone_whatsapp?: string | null
  linkedin?: string | null
  city?: string | null
  address?: string | null
  photo_external_id?: string | null
}

export interface UserUpdatePayload {
  email?: string
  last_name?: string
  first_name?: string
  salutation?: UserSalutation | null
  birth_date?: string | null
  phone?: string | null
  phone_whatsapp?: string | null
  linkedin?: string | null
  city?: string | null
  address?: string | null
  active?: boolean
  photo_external_id?: string | null
}

export interface UserRolesUpdatePayload {
  role_ids: string[]
}

export interface UserBulkActionPayload {
  user_ids: string[]
  action: 'activate' | 'deactivate' | 'delete'
}

export interface PasswordResetResponse {
  temporary_password: string
  message: string
}

export interface UserFilters {
  page?: number
  limit?: number
  search?: string | null
  active?: boolean | null
  role_id?: string | null
}

export interface UserForSelect {
  id: string
  email: string
  full_name: string
  photo_external_id: string | null
}

// Statistiques (calculées côté frontend)
export interface UserStats {
  total: number
  active: number
  inactive: number
  email_verified: number
  email_not_verified: number
  by_role: Array<{ role_id: string; role_name: string; count: number }>
  last_registrations: number
  last_logins: number
}

// ============================================================================
// Constants
// ============================================================================

export const salutationLabels: Record<UserSalutation, string> = {
  Mr: 'M.',
  Mrs: 'Mme',
  Dr: 'Dr',
  Pr: 'Pr',
}

export const salutationOptions: Array<{ value: UserSalutation; label: string }> = [
  { value: 'Mr', label: 'Monsieur' },
  { value: 'Mrs', label: 'Madame' },
  { value: 'Dr', label: 'Docteur' },
  { value: 'Pr', label: 'Professeur' },
]

export const userStatusColors = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
}

export const verificationColors = {
  verified: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  not_verified: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

export const roleColors: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  evaluator: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  campus_manager: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
  newsletter_manager: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

// ============================================================================
// Composable
// ============================================================================

export function useUsersApi() {
  const { apiFetch } = useApi()

  // Cache pour les utilisateurs
  const usersCache = ref<UserWithRoles[]>([])

  // =========================================================================
  // USERS - API Calls
  // =========================================================================

  /**
   * Liste les utilisateurs avec pagination et filtres.
   */
  async function listUsers(params: UserFilters = {}): Promise<PaginatedResponse<UserRead>> {
    return apiFetch<PaginatedResponse<UserRead>>('/api/admin/users', {
      query: {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        search: params.search,
        active: params.active,
        role_id: params.role_id,
      },
    })
  }

  /**
   * Récupère un utilisateur par son ID (avec ses rôles).
   */
  async function getUserById(id: string): Promise<UserWithRoles> {
    return apiFetch<UserWithRoles>(`/api/admin/users/${id}`)
  }

  /**
   * Crée un nouvel utilisateur.
   */
  async function createUser(data: UserCreatePayload): Promise<{ id: string; message: string }> {
    return apiFetch<{ id: string; message: string }>('/api/admin/users', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un utilisateur.
   */
  async function updateUser(id: string, data: UserUpdatePayload): Promise<UserRead> {
    return apiFetch<UserRead>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un utilisateur.
   */
  async function deleteUser(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Bascule le statut actif d'un utilisateur.
   */
  async function toggleUserActive(id: string): Promise<UserRead> {
    return apiFetch<UserRead>(`/api/admin/users/${id}/toggle-active`, {
      method: 'POST',
    })
  }

  /**
   * Effectue une action en masse sur les utilisateurs.
   */
  async function bulkAction(data: UserBulkActionPayload): Promise<MessageResponse> {
    return apiFetch<MessageResponse>('/api/admin/users/bulk-action', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Récupère les rôles d'un utilisateur.
   */
  async function getUserRoles(userId: string): Promise<Array<{ id: string; code: string; name_fr: string }>> {
    return apiFetch<Array<{ id: string; code: string; name_fr: string }>>(`/api/admin/users/${userId}/roles`)
  }

  /**
   * Met à jour les rôles d'un utilisateur.
   */
  async function updateUserRoles(userId: string, roleIds: string[]): Promise<UserWithRoles> {
    return apiFetch<UserWithRoles>(`/api/admin/users/${userId}/roles`, {
      method: 'PUT',
      body: { role_ids: roleIds },
    })
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur.
   */
  async function resetUserPassword(userId: string): Promise<PasswordResetResponse> {
    return apiFetch<PasswordResetResponse>(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
    })
  }

  /**
   * Marque l'email d'un utilisateur comme vérifié.
   */
  async function verifyUserEmail(userId: string): Promise<UserRead> {
    return apiFetch<UserRead>(`/api/admin/users/${userId}/verify-email`, {
      method: 'POST',
    })
  }

  /**
   * Récupère les permissions d'un utilisateur.
   */
  async function getUserPermissions(userId: string): Promise<string[]> {
    return apiFetch<string[]>(`/api/admin/users/${userId}/permissions`)
  }

  /**
   * Anonymise un utilisateur (RGPD).
   */
  async function anonymizeUser(userId: string): Promise<UserRead> {
    return apiFetch<UserRead>(`/api/admin/users/${userId}/anonymize`, {
      method: 'POST',
    })
  }

  // =========================================================================
  // HELPERS
  // =========================================================================

  /**
   * Récupère tous les utilisateurs actifs (pour les selects).
   */
  async function getActiveUsers(): Promise<UserWithRoles[]> {
    if (usersCache.value.length > 0) {
      return usersCache.value.filter(u => u.active)
    }

    try {
      const response = await listUsers({ limit: 500 })
      // Récupérer les détails avec rôles pour chaque utilisateur
      const usersWithRoles: UserWithRoles[] = []
      for (const user of response.items) {
        const userWithRoles = await getUserById(user.id)
        usersWithRoles.push(userWithRoles)
      }
      usersCache.value = usersWithRoles
      return usersWithRoles.filter(u => u.active)
    }
    catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      throw error
    }
  }

  /**
   * Retourne le nom complet d'un utilisateur.
   */
  function getFullName(user: UserRead | UserWithRoles | null): string {
    if (!user) return ''
    const parts = []
    if (user.salutation) parts.push(salutationLabels[user.salutation] || user.salutation)
    if (user.first_name) parts.push(user.first_name)
    if (user.last_name) parts.push(user.last_name)
    return parts.join(' ')
  }

  /**
   * Recherche un utilisateur dans le cache par ID.
   */
  function getUserFromCache(id: string | null): UserWithRoles | null {
    if (!id) return null
    return usersCache.value.find(u => u.id === id) || null
  }

  /**
   * Invalide le cache des utilisateurs.
   */
  function invalidateCache(): void {
    usersCache.value = []
  }

  /**
   * Liste des utilisateurs actifs pour un select.
   */
  async function getUsersForSelect(): Promise<UserForSelect[]> {
    const users = await getActiveUsers()
    return users
      .map(u => ({
        id: u.id,
        email: u.email,
        full_name: getFullName(u),
        photo_external_id: u.photo_external_id,
      }))
      .sort((a, b) => a.full_name.localeCompare(b.full_name))
  }

  /**
   * Obtient la couleur d'un rôle.
   */
  function getRoleColor(roleCode: string): string {
    return roleColors[roleCode] || roleColors.viewer
  }

  /**
   * Formate une date de dernière connexion.
   */
  function formatLastLogin(lastLogin: string | null): string {
    if (!lastLogin) return 'Jamais connecté'

    const date = new Date(lastLogin)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 5) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  /**
   * Valide un email.
   */
  function validateEmail(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(email)
  }

  /**
   * Valide un mot de passe.
   */
  function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Vérifie si un utilisateur peut être supprimé.
   */
  function canDeleteUser(user: UserWithRoles): { canDelete: boolean; reason?: string } {
    // Super admin ne peut pas être supprimé
    if (user.roles.some(r => r.code === 'super_admin')) {
      return { canDelete: false, reason: 'Le super administrateur ne peut pas être supprimé' }
    }
    return { canDelete: true }
  }

  /**
   * Vérifie si un utilisateur peut être désactivé.
   */
  function canDeactivateUser(user: UserWithRoles): { canDeactivate: boolean; reason?: string } {
    // Super admin ne peut pas être désactivé
    if (user.roles.some(r => r.code === 'super_admin')) {
      return { canDeactivate: false, reason: 'Le super administrateur ne peut pas être désactivé' }
    }
    return { canDeactivate: true }
  }

  /**
   * Calcule les statistiques des utilisateurs.
   */
  function computeStats(users: UserWithRoles[], roles: RoleRead[]): UserStats {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Comptage par rôle
    const roleCounts = new Map<string, number>()
    users.forEach((u) => {
      u.roles.forEach((r) => {
        roleCounts.set(r.id, (roleCounts.get(r.id) || 0) + 1)
      })
    })

    const byRole = roles
      .filter(r => r.active)
      .map(role => ({
        role_id: role.id,
        role_name: role.name_fr,
        count: roleCounts.get(role.id) || 0,
      }))
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count)

    return {
      total: users.length,
      active: users.filter(u => u.active).length,
      inactive: users.filter(u => !u.active).length,
      email_verified: users.filter(u => u.email_verified).length,
      email_not_verified: users.filter(u => !u.email_verified).length,
      by_role: byRole,
      last_registrations: users.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length,
      last_logins: users.filter(u => u.last_login_at && new Date(u.last_login_at) >= sevenDaysAgo).length,
    }
  }

  return {
    // API - Users
    listUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    bulkAction,
    getUserRoles,
    updateUserRoles,
    resetUserPassword,
    verifyUserEmail,
    getUserPermissions,
    anonymizeUser,

    // Helpers
    getActiveUsers,
    getFullName,
    getUserFromCache,
    getUsersForSelect,
    invalidateCache,
    getRoleColor,
    formatLastLogin,
    validateEmail,
    validatePassword,
    canDeleteUser,
    canDeactivateUser,
    computeStats,

    // Cache
    usersCache,

    // Constants
    salutationLabels,
    salutationOptions,
    userStatusColors,
    verificationColors,
    roleColors,
  }
}
