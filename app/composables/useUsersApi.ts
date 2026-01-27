/**
 * Composable API - Users
 * ======================
 *
 * Gestion des utilisateurs via l'API backend FastAPI.
 * Aligné sur le schéma SQL: users (02_identity.sql)
 */

import type { PaginatedResponse } from '~/types/api'

// ============================================================================
// Types Backend (alignés sur les schemas Pydantic)
// ============================================================================

export interface UserRead {
  id: string
  email: string
  last_name: string
  first_name: string
  salutation: string | null
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

export interface UserForSelect {
  id: string
  email: string
  full_name: string
  photo_external_id: string | null
}

// ============================================================================
// Composable
// ============================================================================

export function useUsersApi() {
  const { apiFetch } = useApi()

  // Cache pour les utilisateurs
  const usersCache = ref<UserRead[]>([])

  // =========================================================================
  // API Calls
  // =========================================================================

  /**
   * Liste les utilisateurs avec pagination et filtres.
   */
  async function listUsers(params?: {
    page?: number
    limit?: number
    search?: string
    active?: boolean
    role_id?: string
  }): Promise<PaginatedResponse<UserRead>> {
    return apiFetch<PaginatedResponse<UserRead>>('/api/admin/users', {
      query: {
        page: params?.page || 1,
        limit: params?.limit || 100,
        search: params?.search,
        active: params?.active,
        role_id: params?.role_id,
      },
    })
  }

  /**
   * Récupère tous les utilisateurs actifs (pour les selects).
   */
  async function getActiveUsers(): Promise<UserRead[]> {
    // Utiliser le cache s'il est déjà rempli
    if (usersCache.value.length > 0) {
      return usersCache.value.filter(u => u.active)
    }

    try {
      // Ne pas filtrer par active pour récupérer tous les utilisateurs
      // puis filtrer côté client (le filtre backend peut ne pas fonctionner)
      const response = await listUsers({
        limit: 500,
      })
      usersCache.value = response.items
      // Filtrer côté client pour ne garder que les actifs
      return response.items.filter(u => u.active)
    }
    catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      // Propager l'erreur pour que l'appelant puisse la gérer
      throw error
    }
  }

  /**
   * Récupère un utilisateur par son ID.
   */
  async function getUserById(id: string): Promise<UserRead> {
    return apiFetch<UserRead>(`/api/admin/users/${id}`)
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Retourne le nom complet d'un utilisateur.
   */
  function getFullName(user: UserRead | null): string {
    if (!user) return ''
    const parts = []
    if (user.salutation) parts.push(user.salutation)
    if (user.first_name) parts.push(user.first_name)
    if (user.last_name) parts.push(user.last_name)
    return parts.join(' ')
  }

  /**
   * Recherche un utilisateur dans le cache par ID.
   */
  function getUserFromCache(id: string | null): UserRead | null {
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

  return {
    // API
    listUsers,
    getActiveUsers,
    getUserById,

    // Helpers
    getFullName,
    getUserFromCache,
    getUsersForSelect,
    invalidateCache,

    // Cache
    usersCache,
  }
}
