/**
 * Composable API - Partenaires Admin
 * ===================================
 *
 * Gestion des partenaires via l'API backend FastAPI.
 */

import type {
  IdResponse,
  MessageResponse,
  PaginatedResponse,
  PartnerCreate,
  PartnerRead,
  PartnerReorder,
  PartnerType,
  PartnerUpdate,
} from '~/types/api'

// ============================================================================
// Types Display (enrichis pour le frontend)
// ============================================================================

export interface PartnerDisplay extends PartnerRead {
  // Infos du pays résolues (optionnelles)
  country?: {
    id: string
    name: string
    flag: string
  } | null
  // Compteurs d'associations (calculés côté frontend si nécessaire)
  campuses_count: number
  projects_count: number
  events_count: number
}

export interface PartnerStats {
  total: number
  active: number
  byType: Array<{ type: PartnerType, count: number }>
  totalAssociations: number
}

export interface PartnerFilters {
  search?: string
  partner_type?: PartnerType
  country_id?: string
  active?: boolean
}

export interface PartnerAssociations {
  campuses: Array<{ id: string, name: string }>
  projects: Array<{ id: string, title: string }>
  events: Array<{ id: string, title: string }>
  total: number
  can_delete: boolean
}

// ============================================================================
// Labels et couleurs
// ============================================================================

export const partnerTypeLabels: Record<PartnerType, string> = {
  charter_operator: 'Opérateur de la charte',
  campus_partner: 'Partenaire de campus',
  program_partner: 'Partenaire académique',
  project_partner: 'Partenaire de projet',
  other: 'Autre',
}

export const partnerTypeColors: Record<PartnerType, string> = {
  charter_operator: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  campus_partner: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  program_partner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  project_partner: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export const partnerTypes: Array<{ value: PartnerType, label: string }> = [
  { value: 'charter_operator', label: 'Opérateur de la charte' },
  { value: 'campus_partner', label: 'Partenaire de campus' },
  { value: 'program_partner', label: 'Partenaire académique' },
  { value: 'project_partner', label: 'Partenaire de projet' },
  { value: 'other', label: 'Autre' },
]

// ============================================================================
// Composable
// ============================================================================

export function usePartnersApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // Transformations
  // =========================================================================

  /**
   * Transforme PartnerRead (backend) vers PartnerDisplay (frontend).
   */
  function transformToDisplay(partner: PartnerRead): PartnerDisplay {
    return {
      ...partner,
      country: null, // Sera enrichi si besoin via un autre appel
      campuses_count: 0,
      projects_count: 0,
      events_count: 0,
    }
  }

  // =========================================================================
  // CRUD Partners
  // =========================================================================

  /**
   * Liste les partenaires avec pagination et filtres.
   */
  async function listPartners(params: PartnerFilters & {
    page?: number
    limit?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  } = {}): Promise<PaginatedResponse<PartnerDisplay>> {
    const response = await apiFetch<PaginatedResponse<PartnerRead>>('/api/admin/partners', {
      query: {
        page: params.page || 1,
        limit: params.limit || 100,
        search: params.search,
        partner_type: params.partner_type,
        country_id: params.country_id,
        active: params.active,
        sort_by: params.sort_by || 'display_order',
        sort_order: params.sort_order || 'asc',
      },
    })

    return {
      ...response,
      items: response.items.map(p => transformToDisplay(p)),
    }
  }

  /**
   * Récupère tous les partenaires.
   */
  async function getAllPartners(): Promise<PartnerDisplay[]> {
    const response = await listPartners({ limit: 100 })
    return response.items
  }

  /**
   * Récupère un partenaire par son ID.
   */
  async function getPartnerById(id: string): Promise<PartnerDisplay> {
    const partner = await apiFetch<PartnerRead>(`/api/admin/partners/${id}`)
    return transformToDisplay(partner)
  }

  /**
   * Crée un nouveau partenaire.
   */
  async function createPartner(data: PartnerCreate): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/partners', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un partenaire.
   */
  async function updatePartner(id: string, data: PartnerUpdate): Promise<PartnerRead> {
    return apiFetch<PartnerRead>(`/api/admin/partners/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un partenaire.
   */
  async function deletePartner(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/partners/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Bascule le statut actif d'un partenaire.
   */
  async function togglePartnerActive(id: string): Promise<PartnerRead> {
    return apiFetch<PartnerRead>(`/api/admin/partners/${id}/toggle-active`, {
      method: 'POST',
    })
  }

  /**
   * Réordonne les partenaires.
   */
  async function reorderPartners(partnerIds: string[]): Promise<PartnerRead[]> {
    return apiFetch<PartnerRead[]>('/api/admin/partners/reorder', {
      method: 'PUT',
      body: { partner_ids: partnerIds } as PartnerReorder,
    })
  }

  // =========================================================================
  // Statistics
  // =========================================================================

  /**
   * Calcule les statistiques des partenaires.
   */
  async function getPartnersStats(): Promise<PartnerStats> {
    const partners = await getAllPartners()

    const byType: Array<{ type: PartnerType, count: number }> = []
    const typeCounts: Record<string, number> = {}

    for (const partner of partners) {
      typeCounts[partner.type] = (typeCounts[partner.type] || 0) + 1
    }

    for (const [type, count] of Object.entries(typeCounts)) {
      byType.push({ type: type as PartnerType, count })
    }

    return {
      total: partners.length,
      active: partners.filter(p => p.active).length,
      byType,
      totalAssociations: partners.reduce(
        (sum, p) => sum + p.campuses_count + p.projects_count + p.events_count,
        0,
      ),
    }
  }

  /**
   * Récupère les associations d'un partenaire (campus et projets).
   */
  async function getPartnerAssociations(id: string): Promise<PartnerAssociations> {
    try {
      const response = await apiFetch<{
        campuses: Array<{ id: string, name: string, code: string }>
        projects: Array<{ id: string, title: string, role: string | null }>
        campuses_count: number
        projects_count: number
      }>(`/api/admin/partners/${id}/associations`)

      return {
        campuses: response.campuses,
        projects: response.projects.map(p => ({ id: p.id, title: p.title })),
        events: [], // Pas encore implémenté
        total: response.campuses_count + response.projects_count,
        can_delete: response.campuses_count + response.projects_count === 0,
      }
    }
    catch {
      return {
        campuses: [],
        projects: [],
        events: [],
        total: 0,
        can_delete: true,
      }
    }
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Génère un nouvel ID (côté client, pour le mock uniquement).
   * En réalité, l'ID est généré par le backend.
   */
  function generatePartnerId(): string {
    return self.crypto?.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('')
  }

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

  return {
    // CRUD Partners
    listPartners,
    getAllPartners,
    getPartnerById,
    createPartner,
    updatePartner,
    deletePartner,
    togglePartnerActive,
    reorderPartners,

    // Statistics
    getPartnersStats,
    getPartnerAssociations,

    // Transformations
    transformToDisplay,

    // Helpers
    generatePartnerId,
    formatDate,

    // Labels et couleurs
    partnerTypeLabels,
    partnerTypeColors,
    partnerTypes,
  }
}
