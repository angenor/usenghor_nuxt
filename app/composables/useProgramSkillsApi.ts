import type {
  IdResponse,
  MessageResponse,
  PaginatedResponse,
  ProgramSkillCreatePayload,
  ProgramSkillRead,
  ProgramSkillUpdatePayload,
} from '~/types/api'

export function useProgramSkillsApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // Skills CRUD
  // =========================================================================

  /**
   * Liste les compétences avec pagination et filtre optionnel par programme
   */
  async function listSkills(params: {
    page?: number
    limit?: number
    program_id?: string
  } = {}): Promise<PaginatedResponse<ProgramSkillRead>> {
    return apiFetch<PaginatedResponse<ProgramSkillRead>>('/api/admin/program-skills', {
      query: {
        page: params.page || 1,
        limit: params.limit || 100,
        program_id: params.program_id || undefined,
      },
    })
  }

  /**
   * Récupère une compétence par son ID
   */
  async function getSkillById(skillId: string): Promise<ProgramSkillRead> {
    return apiFetch<ProgramSkillRead>(`/api/admin/program-skills/${skillId}`)
  }

  /**
   * Crée une nouvelle compétence
   */
  async function createSkill(data: ProgramSkillCreatePayload): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/program-skills', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour une compétence existante
   */
  async function updateSkill(skillId: string, data: ProgramSkillUpdatePayload): Promise<ProgramSkillRead> {
    return apiFetch<ProgramSkillRead>(`/api/admin/program-skills/${skillId}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime une compétence
   */
  async function deleteSkill(skillId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/program-skills/${skillId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Réordonne les compétences d'un programme
   * @param skillIds Liste ordonnée des IDs de compétences
   */
  async function reorderSkills(skillIds: string[]): Promise<ProgramSkillRead[]> {
    return apiFetch<ProgramSkillRead[]>('/api/admin/program-skills/reorder', {
      method: 'PUT',
      body: { skill_ids: skillIds },
    })
  }

  return {
    listSkills,
    getSkillById,
    createSkill,
    updateSkill,
    deleteSkill,
    reorderSkills,
  }
}
