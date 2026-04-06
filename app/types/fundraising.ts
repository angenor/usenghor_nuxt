/**
 * Types TypeScript pour le module Fundraising (Levées de fonds)
 */

// ── Enums & Types ───────────────────────────────────────────────────

export type FundraiserStatus = 'draft' | 'active' | 'completed'
export type ContributorCategory = 'state_organization' | 'foundation_philanthropist' | 'company'
export type InterestExpressionStatus = 'new' | 'contacted'

// ── API Response Types (snake_case, miroir backend) ─────────────────

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
  reason_html: string | null
  reason_md: string | null
  reason_en_html: string | null
  reason_en_md: string | null
  reason_ar_html: string | null
  reason_ar_md: string | null
  cover_image_external_id: string | null
  goal_amount: number
  status: FundraiserStatus
  created_at: string
  updated_at: string
}

export interface FundraiserPublic {
  id: string
  title: string
  slug: string
  description_html: string | null
  cover_image_url: string | null
  goal_amount: number
  total_raised: number
  progress_percentage: number
  contributor_count: number
  status: FundraiserStatus
  created_at: string
}

export interface ContributorPublic {
  id: string
  name: string
  name_en: string | null
  name_ar: string | null
  category: ContributorCategory
  amount: number | null
  logo_url: string | null
  display_order: number
}

export interface FundraiserMediaItem {
  id: string
  media_url: string | null
  media_external_id: string
  caption_fr: string | null
  caption_en: string | null
  caption_ar: string | null
  display_order: number
  created_at: string
}

export interface FundraiserNewsPublic {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  published_at: string | null
}

export interface FundraiserPublicDetail {
  id: string
  title: string
  slug: string
  description_html: string | null
  description_en_html: string | null
  description_ar_html: string | null
  reason_html: string | null
  reason_en_html: string | null
  reason_ar_html: string | null
  cover_image_url: string | null
  goal_amount: number
  total_raised: number
  progress_percentage: number
  contributor_count: number
  status: FundraiserStatus
  contributors: ContributorPublic[]
  media: FundraiserMediaItem[]
  news: FundraiserNewsPublic[]
}

export interface GlobalStats {
  total_raised_all_campaigns: number
  total_contributors: number
  active_campaigns_count: number
  completed_campaigns_count: number
}

export interface AllContributorsItem {
  name: string
  category: ContributorCategory
  total_amount: number | null
  show_amount_publicly: boolean
  logo_url: string | null
  campaigns_count: number
}

export interface EditorialItemPublic {
  icon: string
  title: string
  description: string
}

export interface EditorialSectionPublic {
  slug: string
  title: string
  items: EditorialItemPublic[]
}

// ── Display Types (camelCase, frontend) ─────────────────────────────

export interface FundraiserDisplay {
  id: string
  title: string
  slug: string
  descriptionHtml: string | null
  coverImageUrl: string | null
  goalAmount: number
  totalRaised: number
  progressPercentage: number
  contributorCount: number
  status: FundraiserStatus
  createdAt: string
}

// ── Payload Types (CRUD admin) ──────────────────────────────────────

export interface FundraiserCreatePayload {
  title: string
  slug: string
  description_html: string | null
  description_md: string | null
  description_en_html: string | null
  description_en_md: string | null
  description_ar_html: string | null
  description_ar_md: string | null
  reason_html: string | null
  reason_md: string | null
  reason_en_html: string | null
  reason_en_md: string | null
  reason_ar_html: string | null
  reason_ar_md: string | null
  cover_image_external_id: string | null
  goal_amount: number
  status: FundraiserStatus
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
  reason_html?: string | null
  reason_md?: string | null
  reason_en_html?: string | null
  reason_en_md?: string | null
  reason_ar_html?: string | null
  reason_ar_md?: string | null
  cover_image_external_id?: string | null
  goal_amount?: number
  status?: FundraiserStatus
}

export interface ContributorRead {
  id: string
  fundraiser_id: string
  name: string
  name_en: string | null
  name_ar: string | null
  category: ContributorCategory
  amount: number
  show_amount_publicly: boolean
  logo_external_id: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface ContributorCreatePayload {
  name: string
  name_en?: string | null
  name_ar?: string | null
  category: ContributorCategory
  amount: number
  show_amount_publicly: boolean
  logo_external_id?: string | null
  display_order?: number
}

export interface ContributorUpdatePayload {
  name?: string
  name_en?: string | null
  name_ar?: string | null
  category?: ContributorCategory
  amount?: number
  show_amount_publicly?: boolean
  logo_external_id?: string | null
  display_order?: number
}

export interface InterestExpressionForm {
  full_name: string
  email: string
  message: string
  honeypot: string
  challenge_token: string
  form_opened_at: number
}

export interface InterestExpressionRead {
  id: string
  fundraiser_id: string
  fundraiser_title: string | null
  full_name: string
  email: string
  message: string | null
  status: InterestExpressionStatus
  created_at: string
  updated_at: string
}

export interface EditorialItemRead {
  id: string
  section_id: string
  icon: string
  title_fr: string
  title_en: string | null
  title_ar: string | null
  description_fr: string
  description_en: string | null
  description_ar: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EditorialSectionRead {
  id: string
  slug: string
  title_fr: string
  title_en: string | null
  title_ar: string | null
  display_order: number
  is_active: boolean
  items: EditorialItemRead[]
  created_at: string
  updated_at: string
}

export interface FundraiserMediaRead {
  id: string
  fundraiser_id: string
  media_external_id: string
  media_url: string | null
  caption_fr: string | null
  caption_en: string | null
  caption_ar: string | null
  display_order: number
  created_at: string
}

export interface FundraiserStatistics {
  total_campaigns: number
  active_campaigns: number
  completed_campaigns: number
  draft_campaigns: number
  total_raised: number
  total_contributors: number
  total_interest_expressions: number
  new_interest_expressions: number
}

// ── Paginated Response ──────────────────────────────────────────────

export interface PaginatedFundraisers {
  items: FundraiserPublic[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface PaginatedAllContributors {
  items: AllContributorsItem[]
  total: number
  page: number
  limit: number
  pages: number
}

// ── Labels & Colors ─────────────────────────────────────────────────

export const fundraiserStatusLabels: Record<FundraiserStatus, string> = {
  draft: 'Brouillon',
  active: 'Active',
  completed: 'Clôturée',
}

export const fundraiserStatusColors: Record<FundraiserStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
}

export const contributorCategoryLabels: Record<ContributorCategory, string> = {
  state_organization: 'Organisation étatique',
  foundation_philanthropist: 'Fondation / Philanthrope',
  company: 'Entreprise',
}

export const contributorCategoryOrder: ContributorCategory[] = [
  'state_organization',
  'foundation_philanthropist',
  'company',
]

export const interestExpressionStatusLabels: Record<InterestExpressionStatus, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
}

export const interestExpressionStatusColors: Record<InterestExpressionStatus, string> = {
  new: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  contacted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
}
