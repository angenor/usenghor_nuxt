/**
 * Composable API - Équipes Campus Admin
 * =====================================
 *
 * Gestion des membres d'équipe des campus via l'API backend FastAPI.
 * Aligné sur le schéma SQL: campus_team (05_campus.sql)
 */

import type {
  IdResponse,
  MessageResponse,
  PaginatedResponse,
} from '~/types/api'

// ============================================================================
// Types Backend (alignés sur les schemas Pydantic)
// ============================================================================

export interface CampusTeamRead {
  id: string
  campus_id: string
  user_external_id: string
  position: string
  display_order: number
  start_date: string | null
  end_date: string | null
  active: boolean
}

export interface CampusTeamCreate {
  campus_id: string
  user_external_id: string
  position: string
  display_order?: number
  start_date?: string | null
  end_date?: string | null
  active?: boolean
}

export interface CampusTeamUpdate {
  user_external_id?: string
  position?: string
  display_order?: number
  start_date?: string | null
  end_date?: string | null
  active?: boolean
}

export interface CampusTeamReorder {
  team_member_ids: string[]
}

export interface CampusRead {
  id: string
  code: string
  name: string
  description: string | null
  country_external_id: string | null
  city: string | null
  email: string | null
  phone: string | null
  is_headquarters: boolean
  active: boolean
}

// ============================================================================
// Types Display (enrichis pour le frontend)
// ============================================================================

export interface CampusTeamUser {
  id: string
  first_name: string
  last_name: string
  email: string
  photo_url?: string | null
  salutation?: string | null
}

export interface CampusTeamMemberDisplay extends CampusTeamRead {
  user: CampusTeamUser
  campus_name?: string
  campus_code?: string
}

export interface CampusTeamStats {
  total: number
  active: number
  inactive: number
  by_campus: Record<string, number>
}

export interface CampusTeamFilters {
  campus_id?: string
  active?: boolean
  search?: string
  sort_by?: 'display_order' | 'name' | 'position' | 'start_date'
  sort_order?: 'asc' | 'desc'
}

export interface CampusForSelect {
  id: string
  name: string
  code: string
  is_headquarters: boolean
  country_code?: string
}

// ============================================================================
// Positions communes suggérées
// ============================================================================

export const commonPositions = [
  'Recteur',
  'Rectrice',
  'Vice-Recteur',
  'Vice-Rectrice',
  'Secrétaire Général',
  'Secrétaire Générale',
  'Directeur du campus',
  'Directrice du campus',
  'Vice-Directeur',
  'Vice-Directrice',
  'Coordinateur pédagogique',
  'Coordinatrice pédagogique',
  'Responsable administratif',
  'Responsable administrative',
  'Responsable des partenariats',
  'Responsable des admissions',
  'Coordinateur des formations',
  'Coordinatrice des formations',
  'Assistant administratif',
  'Assistante administrative',
  'Directeur des Études',
  'Directrice des Études',
  'Responsable Administratif et Financier',
]

// ============================================================================
// Composable
// ============================================================================

