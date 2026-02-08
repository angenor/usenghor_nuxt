import type {
  IdResponse,
  MessageResponse,
  PaginatedResponse,
  ProgramFieldCreatePayload,
  ProgramFieldRead,
  ProgramFieldUpdatePayload,
} from '~/types/api'

export function useProgramFieldsApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // Fields CRUD
  // =========================================================================

  /**
   * Liste les champs disciplinaires avec pagination
   */
  async function listFields(params: {
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<ProgramFieldRead>> {
    return apiFetch<PaginatedResponse<ProgramFieldRead>>('/api/admin/program-fields', {
      query: {
        page: params.page || 1,
        limit: params.limit || 100,
      },
    })
  }

  /**
   * Récupère un champ par son ID
   */
  async function getFieldById(fieldId: string): Promise<ProgramFieldRead> {
    return apiFetch<ProgramFieldRead>(`/api/admin/program-fields/${fieldId}`)
  }

  /**
   * Crée un nouveau champ disciplinaire
   */
  async function createField(data: ProgramFieldCreatePayload): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/program-fields', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un champ existant
   */
  async function updateField(fieldId: string, data: ProgramFieldUpdatePayload): Promise<ProgramFieldRead> {
    return apiFetch<ProgramFieldRead>(`/api/admin/program-fields/${fieldId}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un champ disciplinaire
   */
  async function deleteField(fieldId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/program-fields/${fieldId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Réordonne les champs disciplinaires
   * @param fieldIds Liste ordonnée des IDs de champs
   */
  async function reorderFields(fieldIds: string[]): Promise<ProgramFieldRead[]> {
    return apiFetch<ProgramFieldRead[]>('/api/admin/program-fields/reorder', {
      method: 'PUT',
      body: { field_ids: fieldIds },
    })
  }

  return {
    listFields,
    getFieldById,
    createField,
    updateField,
    deleteField,
    reorderFields,
  }
}
