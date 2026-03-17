/**
 * Types TypeScript pour les levées de fonds.
 */

// =============================================================================
// ENUMS
// =============================================================================

export type FundraiserStatus = 'draft' | 'active' | 'completed'
export type ContributorCategory = 'state_organization' | 'foundation_philanthropist' | 'company'

// =============================================================================
// CONTRIBUTEURS
// =============================================================================

export interface ContributorRead {
  id: string
  fundraiser_id: string
  name: string
  name_en: string | null
  name_ar: string | null
  category: ContributorCategory
  amount: number
  logo_external_id: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface ContributorPublic {
  id: string
  name: string
  name_en: string | null
  name_ar: string | null
  category: ContributorCategory
  amount: number
  logo_external_id: string | null
}

export interface ContributorCreatePayload {
  name: string
  name_en?: string | null
  name_ar?: string | null
  category: ContributorCategory
  amount: number
  logo_external_id?: string | null
  display_order?: number
}

export interface ContributorUpdatePayload {
  name?: string
  name_en?: string | null
  name_ar?: string | null
  category?: ContributorCategory
  amount?: number
  logo_external_id?: string | null
  display_order?: number
}

// =============================================================================
// LEVÉES DE FONDS
// =============================================================================

export interface FundraiserRead {
  id: string
  title: string
  slug: string
  description_html: string | null
  description_md: string | null
  description_en_html: string | null
  description_en_md: string | null
  description_ar_html: string | null
  description_ar_md: string | null
  cover_image_external_id: string | null
  goal_amount: number
  total_raised: number
  progress_percentage: number
  contributor_count: number
  status: FundraiserStatus
  created_at: string
  updated_at: string
}

export interface FundraiserPublic {
  id: string
  title: string
  slug: string
  cover_image_external_id: string | null
  goal_amount: number
  total_raised: number
  progress_percentage: number
  status: FundraiserStatus
  contributor_count: number
  created_at: string
}

export interface FundraiserPublicDetail {
  id: string
  title: string
  slug: string
  description_html: string | null
  description_en_html: string | null
  description_ar_html: string | null
  cover_image_external_id: string | null
  goal_amount: number
  total_raised: number
  progress_percentage: number
  status: FundraiserStatus
  contributors: ContributorPublic[]
  news: FundraiserNewsDisplay[]
  created_at: string
}

export interface FundraiserCreatePayload {
  title: string
  slug: string
  description_html?: string | null
  description_md?: string | null
  description_en_html?: string | null
  description_en_md?: string | null
  description_ar_html?: string | null
  description_ar_md?: string | null
  cover_image_external_id?: string | null
  goal_amount: number
  status?: FundraiserStatus
}

export interface FundraiserUpdatePayload {
  title?: string
  slug?: string
  description_html?: string | null
  description_md?: string | null
  description_en_html?: string | null
  description_en_md?: string | null
  description_ar_html?: string | null
  description_ar_md?: string | null
  cover_image_external_id?: string | null
  goal_amount?: number
  status?: FundraiserStatus
}

// =============================================================================
// ASSOCIATION ACTUALITÉS
// =============================================================================

export interface FundraiserNewsDisplay {
  id: string
  title: string
  slug: string
  summary: string | null
  cover_image_external_id: string | null
  published_at: string | null
}

// =============================================================================
// STATISTIQUES
// =============================================================================

export interface FundraiserStatistics {
  total: number
  draft: number
  active: number
  completed: number
  total_goal: number
  total_raised: number
}

// =============================================================================
// AFFICHAGE (frontend)
// =============================================================================

export interface FundraiserDisplay {
  id: string
  title: string
  slug: string
  coverImageUrl: string | null
  goalAmount: number
  totalRaised: number
  progressPercentage: number
  status: FundraiserStatus
  statusLabel: string
  statusColor: string
  contributorCount: number
  createdAt: string
}

// =============================================================================
// CONSTANTES
// =============================================================================

export const fundraiserStatusLabels: Record<FundraiserStatus, string> = {
  draft: 'Brouillon',
  active: 'En cours',
  completed: 'Terminée',
}

export const fundraiserStatusColors: Record<FundraiserStatus, string> = {
  draft: 'gray',
  active: 'green',
  completed: 'blue',
}

export const contributorCategoryLabels: Record<ContributorCategory, string> = {
  state_organization: 'États et organisations internationales',
  foundation_philanthropist: 'Fondations et philanthropes',
  company: 'Entreprises',
}

export const contributorCategoryOrder: ContributorCategory[] = [
  'state_organization',
  'foundation_philanthropist',
  'company',
]

// =============================================================================
// RÉPONSE PAGINÉE
// =============================================================================

export interface PaginatedFundraisers {
  items: FundraiserPublic[]
  total: number
  page: number
  limit: number
  pages: number
}
