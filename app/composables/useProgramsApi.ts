import type {
  IdResponse,
  MessageResponse,
  PaginatedResponse,
  ProgramCareerOpportunityRead,
  ProgramCreatePayload,
  ProgramRead,
  ProgramSkillRead,
  ProgramType,
  ProgramUpdatePayload,
  ProgramWithDetails,
  PublicationStatus,
} from '~/types/api'

// Labels UI
export const programTypeLabels: Record<ProgramType, string> = {
  master: 'Master',
  doctorate: 'Doctorat',
  university_diploma: 'DU',
  certificate: 'Certificat',
}

export const programTypeColors: Record<ProgramType, string> = {
  master: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  doctorate: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  university_diploma: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  certificate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
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

    // Relations
    getSkillsByProgram,
    getCareerOpportunitiesByProgram,

    // Helpers
    formatDuration,
    isPublished,

    // Labels
    programTypeLabels,
    programTypeColors,
    publicationStatusLabels,
  }
}
