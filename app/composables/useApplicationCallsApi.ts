import type {
  ApplicationCallCreatePayload,
  ApplicationCallPublic,
  ApplicationCallPublicWithDetails,
  ApplicationCallRead,
  ApplicationCallUpdatePayload,
  ApplicationCallWithDetails,
  CallCoverageCreate,
  CallCoverageRead,
  CallEligibilityCriteriaCreate,
  CallEligibilityCriteriaRead,
  CallRequiredDocumentCreate,
  CallRequiredDocumentRead,
  CallScheduleCreate,
  CallScheduleRead,
  CallStatus,
  CallType,
  IdResponse,
  MessageResponse,
  PaginatedResponse,
  PublicationStatus,
} from '~/types/api'

// Labels et couleurs UI (frontend-only)
export const callTypeLabels: Record<CallType, string> = {
  application: 'Candidature',
  scholarship: 'Bourse',
  project: 'Projet',
  recruitment: 'Recrutement',
  training: 'Formation',
}

export const callTypeColors: Record<CallType, string> = {
  application: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  scholarship: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  project: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  recruitment: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  training: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
}

export const callStatusLabels: Record<CallStatus, string> = {
  upcoming: 'À venir',
  ongoing: 'En cours',
  closed: 'Fermé',
}

export const callStatusColors: Record<CallStatus, string> = {
  upcoming: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ongoing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export const publicationStatusLabels: Record<PublicationStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
}

export const publicationStatusColors: Record<PublicationStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export function useApplicationCallsApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // Application Calls CRUD
  // =========================================================================

  async function listCalls(params: {
    page?: number
    limit?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    search?: string
    call_type?: CallType | 'all'
    call_status?: CallStatus | 'all'
    publication_status?: PublicationStatus | 'all'
    campus_external_id?: string
  } = {}): Promise<PaginatedResponse<ApplicationCallRead>> {
    return apiFetch<PaginatedResponse<ApplicationCallRead>>('/api/admin/application-calls', {
      query: {
        page: params.page || 1,
        limit: params.limit || 20,
        sort_by: params.sort_by || 'created_at',
        sort_order: params.sort_order || 'desc',
        search: params.search || undefined,
        call_type: params.call_type !== 'all' ? params.call_type : undefined,
        call_status: params.call_status !== 'all' ? params.call_status : undefined,
        publication_status: params.publication_status !== 'all' ? params.publication_status : undefined,
        campus_external_id: params.campus_external_id || undefined,
      },
    })
  }

  // API publique (sans authentification admin)
  async function listPublicCalls(params: {
    page?: number
    limit?: number
    call_type?: CallType | 'all'
    call_status?: CallStatus | 'all'
    campus_external_id?: string
  } = {}): Promise<PaginatedResponse<ApplicationCallPublic>> {
    return apiFetch<PaginatedResponse<ApplicationCallPublic>>('/api/public/application-calls', {
      query: {
        page: params.page || 1,
        limit: params.limit || 20,
        call_type: params.call_type !== 'all' ? params.call_type : undefined,
        call_status: params.call_status !== 'all' ? params.call_status : undefined,
        campus_external_id: params.campus_external_id || undefined,
      },
    })
  }

  async function getPublicCallBySlug(slug: string): Promise<ApplicationCallPublicWithDetails> {
    return apiFetch<ApplicationCallPublicWithDetails>(`/api/public/application-calls/${slug}`)
  }

  async function getCallById(id: string): Promise<ApplicationCallWithDetails> {
    return apiFetch<ApplicationCallWithDetails>(`/api/admin/application-calls/${id}`)
  }

  async function createCall(data: ApplicationCallCreatePayload): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/application-calls', {
      method: 'POST',
      body: data,
    })
  }

  async function updateCall(id: string, data: ApplicationCallUpdatePayload): Promise<ApplicationCallRead> {
    return apiFetch<ApplicationCallRead>(`/api/admin/application-calls/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async function deleteCall(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/application-calls/${id}`, {
      method: 'DELETE',
    })
  }

  async function togglePublication(id: string): Promise<ApplicationCallRead> {
    return apiFetch<ApplicationCallRead>(`/api/admin/application-calls/${id}/toggle-publication`, {
      method: 'POST',
    })
  }

  async function updateCallStatus(id: string, newStatus: CallStatus): Promise<ApplicationCallRead> {
    return apiFetch<ApplicationCallRead>(`/api/admin/application-calls/${id}/status`, {
      method: 'POST',
      query: { new_status: newStatus },
    })
  }

  // =========================================================================
  // Eligibility Criteria
  // =========================================================================

  async function addCriterion(callId: string, data: CallEligibilityCriteriaCreate): Promise<CallEligibilityCriteriaRead> {
    return apiFetch<CallEligibilityCriteriaRead>(`/api/admin/application-calls/${callId}/criteria`, {
      method: 'POST',
      body: data,
    })
  }

  async function deleteCriterion(callId: string, criterionId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/application-calls/${callId}/criteria/${criterionId}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Coverage
  // =========================================================================

  async function addCoverage(callId: string, data: CallCoverageCreate): Promise<CallCoverageRead> {
    return apiFetch<CallCoverageRead>(`/api/admin/application-calls/${callId}/coverage`, {
      method: 'POST',
      body: data,
    })
  }

  async function deleteCoverage(callId: string, coverageId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/application-calls/${callId}/coverage/${coverageId}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Required Documents
  // =========================================================================

  async function addRequiredDocument(callId: string, data: CallRequiredDocumentCreate): Promise<CallRequiredDocumentRead> {
    return apiFetch<CallRequiredDocumentRead>(`/api/admin/application-calls/${callId}/required-documents`, {
      method: 'POST',
      body: data,
    })
  }

  async function deleteRequiredDocument(callId: string, documentId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/application-calls/${callId}/required-documents/${documentId}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Schedule
  // =========================================================================

  async function addScheduleItem(callId: string, data: CallScheduleCreate): Promise<CallScheduleRead> {
    return apiFetch<CallScheduleRead>(`/api/admin/application-calls/${callId}/schedule`, {
      method: 'POST',
      body: data,
    })
  }

  async function deleteScheduleItem(callId: string, scheduleId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/application-calls/${callId}/schedule/${scheduleId}`, {
      method: 'DELETE',
    })
  }

  return {
    // CRUD principal (admin)
    listCalls,
    getCallById,
    createCall,
    updateCall,
    deleteCall,
    togglePublication,
    updateCallStatus,

    // API publique (front-office)
    listPublicCalls,
    getPublicCallBySlug,

    // Sous-entités
    addCriterion,
    deleteCriterion,
    addCoverage,
    deleteCoverage,
    addRequiredDocument,
    deleteRequiredDocument,
    addScheduleItem,
    deleteScheduleItem,

    // Labels / couleurs UI
    callTypeLabels,
    callTypeColors,
    callStatusLabels,
    callStatusColors,
    publicationStatusLabels,
    publicationStatusColors,
  }
}
