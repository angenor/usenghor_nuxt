/**
 * Composable pour l'API publique des levées de fonds.
 */

import type {
  FundraiserPublic,
  FundraiserPublicDetail,
  FundraiserDisplay,
  PaginatedFundraisers,
  FundraiserStatus,
} from '~/types/fundraising'
import { fundraiserStatusLabels, fundraiserStatusColors } from '~/types/fundraising'

export function usePublicFundraisingApi() {
  const apiBase = useApiBase()

  /**
   * Transforme un FundraiserPublic en FundraiserDisplay pour le frontend.
   */
  function transformToDisplay(fundraiser: FundraiserPublic): FundraiserDisplay {
    const coverImageUrl = fundraiser.cover_image_external_id
      ? `${apiBase}/api/public/media/${fundraiser.cover_image_external_id}/download`
      : null

    return {
      id: fundraiser.id,
      title: fundraiser.title,
      slug: fundraiser.slug,
      coverImageUrl,
      goalAmount: fundraiser.goal_amount,
      totalRaised: fundraiser.total_raised,
      progressPercentage: fundraiser.progress_percentage,
      status: fundraiser.status,
      statusLabel: fundraiserStatusLabels[fundraiser.status] || fundraiser.status,
      statusColor: fundraiserStatusColors[fundraiser.status] || 'gray',
      contributorCount: fundraiser.contributor_count,
      createdAt: fundraiser.created_at,
    }
  }

  /**
   * Formate un montant en EUR.
   */
  function formatCurrency(amount: number, locale: string = 'fr-FR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  /**
   * Liste les levées de fonds publiées.
   */
  async function listPublishedFundraisers(params?: {
    page?: number
    limit?: number
    status?: FundraiserStatus
  }): Promise<PaginatedFundraisers> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.status) query.set('status', params.status)

    const url = `${apiBase}/api/public/fundraisers${query.toString() ? '?' + query.toString() : ''}`
    return await $fetch<PaginatedFundraisers>(url)
  }

  /**
   * Récupère le détail d'une levée de fonds par son slug.
   */
  async function getFundraiserBySlug(slug: string): Promise<FundraiserPublicDetail> {
    return await $fetch<FundraiserPublicDetail>(`${apiBase}/api/public/fundraisers/${slug}`)
  }

  /**
   * Résout l'URL d'un média.
   */
  function resolveMediaUrl(externalId: string | null): string | null {
    if (!externalId) return null
    return `${apiBase}/api/public/media/${externalId}/download`
  }

  return {
    transformToDisplay,
    formatCurrency,
    listPublishedFundraisers,
    getFundraiserBySlug,
    resolveMediaUrl,
  }
}
