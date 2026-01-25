import type {
  ApplicationRead,
  ApplicationStatistics,
  ApplicationStatus,
  ApplicationStatusUpdatePayload,
  ApplicationWithDetails,
  EmploymentStatus,
  ExperienceDuration,
  ExtendedApplicationStatistics,
  MaritalStatus,
  MessageResponse,
  PaginatedResponse,
  Salutation,
  StatisticsFilters,
} from '~/types/api'

// Labels UI (frontend-only)
export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  submitted: 'Soumise',
  under_review: 'En évaluation',
  accepted: 'Acceptée',
  rejected: 'Rejetée',
  waitlisted: 'Liste d\'attente',
  incomplete: 'Incomplète',
}

export const applicationStatusColors: Record<ApplicationStatus, string> = {
  submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  waitlisted: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  incomplete: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export const salutationLabels: Record<Salutation, string> = {
  Mr: 'M.',
  Mrs: 'Mme',
  Dr: 'Dr',
  Pr: 'Pr',
}

export const maritalStatusLabels: Record<MaritalStatus, string> = {
  single: 'Célibataire',
  married: 'Marié(e)',
  divorced: 'Divorcé(e)',
  widowed: 'Veuf/Veuve',
  other: 'Autre',
}

export const employmentStatusLabels: Record<EmploymentStatus, string> = {
  student: 'Étudiant(e)',
  teacher: 'Enseignant(e)',
  civil_servant: 'Fonctionnaire',
  private_employee: 'Employé(e) du privé',
  ngo_employee: 'Employé(e) ONG',
  unemployed: 'Sans emploi',
  other: 'Autre',
}

export const experienceDurationLabels: Record<ExperienceDuration, string> = {
  less_than_1_year: 'Moins d\'1 an',
  between_1_3_years: '1 à 3 ans',
  between_3_5_years: '3 à 5 ans',
  between_5_10_years: '5 à 10 ans',
  more_than_10_years: 'Plus de 10 ans',
}

export function useApplicationsApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // Applications CRUD
  // =========================================================================

  async function listApplications(params: {
    page?: number
    limit?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    search?: string
    call_id?: string | 'all'
    status?: ApplicationStatus | 'all'
    program_id?: string
  } = {}): Promise<PaginatedResponse<ApplicationRead>> {
    return apiFetch<PaginatedResponse<ApplicationRead>>('/api/admin/applications', {
      query: {
        page: params.page || 1,
        limit: params.limit || 20,
        sort_by: params.sort_by || 'submitted_at',
        sort_order: params.sort_order || 'desc',
        search: params.search || undefined,
        call_id: params.call_id !== 'all' ? params.call_id : undefined,
        status: params.status !== 'all' ? params.status : undefined,
        program_id: params.program_id || undefined,
      },
    })
  }

  async function getApplicationById(id: string): Promise<ApplicationWithDetails> {
    return apiFetch<ApplicationWithDetails>(`/api/admin/applications/${id}`)
  }

  async function deleteApplication(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/applications/${id}`, {
      method: 'DELETE',
    })
  }

  async function updateApplicationStatus(
    id: string,
    data: ApplicationStatusUpdatePayload,
  ): Promise<ApplicationRead> {
    return apiFetch<ApplicationRead>(`/api/admin/applications/${id}/status`, {
      method: 'POST',
      body: data,
    })
  }

  // =========================================================================
  // Statistics
  // =========================================================================

  async function getStatistics(callId?: string): Promise<ApplicationStatistics> {
    return apiFetch<ApplicationStatistics>('/api/admin/applications/statistics', {
      query: callId ? { call_id: callId } : undefined,
    })
  }

  async function getExtendedStatistics(
    filters: StatisticsFilters = {},
  ): Promise<ExtendedApplicationStatistics> {
    return apiFetch<ExtendedApplicationStatistics>('/api/admin/applications/statistics/extended', {
      query: {
        call_id: filters.call_id || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        granularity: filters.granularity || 'month',
      },
    })
  }

  // =========================================================================
  // Documents Validation
  // =========================================================================

  async function validateDocument(
    applicationId: string,
    documentId: string,
    isValid: boolean,
    comment?: string,
  ): Promise<unknown> {
    return apiFetch(`/api/admin/applications/${applicationId}/documents/${documentId}/validate`, {
      method: 'POST',
      query: {
        is_valid: isValid,
        comment: comment || undefined,
      },
    })
  }

  return {
    // CRUD principal
    listApplications,
    getApplicationById,
    deleteApplication,
    updateApplicationStatus,

    // Statistics
    getStatistics,
    getExtendedStatistics,

    // Documents
    validateDocument,

    // Labels / couleurs UI
    applicationStatusLabels,
    applicationStatusColors,
    salutationLabels,
    maritalStatusLabels,
    employmentStatusLabels,
    experienceDurationLabels,
  }
}
