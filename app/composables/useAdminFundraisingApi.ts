/**
 * Composable pour l'API admin Fundraising
 * Authentification JWT requise.
 */

import type {
  ContributorCreatePayload,
  ContributorRead,
  ContributorUpdatePayload,
  EditorialItemRead,
  EditorialSectionRead,
  FundraiserCreatePayload,
  FundraiserMediaRead,
  FundraiserRead,
  FundraiserStatistics,
  FundraiserUpdatePayload,
  InterestExpressionRead,
} from '~/types/fundraising'

export const fundraiserStatusOptions = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Clôturée' },
]

export const contributorCategoryOptions = [
  { value: 'state_organization', label: 'Organisation étatique' },
  { value: 'foundation_philanthropist', label: 'Fondation / Philanthrope' },
  { value: 'company', label: 'Entreprise' },
]

export function useAdminFundraisingApi() {
  const { apiFetch } = useApi()

  // ── Helpers ────────────────────────────────────────────────────

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036F]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // ── CRUD Fundraisers ──────────────────────────────────────────

  async function listFundraisers(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    sort_by?: string
    sort_order?: string
  }) {
    return await apiFetch<{
      items: FundraiserRead[]
      total: number
      page: number
      limit: number
      pages: number
    }>('/api/admin/fundraisers', { query: params })
  }

  async function getFundraiserById(id: string): Promise<FundraiserRead> {
    return await apiFetch<FundraiserRead>(`/api/admin/fundraisers/${id}`)
  }

  async function createFundraiser(data: FundraiserCreatePayload): Promise<{ id: string; message: string }> {
    return await apiFetch<{ id: string; message: string }>('/api/admin/fundraisers', {
      method: 'POST',
      body: data,
    })
  }

  async function updateFundraiser(id: string, data: FundraiserUpdatePayload): Promise<FundraiserRead> {
    return await apiFetch<FundraiserRead>(`/api/admin/fundraisers/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async function deleteFundraiser(id: string): Promise<{ message: string }> {
    return await apiFetch<{ message: string }>(`/api/admin/fundraisers/${id}`, {
      method: 'DELETE',
    })
  }

  async function getFundraiserStats(): Promise<FundraiserStatistics> {
    return await apiFetch<FundraiserStatistics>('/api/admin/fundraisers/statistics')
  }

  // ── CRUD Contributors ─────────────────────────────────────────

  async function listContributors(fundraiserId: string): Promise<ContributorRead[]> {
    return await apiFetch<ContributorRead[]>(`/api/admin/fundraisers/${fundraiserId}/contributors`)
  }

  async function addContributor(
    fundraiserId: string,
    data: ContributorCreatePayload,
  ): Promise<{ id: string; message: string }> {
    return await apiFetch<{ id: string; message: string }>(
      `/api/admin/fundraisers/${fundraiserId}/contributors`,
      { method: 'POST', body: data },
    )
  }

  async function updateContributor(
    fundraiserId: string,
    contributorId: string,
    data: ContributorUpdatePayload,
  ): Promise<ContributorRead> {
    return await apiFetch<ContributorRead>(
      `/api/admin/fundraisers/${fundraiserId}/contributors/${contributorId}`,
      { method: 'PUT', body: data },
    )
  }

  async function deleteContributor(fundraiserId: string, contributorId: string): Promise<{ message: string }> {
    return await apiFetch<{ message: string }>(
      `/api/admin/fundraisers/${fundraiserId}/contributors/${contributorId}`,
      { method: 'DELETE' },
    )
  }

  // ── News Associations ─────────────────────────────────────────

  async function listFundraiserNews(fundraiserId: string): Promise<any[]> {
    return await apiFetch<any[]>(`/api/admin/fundraisers/${fundraiserId}/news`)
  }

  async function associateNews(fundraiserId: string, newsId: string): Promise<{ message: string }> {
    return await apiFetch<{ message: string }>(
      `/api/admin/fundraisers/${fundraiserId}/news/${newsId}`,
      { method: 'POST' },
    )
  }

  async function dissociateNews(fundraiserId: string, newsId: string): Promise<{ message: string }> {
    return await apiFetch<{ message: string }>(
      `/api/admin/fundraisers/${fundraiserId}/news/${newsId}`,
      { method: 'DELETE' },
    )
  }

  async function searchPublishedNews(search: string) {
    return await apiFetch<{ items: any[] }>('/api/admin/news', {
      query: { search, status: 'published', limit: 20 },
    })
  }

  // ── Interest Expressions ──────────────────────────────────────

  async function listInterestExpressions(params?: {
    page?: number
    limit?: number
    fundraiser_id?: string
    status?: string
    search?: string
  }) {
    return await apiFetch<{
      items: InterestExpressionRead[]
      total: number
      page: number
      limit: number
      pages: number
    }>('/api/admin/fundraisers/interest-expressions', { query: params })
  }

  async function updateInterestStatus(
    expressionId: string,
    status: string,
  ): Promise<InterestExpressionRead> {
    return await apiFetch<InterestExpressionRead>(
      `/api/admin/fundraisers/interest-expressions/${expressionId}/status`,
      { method: 'PUT', body: { status } },
    )
  }

  async function exportInterestCSV(params?: {
    fundraiser_id?: string
    status?: string
  }): Promise<Blob> {
    const query = new URLSearchParams()
    if (params?.fundraiser_id) query.set('fundraiser_id', params.fundraiser_id)
    if (params?.status) query.set('status', params.status)

    const response = await apiFetch<Blob>(
      `/api/admin/fundraisers/interest-expressions/export?${query.toString()}`,
      { responseType: 'blob' as any },
    )
    return response
  }

  // ── Editorial Sections ────────────────────────────────────────

  async function listEditorialSections(): Promise<EditorialSectionRead[]> {
    return await apiFetch<EditorialSectionRead[]>('/api/admin/fundraisers/editorial-sections')
  }

  async function updateSection(sectionId: string, data: Record<string, any>): Promise<EditorialSectionRead> {
    return await apiFetch<EditorialSectionRead>(
      `/api/admin/fundraisers/editorial-sections/${sectionId}`,
      { method: 'PUT', body: data },
    )
  }

  async function createItem(
    sectionId: string,
    data: Record<string, any>,
  ): Promise<{ id: string; message: string }> {
    return await apiFetch<{ id: string; message: string }>(
      `/api/admin/fundraisers/editorial-sections/${sectionId}/items`,
      { method: 'POST', body: data },
    )
  }

  async function updateItem(itemId: string, data: Record<string, any>): Promise<EditorialItemRead> {
    return await apiFetch<EditorialItemRead>(
      `/api/admin/fundraisers/editorial-sections/items/${itemId}`,
      { method: 'PUT', body: data },
    )
  }

  async function deleteItem(itemId: string): Promise<{ message: string }> {
    return await apiFetch<{ message: string }>(
      `/api/admin/fundraisers/editorial-sections/items/${itemId}`,
      { method: 'DELETE' },
    )
  }

  // ── Media ─────────────────────────────────────────────────────

  async function listFundraiserMedia(fundraiserId: string): Promise<FundraiserMediaRead[]> {
    return await apiFetch<FundraiserMediaRead[]>(`/api/admin/fundraisers/${fundraiserId}/media`)
  }

  async function addMedia(
    fundraiserId: string,
    data: Record<string, any>,
  ): Promise<{ id: string; message: string }> {
    return await apiFetch<{ id: string; message: string }>(
      `/api/admin/fundraisers/${fundraiserId}/media`,
      { method: 'POST', body: data },
    )
  }

  async function updateMedia(
    fundraiserId: string,
    mediaId: string,
    data: Record<string, any>,
  ): Promise<FundraiserMediaRead> {
    return await apiFetch<FundraiserMediaRead>(
      `/api/admin/fundraisers/${fundraiserId}/media/${mediaId}`,
      { method: 'PUT', body: data },
    )
  }

  async function removeMedia(fundraiserId: string, mediaId: string): Promise<{ message: string }> {
    return await apiFetch<{ message: string }>(
      `/api/admin/fundraisers/${fundraiserId}/media/${mediaId}`,
      { method: 'DELETE' },
    )
  }

  return {
    slugify,
    formatCurrency,
    listFundraisers,
    getFundraiserById,
    createFundraiser,
    updateFundraiser,
    deleteFundraiser,
    getFundraiserStats,
    listContributors,
    addContributor,
    updateContributor,
    deleteContributor,
    listFundraiserNews,
    associateNews,
    dissociateNews,
    searchPublishedNews,
    listInterestExpressions,
    updateInterestStatus,
    exportInterestCSV,
    listEditorialSections,
    updateSection,
    createItem,
    updateItem,
    deleteItem,
    listFundraiserMedia,
    addMedia,
    updateMedia,
    removeMedia,
  }
}
