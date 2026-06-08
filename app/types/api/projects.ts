/**
 * Types pour les projets
 */

import type { PublicationStatus } from './common'

// ============================================================================
// Enums
// ============================================================================

export type ProjectStatus = 'planned' | 'ongoing' | 'completed' | 'suspended'
export type ProjectCallType = 'application' | 'scholarship' | 'project' | 'recruitment' | 'training'
export type ProjectCallStatus = 'ongoing' | 'closed' | 'upcoming'

// ============================================================================
// Project Categories
// ============================================================================

export interface ProjectCategoryRead {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  created_at: string
  // Traductions auto FR → EN/AR (convention additive)
  name_en: string | null
  name_ar: string | null
  description_en: string | null
  description_ar: string | null
}

export interface ProjectCategoryCreate {
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  name_en?: string | null
  name_ar?: string | null
  description_en?: string | null
  description_ar?: string | null
}

export interface ProjectCategoryUpdate {
  name?: string
  slug?: string
  description?: string | null
  icon?: string | null
  name_en?: string | null
  name_ar?: string | null
  description_en?: string | null
  description_ar?: string | null
}

/** Champs source FR d'une catégorie à traduire (sans persistance). */
export interface ProjectCategoryTranslateRequest {
  name?: string | null
  description?: string | null
}

/** Traductions EN/AR générées pour pré-remplir le formulaire admin. */
export interface ProjectCategoryTranslateResponse {
  name_en: string | null
  name_ar: string | null
  description_en: string | null
  description_ar: string | null
}

// ============================================================================
// Project Read
// ============================================================================

export interface ProjectRead {
  id: string
  title: string
  slug: string
  summary: string | null
  description_html: string | null
  description_md: string | null
  // Traductions auto FR → EN/AR (convention additive). summary non traduit (cf. décision).
  title_en: string | null
  title_ar: string | null
  description_en_html: string | null
  description_en_md: string | null
  description_ar_html: string | null
  description_ar_md: string | null
  cover_image_external_id: string | null
  sector_external_id: string | null
  manager_external_id: string | null
  album_external_id: string | null
  start_date: string | null
  end_date: string | null
  budget: number | null
  currency: string
  beneficiaries: string[] | null
  status: ProjectStatus
  publication_status: PublicationStatus
  created_at: string
  updated_at: string
}

export interface ProjectReadWithRelations extends ProjectRead {
  categories: ProjectCategoryRead[]
}

/** Champs source FR d'un projet à traduire (title + description ; summary exclu). */
export interface ProjectTranslateRequest {
  title?: string | null
  description_html?: string | null
  description_md?: string | null
}

/** Traductions EN/AR générées pour pré-remplir le formulaire admin. */
export interface ProjectTranslateResponse {
  title_en: string | null
  title_ar: string | null
  description_en_html: string | null
  description_en_md: string | null
  description_ar_html: string | null
  description_ar_md: string | null
}

// ============================================================================
// Project Create / Update
// ============================================================================

export interface ProjectCreatePayload {
  title: string
  slug: string
  summary?: string | null
  description_html?: string | null
  description_md?: string | null
  title_en?: string | null
  title_ar?: string | null
  description_en_html?: string | null
  description_en_md?: string | null
  description_ar_html?: string | null
  description_ar_md?: string | null
  cover_image_external_id?: string | null
  sector_external_id?: string | null
  manager_external_id?: string | null
  album_external_id?: string | null
  start_date?: string | null
  end_date?: string | null
  budget?: number | null
  currency?: string
  beneficiaries?: string[] | null
  status?: ProjectStatus
  publication_status?: PublicationStatus
  category_ids?: string[] | null
  country_ids?: string[] | null
}

