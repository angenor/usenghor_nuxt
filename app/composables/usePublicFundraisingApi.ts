/**
 * Composable pour l'API publique Fundraising
 * Pas d'authentification requise.
 */

import type {
  AllContributorsItem,
  EditorialSectionPublic,
  FundraiserDisplay,
  FundraiserPublic,
  FundraiserPublicDetail,
  GlobalStats,
  InterestExpressionForm,
  PaginatedAllContributors,
  PaginatedFundraisers,
} from '~/types/fundraising'

export function usePublicFundraisingApi() {
  const apiBase = useApiBase()
  const { locale } = useI18n()

  function transformToDisplay(fundraiser: FundraiserPublic): FundraiserDisplay {
    return {
      id: fundraiser.id,
      title: fundraiser.title,
      slug: fundraiser.slug,
      descriptionHtml: fundraiser.description_html,
      coverImageUrl: fundraiser.cover_image_url,
      goalAmount: fundraiser.goal_amount,
      totalRaised: fundraiser.total_raised,
      progressPercentage: fundraiser.progress_percentage,
      contributorCount: fundraiser.contributor_count,
      status: fundraiser.status,
      createdAt: fundraiser.created_at,
    }
  }

  function formatCurrency(amount: number, locale: string = 'fr-FR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function resolveMediaUrl(externalId: string | null): string | null {
    if (!externalId) return null
    return `${apiBase}/api/public/media/${externalId}/download`
  }

  async function listPublishedFundraisers(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<PaginatedFundraisers> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.status) query.set('status', params.status)

    return await $fetch<PaginatedFundraisers>(
      `${apiBase}/api/public/fundraisers?${query.toString()}`,
    )
  }

  async function getFundraiserBySlug(slug: string): Promise<FundraiserPublicDetail> {
    return await $fetch<FundraiserPublicDetail>(
      `${apiBase}/api/public/fundraisers/${slug}`,
    )
  }

  async function getGlobalStats(): Promise<GlobalStats> {
    return await $fetch<GlobalStats>(
      `${apiBase}/api/public/fundraisers/global-stats`,
    )
  }

  async function getAllContributors(params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedAllContributors> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))

    return await $fetch<PaginatedAllContributors>(
      `${apiBase}/api/public/fundraisers/all-contributors?${query.toString()}`,
    )
  }

  async function getEditorialSections(): Promise<{ sections: EditorialSectionPublic[] }> {
    return await $fetch<{ sections: EditorialSectionPublic[] }>(
      `${apiBase}/api/public/fundraisers/editorial-sections?lang=${locale.value}`,
    )
  }

  async function submitInterest(slug: string, data: InterestExpressionForm): Promise<{ message: string }> {
    return await $fetch<{ message: string }>(
      `${apiBase}/api/public/fundraisers/${slug}/interest`,
      {
        method: 'POST',
        body: data,
      },
    )
  }

  return {
    transformToDisplay,
    formatCurrency,
    resolveMediaUrl,
    listPublishedFundraisers,
    getFundraiserBySlug,
    getGlobalStats,
    getAllContributors,
    getEditorialSections,
    submitInterest,
  }
}