export function useCampusTeamApi() {
  const { apiFetch } = useApi()

  // Cache pour les campus
  const campusesCache = ref<Map<string, CampusRead>>(new Map())

  // Cache pour les utilisateurs
  const usersCache = ref<Map<string, CampusTeamUser>>(new Map())

  // =========================================================================
  // Helpers - Chargement des données de référence
  // =========================================================================

  /**
   * Charge et cache les campus.
   */
  async function loadCampuses(): Promise<Map<string, CampusRead>> {
    if (campusesCache.value.size > 0) {
      return campusesCache.value
    }

    try {
      const response = await apiFetch<PaginatedResponse<CampusRead>>('/api/admin/campuses', {
        query: { limit: 100 },
      })
      if (response?.items) {
        for (const campus of response.items) {
          campusesCache.value.set(campus.id, campus)
        }
      }
    }
    catch (error) {
      console.error('Erreur lors du chargement des campus:', error)
    }

    return campusesCache.value
  }

  /**
   * Charge et cache les utilisateurs.
   */
  async function loadUsers(): Promise<Map<string, CampusTeamUser>> {
    if (usersCache.value.size > 0) {
      return usersCache.value
    }

    try {
      const response = await apiFetch<PaginatedResponse<{
        id: string
        first_name: string
        last_name: string
        email: string
        photo_external_id?: string | null
        salutation?: string | null
      }>>('/api/admin/users', {
        query: { limit: 200, active: true },
      })
      if (response?.items) {
        for (const user of response.items) {
          usersCache.value.set(user.id, {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            photo_url: user.photo_external_id
              ? `/api/public/media/${user.photo_external_id}/download?variant=low`
              : null,
            salutation: user.salutation,
          })
        }
      }
    }
    catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    }

    return usersCache.value
  }

  /**
   * Récupère les campus pour les dropdowns.
   */
  async function getCampusesForSelect(): Promise<CampusForSelect[]> {
    await loadCampuses()

    return Array.from(campusesCache.value.values())
      .filter(c => c.active)
      .map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        is_headquarters: c.is_headquarters,
      }))
      .sort((a, b) => {
        // Siège en premier, puis par nom
        if (a.is_headquarters && !b.is_headquarters) return -1
        if (!a.is_headquarters && b.is_headquarters) return 1
        return a.name.localeCompare(b.name)
      })
  }

  /**
   * Recherche des utilisateurs pour l'autocomplétion.
   */
  async function searchUsers(query: string): Promise<CampusTeamUser[]> {
    if (!query || query.length < 2) {
      return []
    }

    try {
      const response = await apiFetch<PaginatedResponse<{
        id: string
        first_name: string
        last_name: string
        email: string
        photo_external_id?: string | null
        salutation?: string | null
      }>>('/api/admin/users', {
        query: { search: query, limit: 10, active: true },
      })

      return response.items.map(user => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        photo_url: user.photo_external_id
          ? `/api/public/media/${user.photo_external_id}/download?variant=low`
          : null,
        salutation: user.salutation,
      }))
    }
    catch (error) {
      console.error('Erreur lors de la recherche des utilisateurs:', error)
      return []
    }
  }

  // =========================================================================
  // Transformation des données
  // =========================================================================

  /**
   * Enrichit un membre d'équipe avec les données utilisateur et campus.
   */
  function enrichMember(
    member: CampusTeamRead,
    users: Map<string, CampusTeamUser>,
    campuses: Map<string, CampusRead>,
  ): CampusTeamMemberDisplay {
    const user = users.get(member.user_external_id)
    const campus = campuses.get(member.campus_id)

    return {
      ...member,
      user: user || {
        id: member.user_external_id,
        first_name: 'Utilisateur',
        last_name: 'inconnu',
        email: '',
        photo_url: null,
      },
      campus_name: campus?.name,
      campus_code: campus?.code,
    }
  }

  // =========================================================================
  // CRUD Team Members
  // =========================================================================

  /**
   * Liste les membres d'équipe avec pagination et filtres.
   */
  async function listTeamMembers(params: CampusTeamFilters & {
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<CampusTeamMemberDisplay>> {
    // Charger les données de référence en parallèle
    const [campuses, users] = await Promise.all([
      loadCampuses(),
      loadUsers(),
    ])

    const response = await apiFetch<PaginatedResponse<CampusTeamRead>>('/api/admin/campus-team', {
      query: {
        page: params.page || 1,
        limit: params.limit || 100,
        campus_id: params.campus_id,
        active: params.active,
      },
    })

    // Enrichir les membres avec les données utilisateur
    const enrichedMembers = response.items.map(member =>
      enrichMember(member, users, campuses),
    )

    // Filtrage côté client (recherche)
    let filteredMembers = enrichedMembers
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      filteredMembers = enrichedMembers.filter((member) => {
        const fullName = `${member.user.first_name} ${member.user.last_name}`.toLowerCase()
        return (
          fullName.includes(searchLower)
          || member.user.email.toLowerCase().includes(searchLower)
          || member.position.toLowerCase().includes(searchLower)
        )
      })
    }

    // Tri côté client
    if (params.sort_by) {
      filteredMembers.sort((a, b) => {
        let comparison = 0
        switch (params.sort_by) {
          case 'name':
            comparison = `${a.user.first_name} ${a.user.last_name}`.localeCompare(
              `${b.user.first_name} ${b.user.last_name}`,
            )
            break
          case 'position':
            comparison = a.position.localeCompare(b.position)
            break
          case 'start_date':
            comparison = (a.start_date || '').localeCompare(b.start_date || '')
            break
          case 'display_order':
          default:
            comparison = a.display_order - b.display_order
        }
        return params.sort_order === 'desc' ? -comparison : comparison
      })
    }

    return {
      ...response,
      items: filteredMembers,
      total: filteredMembers.length,
    }
  }

  /**
   * Récupère tous les membres d'équipe.
   */
  async function getAllTeamMembers(): Promise<CampusTeamMemberDisplay[]> {
    const response = await listTeamMembers({ limit: 200 })
    return response.items
  }

  /**
   * Récupère un membre d'équipe par son ID.
   */
  async function getTeamMemberById(id: string): Promise<CampusTeamMemberDisplay> {
    const [campuses, users] = await Promise.all([
      loadCampuses(),
      loadUsers(),
    ])

    const member = await apiFetch<CampusTeamRead>(`/api/admin/campus-team/${id}`)
    return enrichMember(member, users, campuses)
  }

  /**
   * Crée un nouveau membre d'équipe.
   */
  async function createTeamMember(data: CampusTeamCreate): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/campus-team', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un membre d'équipe.
   */
  async function updateTeamMember(id: string, data: CampusTeamUpdate): Promise<CampusTeamRead> {
    return apiFetch<CampusTeamRead>(`/api/admin/campus-team/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un membre d'équipe.
   */
  async function deleteTeamMember(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/campus-team/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Bascule le statut actif d'un membre d'équipe.
   */
  async function toggleTeamMemberActive(id: string): Promise<CampusTeamRead> {
    return apiFetch<CampusTeamRead>(`/api/admin/campus-team/${id}/toggle-active`, {
      method: 'POST',
    })
  }

  /**
   * Réordonne les membres d'équipe.
   */
  async function reorderTeamMembers(teamMemberIds: string[]): Promise<CampusTeamRead[]> {
    return apiFetch<CampusTeamRead[]>('/api/admin/campus-team/reorder', {
      method: 'PUT',
      body: { team_member_ids: teamMemberIds } as CampusTeamReorder,
    })
  }

  // =========================================================================
  // Statistiques
  // =========================================================================

  /**
   * Calcule les statistiques des équipes.
   */
  async function getTeamStats(): Promise<CampusTeamStats> {
    const members = await getAllTeamMembers()

    const stats: CampusTeamStats = {
      total: members.length,
      active: 0,
      inactive: 0,
      by_campus: {},
    }

    for (const member of members) {
      if (member.active) {
        stats.active++
      }
      else {
        stats.inactive++
      }

      const campusKey = member.campus_id
      stats.by_campus[campusKey] = (stats.by_campus[campusKey] || 0) + 1
    }

    return stats
  }

  /**
   * Compte les membres par campus.
   */
  async function countMembersByCampus(campusId: string, activeOnly = false): Promise<number> {
    const members = await getAllTeamMembers()
    return members.filter(
      m => m.campus_id === campusId && (!activeOnly || m.active),
    ).length
  }

  // =========================================================================
  // Helpers d'affichage
  // =========================================================================

  /**
   * Formate une date en français.
   */
  function formatDate(dateString: string | null): string {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  /**
   * Retourne le nom complet d'un utilisateur.
   */
  function getFullName(user: CampusTeamUser): string {
    if (user.salutation) {
      return `${user.salutation} ${user.first_name} ${user.last_name}`
    }
    return `${user.first_name} ${user.last_name}`
  }

  /**
   * Génère l'emoji du drapeau à partir du code pays ISO.
   */
  function getFlagEmoji(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) return ''
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  /**
   * Invalide le cache pour forcer un rechargement.
   */
  function invalidateCache() {
    campusesCache.value.clear()
    usersCache.value.clear()
  }

  // =========================================================================
  // Export
  // =========================================================================

  return {
    // CRUD
    listTeamMembers,
    getAllTeamMembers,
    getTeamMemberById,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    toggleTeamMemberActive,
    reorderTeamMembers,

    // Données de référence
    getCampusesForSelect,
    searchUsers,
    loadCampuses,
    loadUsers,

    // Statistiques
    getTeamStats,
    countMembersByCampus,

    // Helpers
    formatDate,
    getFullName,
    getFlagEmoji,
    invalidateCache,

    // Constantes
    commonPositions,

    // Cache (pour enrichissement externe si besoin)
    campusesCache,
    usersCache,
  }
}
