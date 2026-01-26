import type {
  IdResponse,
  MessageResponse,
  PaginatedResponse,
  ProgramCareerOpportunityCreatePayload,
  ProgramCareerOpportunityRead,
  ProgramCareerOpportunityUpdatePayload,
} from '~/types/api'

export function useCareerOpportunitiesApi() {
  const { apiFetch } = useApi()

  /**
   * Liste les débouchés avec pagination et filtrage optionnel par programme
   */
  async function listCareerOpportunities(params: {
    page?: number
    limit?: number
    program_id?: string
  } = {}): Promise<PaginatedResponse<ProgramCareerOpportunityRead>> {
    return apiFetch<PaginatedResponse<ProgramCareerOpportunityRead>>(
      '/api/admin/career-opportunities',
      {
        query: {
          page: params.page || 1,
          limit: params.limit || 100,
          program_id: params.program_id,
        },
      },
    )
  }

  /**
   * Récupère un débouché par son ID
   */
  async function getCareerOpportunityById(
    id: string,
  ): Promise<ProgramCareerOpportunityRead> {
    return apiFetch<ProgramCareerOpportunityRead>(
      `/api/admin/career-opportunities/${id}`,
    )
  }

  /**
   * Crée un nouveau débouché
   */
  async function createCareerOpportunity(
    data: ProgramCareerOpportunityCreatePayload,
  ): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/career-opportunities', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un débouché existant
   */
  async function updateCareerOpportunity(
    id: string,
    data: ProgramCareerOpportunityUpdatePayload,
  ): Promise<ProgramCareerOpportunityRead> {
    return apiFetch<ProgramCareerOpportunityRead>(
      `/api/admin/career-opportunities/${id}`,
      {
        method: 'PUT',
        body: data,
      },
    )
  }

  /**
   * Supprime un débouché
   */
  async function deleteCareerOpportunity(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/career-opportunities/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Réorganise les débouchés (met à jour display_order)
   */
  async function reorderCareerOpportunities(
    opportunityIds: string[],
  ): Promise<ProgramCareerOpportunityRead[]> {
    return apiFetch<ProgramCareerOpportunityRead[]>(
      '/api/admin/career-opportunities/reorder',
      {
        method: 'PUT',
        body: { opportunity_ids: opportunityIds },
      },
    )
  }

  return {
    listCareerOpportunities,
    getCareerOpportunityById,
    createCareerOpportunity,
    updateCareerOpportunity,
    deleteCareerOpportunity,
    reorderCareerOpportunities,
  }
}
