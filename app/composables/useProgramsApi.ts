import type {
  IdResponse,
  MessageResponse,
  PaginatedResponse,
  ProgramCareerOpportunityRead,
  ProgramCreatePayload,
  ProgramRead,
  ProgramSkillRead,
  ProgramTranslateRequest,
  ProgramTranslateResponse,
  ProgramType,
  ProgramUpdatePayload,
  ProgramWithDetails,
  PublicationStatus,
} from '~/types/api'

/** Association programme ↔ partenaire (backoffice). */
export interface ProgramPartnerRead {
  program_id: string
  partner_external_id: string
  partnership_type: string | null
  display_order: number
}

// Labels UI
export const programTypeLabels: Record<ProgramType, string> = {
  master: 'Master',
  doctorate: 'Doctorat',
  university_diploma: 'DU',
  certificate: 'Certificat',
  clom: 'CLOM',
}

export const programTypeColors: Record<ProgramType, string> = {
  master: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  doctorate: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  university_diploma: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  certificate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  clom: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
}

export const publicationStatusLabels: Record<PublicationStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
}

export function useProgramsApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // Programs CRUD
  // =========================================================================

  async function listPrograms(params: {
    page?: number
    limit?: number
    search?: string
    type?: ProgramType | 'all'
    status?: PublicationStatus | 'all'
    sector_id?: string
  } = {}): Promise<PaginatedResponse<ProgramRead>> {
    return apiFetch<PaginatedResponse<ProgramRead>>('/api/admin/programs', {
      query: {
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || undefined,
        type: params.type !== 'all' ? params.type : undefined,
        status: params.status !== 'all' ? params.status : undefined,
        sector_external_id: params.sector_id || undefined,
      },
    })
  }

  async function getProgramById(id: string): Promise<ProgramWithDetails> {
    return apiFetch<ProgramWithDetails>(`/api/admin/programs/${id}`)
  }

  async function createProgram(data: ProgramCreatePayload): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/programs', {
      method: 'POST',
      body: data,
    })
  }

  async function updateProgram(id: string, data: ProgramUpdatePayload): Promise<ProgramRead> {
    return apiFetch<ProgramRead>(`/api/admin/programs/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async function deleteProgram(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/programs/${id}`, {
      method: 'DELETE',
    })
  }

  async function toggleProgramStatus(id: string): Promise<ProgramRead> {
    return apiFetch<ProgramRead>(`/api/admin/programs/${id}/toggle-active`, {
      method: 'POST',
    })
  }

  async function duplicateProgram(id: string, data: {
    new_code: string
    new_title: string
    new_slug: string
  }): Promise<IdResponse> {
    return apiFetch<IdResponse>(`/api/admin/programs/${id}/duplicate`, {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Traduit les champs FR d'un programme en EN/AR (sans persistance).
   * Sert au bouton « Traduire FR → EN/AR » du formulaire admin.
   */
  async function translateProgram(data: ProgramTranslateRequest): Promise<ProgramTranslateResponse> {
    return apiFetch<ProgramTranslateResponse>('/api/admin/programs/translate', {
      method: 'POST',
      body: data,
    })
  }

  // =========================================================================
  // Skills
  // =========================================================================

  async function getSkillsByProgram(programId: string): Promise<ProgramSkillRead[]> {
    return apiFetch<ProgramSkillRead[]>(`/api/admin/programs/${programId}/skills`)
  }

  // =========================================================================
  // Career Opportunities
  // =========================================================================

  async function getCareerOpportunitiesByProgram(programId: string): Promise<ProgramCareerOpportunityRead[]> {
    return apiFetch<ProgramCareerOpportunityRead[]>(`/api/admin/programs/${programId}/career-opportunities`)
  }

  // =========================================================================
  // Media Library
  // =========================================================================

  async function getProgramAlbums(programId: string): Promise<string[]> {
    return apiFetch<string[]>(`/api/admin/programs/${programId}/media-library`)
  }

  async function addProgramAlbum(programId: string, albumId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/programs/${programId}/media-library`, {
      method: 'POST',
      query: { album_external_id: albumId },
    })
  }

  async function removeProgramAlbum(programId: string, albumId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/programs/${programId}/media-library/${albumId}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Partners
  // =========================================================================

  async function listProgramPartners(programId: string): Promise<ProgramPartnerRead[]> {
    return apiFetch<ProgramPartnerRead[]>(`/api/admin/programs/${programId}/partners`)
  }

  async function addPartnerToProgram(programId: string, data: {
    partner_external_id: string
    partnership_type?: string | null
  }): Promise<unknown> {
    return apiFetch<unknown>(`/api/admin/programs/${programId}/partners`, {
      method: 'POST',
      body: data,
    })
  }

  async function removePartnerFromProgram(programId: string, partnerExternalId: string): Promise<unknown> {
    return apiFetch<unknown>(`/api/admin/programs/${programId}/partners/${partnerExternalId}`, {
      method: 'DELETE',
    })
  }

  /** Réordonne les partenaires d'un programme (liste ordonnée d'IDs de partenaires). */
  async function reorderProgramPartners(programId: string, partnerIds: string[]): Promise<ProgramPartnerRead[]> {
    return apiFetch<ProgramPartnerRead[]>(`/api/admin/programs/${programId}/partners/reorder`, {
      method: 'PUT',
      body: { partner_ids: partnerIds },
    })
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  function formatDuration(months: number | null): string {
    if (!months) return '-'
    if (months < 12) return `${months} mois`
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return `${years} an${years > 1 ? 's' : ''}`
    return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`
  }

  function isPublished(status: PublicationStatus): boolean {
    return status === 'published'
  }

  return {
    // CRUD
    listPrograms,
    getProgramById,
    createProgram,
    updateProgram,
    deleteProgram,
    toggleProgramStatus,
    duplicateProgram,
    translateProgram,

    // Relations
    getSkillsByProgram,
    getCareerOpportunitiesByProgram,

    // Partners
    listProgramPartners,
    addPartnerToProgram,
    removePartnerFromProgram,
    reorderProgramPartners,

    // Media Library
    getProgramAlbums,
    addProgramAlbum,
    removeProgramAlbum,

    // Helpers
    formatDuration,
    isPublished,

    // Labels
    programTypeLabels,
    programTypeColors,
    publicationStatusLabels,
  }
}
