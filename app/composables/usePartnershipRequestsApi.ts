/**
 * Composable API - Demandes de partenariat
 * ==========================================
 *
 * Gestion des demandes de partenariat.
 * - Public: soumission du formulaire (sans auth)
 * - Admin: liste, approbation, rejet (avec auth)
 */

import type {
  MessageResponse,
  PaginatedResponse,
  PartnerRead,
  PartnershipRequestRead,
  PartnershipRequestStatus,
  PartnershipRequestSubmit,
  PartnershipRequestType,
} from '~/types/api'

// ============================================================================
// TYPES
// ============================================================================

export interface PartnershipRequestStatsData {
  total: number
  pending: number
  approved: number
  rejected: number
}

// ============================================================================
// Labels et couleurs
// ============================================================================

export const requestTypeLabels: Record<PartnershipRequestType, string> = {
  academic: 'Académique',
  institutional: 'Institutionnel',
  business: 'Entreprise',
  other: 'Autre',
}

export const requestTypeColors: Record<PartnershipRequestType, string> = {
  academic: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  institutional: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  business: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export const requestStatusLabels: Record<PartnershipRequestStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Rejetée',
}

export const requestStatusColors: Record<PartnershipRequestStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

// ============================================================================
// COMPOSABLE
// ============================================================================

export function usePartnershipRequestsApi() {
  const baseUrl = useApiBase()
  const { apiFetch } = useApi()

  // =========================================================================
  // PUBLIC - Soumission (sans auth)
  // =========================================================================

  async function submitRequest(data: PartnershipRequestSubmit): Promise<{ id: string, message: string }> {
    return await $fetch<{ id: string, message: string }>(
      `${baseUrl}/api/public/partnership-requests`,
      {
        method: 'POST',
        body: data,
      },
    )
  }

  // =========================================================================
  // ADMIN - CRUD (avec auth)
  // =========================================================================

  async function listRequests(params: {
    page?: number
    limit?: number
    search?: string
    status?: PartnershipRequestStatus
    type?: PartnershipRequestType
  } = {}): Promise<PaginatedResponse<PartnershipRequestRead>> {
    return await apiFetch<PaginatedResponse<PartnershipRequestRead>>(
      '/api/admin/partnership-requests',
      {
        query: {
          page: params.page || 1,
          limit: params.limit || 20,
          search: params.search || undefined,
          status: params.status || undefined,
          type: params.type || undefined,
        },
      },
    )
  }

  async function getRequestById(id: string): Promise<PartnershipRequestRead> {
    return await apiFetch<PartnershipRequestRead>(
      `/api/admin/partnership-requests/${id}`,
    )
  }

  async function getRequestStats(): Promise<PartnershipRequestStatsData> {
    return await apiFetch<PartnershipRequestStatsData>(
      '/api/admin/partnership-requests/stats',
    )
  }

  async function approveRequest(
    id: string,
    options?: { partner_type?: string, partner_name?: string },
  ): Promise<{ request: PartnershipRequestRead, partner: PartnerRead, message: string }> {
    return await apiFetch<{ request: PartnershipRequestRead, partner: PartnerRead, message: string }>(
      `/api/admin/partnership-requests/${id}/approve`,
      {
        method: 'POST',
        body: options || {},
      },
    )
  }

  async function rejectRequest(
    id: string,
    reason?: string,
  ): Promise<PartnershipRequestRead> {
    return await apiFetch<PartnershipRequestRead>(
      `/api/admin/partnership-requests/${id}/reject`,
      {
        method: 'POST',
        body: { reason },
      },
    )
  }

  async function deleteRequest(id: string): Promise<MessageResponse> {
    return await apiFetch<MessageResponse>(
      `/api/admin/partnership-requests/${id}`,
      { method: 'DELETE' },
    )
  }

  // =========================================================================
  // HELPERS
  // =========================================================================

  function formatRequestDate(dateString: string | null | undefined): string {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return {
    // Public
    submitRequest,
    // Admin CRUD
    listRequests,
    getRequestById,
    getRequestStats,
    approveRequest,
    rejectRequest,
    deleteRequest,
    // Helpers
    formatRequestDate,
  }
}
