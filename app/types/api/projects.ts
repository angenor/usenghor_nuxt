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
}

export interface ProjectCategoryCreate {
  name: string
  slug: string
  description?: string | null
  icon?: string | null
}

export interface ProjectCategoryUpdate {
  name?: string
  slug?: string
  description?: string | null
  icon?: string | null
}

// ============================================================================
// Project Read
// ============================================================================

export interface ProjectRead {
  id: string
  title: string
  slug: string
  summary: string | null
  description: string | null
  cover_image_external_id: string | null
  sector_external_id: string | null
  manager_external_id: string | null
  album_external_id: string | null
  start_date: string | null
  end_date: string | null
  budget: number | null
  currency: string
  beneficiaries: string | null
  status: ProjectStatus
  publication_status: PublicationStatus
  created_at: string
  updated_at: string
}

export interface ProjectReadWithRelations extends ProjectRead {
  categories: ProjectCategoryRead[]
}

// ============================================================================
// Project Create / Update
// ============================================================================

export interface ProjectCreatePayload {
  title: string
  slug: string
  summary?: string | null
  description?: string | null
  cover_image_external_id?: string | null
  sector_external_id?: string | null
  manager_external_id?: string | null
  album_external_id?: string | null
  start_date?: string | null
  end_date?: string | null
  budget?: number | null
  currency?: string
  beneficiaries?: string | null
  status?: ProjectStatus
  publication_status?: PublicationStatus
  category_ids?: string[] | null
  country_ids?: string[] | null
}

export interface ProjectUpdatePayload {
  title?: string
  slug?: string
  summary?: string | null
  description?: string | null
  cover_image_external_id?: string | null
  sector_external_id?: string | null
  manager_external_id?: string | null
  album_external_id?: string | null
  start_date?: string | null
  end_date?: string | null
  budget?: number | null
  currency?: string
  beneficiaries?: string | null
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
  description: string | null
  cover_image_external_id: string | null
  conditions: string | null
  type: ProjectCallType | null
  deadline: string | null
  status: ProjectCallStatus
  created_at: string
  updated_at: string
}

export interface ProjectCallCreate {
  title: string
  description?: string | null
  cover_image_external_id?: string | null
  conditions?: string | null
  type?: ProjectCallType | null
  deadline?: string | null
  status?: ProjectCallStatus
}

export interface ProjectCallUpdate {
  title?: string
  description?: string | null
  cover_image_external_id?: string | null
  conditions?: string | null
  type?: ProjectCallType | null
  deadline?: string | null
  status?: ProjectCallStatus
}

// ============================================================================
// Project Media
// ============================================================================

export interface ProjectMediaRead {
  project_id: string
  album_external_id: string
}
