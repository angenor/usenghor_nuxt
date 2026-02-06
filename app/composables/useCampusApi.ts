/**
 * Composable API - Campus Admin
 * ==============================
 *
 * Gestion des campus via l'API backend FastAPI.
 * Aligné sur le schéma SQL: campuses (05_campus.sql)
 */

import type {
  IdResponse,
  MessageResponse,
  PaginatedResponse,
} from '~/types/api'

// ============================================================================
// Types Backend (alignés sur les schemas Pydantic)
// ============================================================================

export interface CampusRead {
  id: string
  code: string
  name: string
  description: string | null
  cover_image_external_id: string | null
  country_external_id: string | null
  head_external_id: string | null
  album_external_id: string | null
  email: string | null
  phone: string | null
  city: string | null
  address: string | null
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  is_headquarters: boolean
  active: boolean
  created_at: string
  updated_at: string
}

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

export interface CampusWithTeam extends CampusRead {
  team_members: CampusTeamRead[]
}

export interface CampusPartnerRead {
  campus_id: string
  partner_external_id: string
  start_date: string | null
  end_date: string | null
}

export interface CampusCreate {
  code: string
  name: string
  description?: string | null
  cover_image_external_id?: string | null
  country_external_id?: string | null
  head_external_id?: string | null
  album_external_id?: string | null
  email?: string | null
  phone?: string | null
  city?: string | null
  address?: string | null
  postal_code?: string | null
  latitude?: number | null
  longitude?: number | null
  is_headquarters?: boolean
  active?: boolean
}

export interface CampusUpdate {
  code?: string
  name?: string
  description?: string | null
  cover_image_external_id?: string | null
  country_external_id?: string | null
  head_external_id?: string | null
  album_external_id?: string | null
  email?: string | null
  phone?: string | null
  city?: string | null
  address?: string | null
  postal_code?: string | null
  latitude?: number | null
  longitude?: number | null
  is_headquarters?: boolean
  active?: boolean
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

export interface CampusPartnerCreate {
  partner_external_id: string
  start_date?: string | null
  end_date?: string | null
}

export interface CampusPartnerUpdate {
  start_date?: string | null
  end_date?: string | null
}

// ============================================================================
// Types Filters & Stats
// ============================================================================

export interface CampusFilters {
  search?: string
  country_id?: string
  active?: boolean
  is_headquarters?: boolean
}

export interface CampusStats {
  total: number
  active: number
  inactive: number
  headquarters: number
  byCountry: Record<string, number>
  totalTeamMembers: number
  totalPartners: number
}

// ============================================================================
// Composable
// ============================================================================

export function useCampusApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // CRUD Campus
  // =========================================================================