export interface ProjectUpdatePayload {
  title?: string
  slug?: string
  summary?: string | null
  description_html?: string | null
  description_md?: string | null
  title_en?: string | null
  title_ar?: string | null
  description_en_html?: string | null
  description_en_md?: string | null
  description_ar_html?: string | null
  description_ar_md?: string | null
  cover_image_external_id?: string | null
  sector_external_id?: string | null
  manager_external_id?: string | null
  album_external_id?: string | null
  start_date?: string | null
  end_date?: string | null
  budget?: number | null
  currency?: string
  beneficiaries?: string[] | null
  status?: ProjectStatus
  publication_status?: PublicationStatus
  category_ids?: string[] | null
  country_ids?: string[] | null
}

// ============================================================================
// Project Statistics
// ============================================================================

export interface ProjectStatistics {
  total_projects: number
  ongoing_projects: number
  completed_projects: number
  planned_projects: number
  suspended_projects: number
  total_budget: number
  total_categories: number
}

// ============================================================================
// Project Partners
// ============================================================================

export interface ProjectPartnerRead {
  project_id: string
  partner_external_id: string
  partner_role: string | null
}

export interface ProjectPartnerCreate {
  partner_external_id: string
  partner_role?: string | null
}

export interface ProjectPartnerUpdate {
  partner_role?: string | null
}

// ============================================================================
// Project Countries
// ============================================================================

export interface ProjectCountryRead {
  project_id: string
  country_external_id: string
}

// ============================================================================
// Project Calls
// ============================================================================

export interface ProjectCallRead {
  id: string
  project_id: string
  title: string
  description_html: string | null
  description_md: string | null
  cover_image_external_id: string | null
  conditions_html: string | null
  conditions_md: string | null
  type: ProjectCallType | null
  deadline: string | null
  status: ProjectCallStatus
  created_at: string
  updated_at: string
  // Traductions auto FR → EN/AR (convention additive)
  title_en: string | null
  title_ar: string | null
  description_en_html: string | null
  description_en_md: string | null
  description_ar_html: string | null
  description_ar_md: string | null
  conditions_en_html: string | null
  conditions_en_md: string | null
  conditions_ar_html: string | null
  conditions_ar_md: string | null
}

export interface ProjectCallCreate {
  title: string
  description_html?: string | null
  description_md?: string | null
  cover_image_external_id?: string | null
  conditions_html?: string | null
  conditions_md?: string | null
  type?: ProjectCallType | null
  deadline?: string | null
  status?: ProjectCallStatus
  title_en?: string | null
  title_ar?: string | null
  description_en_html?: string | null
  description_en_md?: string | null
  description_ar_html?: string | null
  description_ar_md?: string | null
  conditions_en_html?: string | null
  conditions_en_md?: string | null
  conditions_ar_html?: string | null
  conditions_ar_md?: string | null
}

export interface ProjectCallUpdate {
  title?: string
  description_html?: string | null
  description_md?: string | null
  cover_image_external_id?: string | null
  conditions_html?: string | null
  conditions_md?: string | null
  type?: ProjectCallType | null
  deadline?: string | null
  status?: ProjectCallStatus
  title_en?: string | null
  title_ar?: string | null
  description_en_html?: string | null
  description_en_md?: string | null
  description_ar_html?: string | null
  description_ar_md?: string | null
  conditions_en_html?: string | null
  conditions_en_md?: string | null
  conditions_ar_html?: string | null
  conditions_ar_md?: string | null
}

/** Champs source FR d'un appel de projet à traduire (title + description + conditions). */
export interface ProjectCallTranslateRequest {
  title?: string | null
  description_html?: string | null
  description_md?: string | null
  conditions_html?: string | null
  conditions_md?: string | null
}

/** Traductions EN/AR générées pour pré-remplir le formulaire admin. */
export interface ProjectCallTranslateResponse {
  title_en: string | null
  title_ar: string | null
  description_en_html: string | null
  description_en_md: string | null
  description_ar_html: string | null
  description_ar_md: string | null
  conditions_en_html: string | null
  conditions_en_md: string | null
  conditions_ar_html: string | null
  conditions_ar_md: string | null
}

// ============================================================================
// Project Media
// ============================================================================

export interface ProjectMediaRead {
  project_id: string
  album_external_id: string
}
