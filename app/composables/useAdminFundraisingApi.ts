/**
 * Composable pour l'API admin des levées de fonds.
 */

import type {
  FundraiserRead,
  FundraiserCreatePayload,
  FundraiserUpdatePayload,
  FundraiserStatistics,
  ContributorRead,
  ContributorCreatePayload,
  ContributorUpdatePayload,
  FundraiserStatus,
} from '~/types/fundraising'
import { fundraiserStatusLabels, fundraiserStatusColors } from '~/types/fundraising'

export const fundraiserStatusOptions = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'active', label: 'En cours' },
  { value: 'completed', label: 'Terminée' },
]

export const contributorCategoryOptions = [
  { value: 'state_organization', label: 'États et organisations internationales' },
  { value: 'foundation_philanthropist', label: 'Fondations et philanthropes' },
  { value: 'company', label: 'Entreprises' },
]

export function useAdminFundraisingApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // FUNDRAISERS CRUD
  // =========================================================================

  async function listFundraisers(params?: {
    page?: number
    limit?: number
    search?: string
    status?: FundraiserStatus
    sort_by?: string
    sort_order?: string
  }) {
    const query: Record<string, string> = {}
    if (params?.page) query.page = String(params.page)
    if (params?.limit) query.limit = String(params.limit)
    if (params?.search) query.search = params.search
    if (params?.status) query.status = params.status
    if (params?.sort_by) query.sort_by = params.sort_by
    if (params?.sort_order) query.sort_order = params.sort_order

    return await apiFetch<{ items: FundraiserRead[]; total: number; page: number; limit: number; pages: number }>(
      '/api/admin/fundraisers',
      { params: query },
    )
  }

  async function getFundraiserById(id: string) {
    return await apiFetch<FundraiserRead>(`/api/admin/fundraisers/${id}`)
  }

  async function createFundraiser(data: FundraiserCreatePayload) {
    return await apiFetch<{ id: string; message: string }>('/api/admin/fundraisers', {
      method: 'POST',
      body: data,
    })
  }

  async function updateFundraiser(id: string, data: FundraiserUpdatePayload) {
    return await apiFetch<FundraiserRead>(`/api/admin/fundraisers/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async function deleteFundraiser(id: string) {
    return await apiFetch<{ message: string }>(`/api/admin/fundraisers/${id}`, {
      method: 'DELETE',
    })
  }

  async function getFundraiserStats() {
    return await apiFetch<FundraiserStatistics>('/api/admin/fundraisers/statistics')
  }

  // =========================================================================
  // CONTRIBUTORS
  // =========================================================================

  async function listContributors(fundraiserId: string) {
    return await apiFetch<ContributorRead[]>(`/api/admin/fundraisers/${fundraiserId}/contributors`)
  }

  async function addContributor(fundraiserId: string, data: ContributorCreatePayload) {
    return await apiFetch<{ id: string; message: string }>(
      `/api/admin/fundraisers/${fundraiserId}/contributors`,
      { method: 'POST', body: data },
    )
  }

  async function updateContributor(fundraiserId: string, contributorId: string, data: ContributorUpdatePayload) {
    return await apiFetch<ContributorRead>(
      `/api/admin/fundraisers/${fundraiserId}/contributors/${contributorId}`,
      { method: 'PUT', body: data },
    )
  }

  async function deleteContributor(fundraiserId: string, contributorId: string) {
    return await apiFetch<{ message: string }>(
      `/api/admin/fundraisers/${fundraiserId}/contributors/${contributorId}`,
      { method: 'DELETE' },
    )
  }

  // =========================================================================
  // NEWS ASSOCIATIONS
  // =========================================================================

  async function associateNews(fundraiserId: string, newsId: string) {
    return await apiFetch<{ message: string }>(
      `/api/admin/fundraisers/${fundraiserId}/news`,
      { method: 'POST', body: { news_id: newsId } },
    )
  }

  async function dissociateNews(fundraiserId: string, newsId: string) {
    return await apiFetch<{ message: string }>(
      `/api/admin/fundraisers/${fundraiserId}/news/${newsId}`,
      { method: 'DELETE' },
    )
  }

  async function searchPublishedNews(search: string) {
    return await apiFetch<{ items: any[] }>('/api/admin/news', {
      params: { search, status: 'published', limit: '20' },
    })
  }

  // =========================================================================
  // HELPERS
  // =========================================================================

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return {
    // Fundraisers
    listFundraisers,
    getFundraiserById,
    createFundraiser,
    updateFundraiser,
    deleteFundraiser,
    getFundraiserStats,
    // Contributors
    listContributors,
    addContributor,
    updateContributor,
    deleteContributor,
    // News
    associateNews,
    dissociateNews,
    searchPublishedNews,
    // Helpers
    slugify,
    formatCurrency,
    // Constants
    fundraiserStatusLabels,
    fundraiserStatusColors,
  }
}
