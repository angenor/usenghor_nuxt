/**
 * Composable API - Campagnes de sondage Admin
 * =============================================
 *
 * Gestion des campagnes de sondage via l'API backend FastAPI.
 */

import type { SurveyCampaignStatus } from '~/types/survey'

// ============================================================================
// Labels et couleurs UI
// ============================================================================

export const surveyStatusLabels: Record<SurveyCampaignStatus, string> = {
  draft: 'Brouillon',
  active: 'Active',
  paused: 'En pause',
  closed: 'Clôturée',
}

export const surveyStatusColors: Record<SurveyCampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  closed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

// ============================================================================
// Composable
// ============================================================================

export function useAdminSurveyApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // Campagnes CRUD
  // =========================================================================

  async function listCampaigns(params: {
    page?: number
    limit?: number
    search?: string
    status?: string
    sort_by?: string
    sort_order?: string
  } = {}) {
    return await apiFetch<{
      items: any[]
      total: number
      page: number
      limit: number
      pages: number
    }>('/api/admin/surveys', { query: params })
  }

  async function getCampaign(id: string) {
    return await apiFetch<any>(`/api/admin/surveys/${id}`)
  }

  async function createCampaign(data: any) {
    return await apiFetch<{ id: string; message: string }>('/api/admin/surveys', {
      method: 'POST',
      body: data,
    })
  }

  async function updateCampaign(id: string, data: any) {
    return await apiFetch<any>(`/api/admin/surveys/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async function deleteCampaign(id: string) {
    return await apiFetch<{ message: string }>(`/api/admin/surveys/${id}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Lifecycle
  // =========================================================================

  async function publishCampaign(id: string) {
    return await apiFetch<any>(`/api/admin/surveys/${id}/publish`, {
      method: 'POST',
    })
  }

  async function pauseCampaign(id: string) {
    return await apiFetch<any>(`/api/admin/surveys/${id}/pause`, {
      method: 'POST',
    })
  }

  async function closeCampaign(id: string) {
    return await apiFetch<any>(`/api/admin/surveys/${id}/close`, {
      method: 'POST',
    })
  }

  async function duplicateCampaign(id: string, slug: string) {
    return await apiFetch<{ id: string; message: string }>(`/api/admin/surveys/${id}/duplicate`, {
      method: 'POST',
      body: { slug },
    })
  }

  // =========================================================================
  // Réponses & Stats
  // =========================================================================

  async function getResponses(campaignId: string, params: {
    page?: number
    limit?: number
    sort_by?: string
    sort_order?: string
  } = {}) {
    return await apiFetch<{
      items: any[]
      total: number
      page: number
      limit: number
      pages: number
    }>(`/api/admin/surveys/${campaignId}/responses`, { query: params })
  }

  async function getStats(campaignId: string) {
    return await apiFetch<any>(`/api/admin/surveys/${campaignId}/stats`)
  }

  async function exportCsv(campaignId: string) {
    const response = await apiFetch<string>(`/api/admin/surveys/${campaignId}/export`, {
      responseType: 'text' as any,
    })
    // Déclencher le téléchargement
    const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `survey-${campaignId}-export.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // =========================================================================
  // Associations
  // =========================================================================

  async function getAssociations(campaignId: string) {
    return await apiFetch<any[]>(`/api/admin/surveys/${campaignId}/associations`)
  }

  async function createAssociation(campaignId: string, entityType: string, entityId: string) {
    return await apiFetch<any>(`/api/admin/surveys/${campaignId}/associations`, {
      method: 'POST',
      body: { entity_type: entityType, entity_id: entityId },
    })
  }

  async function deleteAssociation(campaignId: string, associationId: string) {
    return await apiFetch<{ message: string }>(`/api/admin/surveys/${campaignId}/associations/${associationId}`, {
      method: 'DELETE',
    })
  }

  return {
    listCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    publishCampaign,
    pauseCampaign,
    closeCampaign,
    duplicateCampaign,
    getResponses,
    getStats,
    exportCsv,
    getAssociations,
    createAssociation,
    deleteAssociation,
  }
}