  /**
   * Liste les campus avec pagination et filtres.
   */
  async function listCampuses(params: CampusFilters & {
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<CampusRead>> {
    return apiFetch<PaginatedResponse<CampusRead>>('/api/admin/campuses', {
      query: {
        page: params.page || 1,
        limit: params.limit || 100,
        search: params.search,
        country_id: params.country_id,
        active: params.active,
        is_headquarters: params.is_headquarters,
      },
    })
  }

  /**
   * Récupère tous les campus.
   */
  async function getAllCampuses(params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<CampusRead>> {
    return listCampuses({
      page: params?.page || 1,
      limit: params?.limit || 100,
    })
  }

  /**
   * Récupère un campus par son ID avec son équipe.
   */
  async function getCampusById(id: string): Promise<CampusWithTeam> {
    return apiFetch<CampusWithTeam>(`/api/admin/campuses/${id}`)
  }

  /**
   * Crée un nouveau campus.
   */
  async function createCampus(data: CampusCreate): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/campuses', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un campus.
   */
  async function updateCampus(id: string, data: CampusUpdate): Promise<CampusRead> {
    return apiFetch<CampusRead>(`/api/admin/campuses/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un campus.
   */
  async function deleteCampus(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/campuses/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Bascule le statut actif d'un campus.
   */
  async function toggleCampusActive(id: string): Promise<CampusRead> {
    return apiFetch<CampusRead>(`/api/admin/campuses/${id}/toggle-active`, {
      method: 'POST',
    })
  }

  // =========================================================================
  // Campus Team
  // =========================================================================

  /**
   * Récupère l'équipe d'un campus.
   */
  async function getCampusTeam(campusId: string, active?: boolean): Promise<CampusTeamRead[]> {
    return apiFetch<CampusTeamRead[]>(`/api/admin/campuses/${campusId}/team`, {
      query: { active },
    })
  }

  /**
   * Ajoute un membre à l'équipe d'un campus.
   */
  async function addCampusTeamMember(
    campusId: string,
    data: Omit<CampusTeamCreate, 'campus_id'>,
  ): Promise<IdResponse> {
    return apiFetch<IdResponse>(`/api/admin/campuses/${campusId}/team`, {
      method: 'POST',
      body: { ...data, campus_id: campusId },
    })
  }

  /**
   * Met à jour un membre de l'équipe d'un campus.
   */
  async function updateCampusTeamMember(
    campusId: string,
    memberId: string,
    data: CampusTeamUpdate,
  ): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/campuses/${campusId}/team/${memberId}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un membre de l'équipe d'un campus.
   */
  async function deleteCampusTeamMember(
    campusId: string,
    memberId: string,
  ): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/campuses/${campusId}/team/${memberId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Récupère l'affectation campus d'un utilisateur.
   */
  async function getUserCampusAffectation(userId: string): Promise<CampusTeamRead | null> {
    try {
      const response = await apiFetch<CampusTeamRead[]>(`/api/admin/campuses/team/user/${userId}`)
      return response.length > 0 ? (response[0] ?? null) : null
    }
    catch {
      return null
    }
  }

  // =========================================================================
  // Campus Partners
  // =========================================================================

  /**
   * Récupère les partenaires d'un campus.
   */
  async function getCampusPartners(campusId: string): Promise<CampusPartnerRead[]> {
    return apiFetch<CampusPartnerRead[]>(`/api/admin/campuses/${campusId}/partners`)
  }

  /**
   * Ajoute un partenaire à un campus.
   */
  async function addCampusPartner(
    campusId: string,
    data: CampusPartnerCreate,
  ): Promise<CampusPartnerRead> {
    return apiFetch<CampusPartnerRead>(`/api/admin/campuses/${campusId}/partners`, {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un partenariat.
   */
  async function updateCampusPartner(
    campusId: string,
    partnerId: string,
    data: CampusPartnerUpdate,
  ): Promise<CampusPartnerRead> {
    return apiFetch<CampusPartnerRead>(
      `/api/admin/campuses/${campusId}/partners/${partnerId}`,
      {
        method: 'PUT',
        body: data,
      },
    )
  }

  /**
   * Retire un partenaire d'un campus.
   */
  async function removeCampusPartner(
    campusId: string,
    partnerId: string,
  ): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(
      `/api/admin/campuses/${campusId}/partners/${partnerId}`,
      {
        method: 'DELETE',
      },
    )
  }

  // =========================================================================
  // Campus Media Library
  // =========================================================================

  /**
   * Récupère les IDs d'albums de la médiathèque d'un campus.
   */
  async function getCampusAlbums(campusId: string): Promise<string[]> {
    return apiFetch<string[]>(`/api/admin/campuses/${campusId}/media-library`)
  }

  /**
   * Ajoute un album à la médiathèque d'un campus.
   */
  async function addCampusAlbum(
    campusId: string,
    albumId: string,
  ): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/campuses/${campusId}/media-library`, {
      method: 'POST',
      body: { album_external_id: albumId },
    })
  }

  /**
   * Retire un album de la médiathèque d'un campus.
   */
  async function removeCampusAlbum(
    campusId: string,
    albumId: string,
  ): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(
      `/api/admin/campuses/${campusId}/media-library/${albumId}`,
      {
        method: 'DELETE',
      },
    )
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Formate une date pour l'affichage.
   */
  function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  /**
   * Génère un code campus à partir du nom.
   */
  function generateCampusCode(name: string): string {
    const words = name.split(/\s+/)
    if (words.length >= 2) {
      return (words[0].substring(0, 1) + words[1].substring(0, 2)).toUpperCase()
    }
    return name.substring(0, 3).toUpperCase()
  }

  return {
    // CRUD Campus
    listCampuses,
    getAllCampuses,
    getCampusById,
    createCampus,
    updateCampus,
    deleteCampus,
    toggleCampusActive,

    // Team
    getCampusTeam,
    addCampusTeamMember,
    updateCampusTeamMember,
    deleteCampusTeamMember,
    getUserCampusAffectation,

    // Partners
    getCampusPartners,
    addCampusPartner,
    updateCampusPartner,
    removeCampusPartner,

    // Media Library
    getCampusAlbums,
    addCampusAlbum,
    removeCampusAlbum,

    // Helpers
    formatDate,
    generateCampusCode,
  }
}
