/**
 * Types pour les appels à candidature
 */

import type { PublicationStatus } from './common'

// ============================================================================
// Enums
// ============================================================================

export type CallType = 'application' | 'scholarship' | 'project' | 'recruitment' | 'training'
export type CallStatus = 'ongoing' | 'closed' | 'upcoming'

// ============================================================================
// Champs de traduction auto FR → EN/AR (convention additive)
// ⚠ target_audience est RICH ici (paires _html/_md), contrairement au JSONB de
// programs.target_audience.
// ============================================================================

export interface CallI18nFields {
  title_en?: string | null
  title_ar?: string | null
  description_en_html?: string | null
  description_en_md?: string | null
  description_ar_html?: string | null
  description_ar_md?: string | null
  target_audience_en_html?: string | null
  target_audience_en_md?: string | null
  target_audience_ar_html?: string | null
  target_audience_ar_md?: string | null
}

export interface CriterionI18nFields {
  criterion_en?: string | null
  criterion_ar?: string | null
}

export interface CoverageI18nFields {
  item_en?: string | null
  item_ar?: string | null
  description_en?: string | null
  description_ar?: string | null
}

export interface RequiredDocumentI18nFields {
  document_name_en?: string | null
  document_name_ar?: string | null
  description_en?: string | null
  description_ar?: string | null
}

export interface ScheduleI18nFields {
  step_en?: string | null
  step_ar?: string | null
  description_en?: string | null
  description_ar?: string | null
}

// Requêtes/réponses du bouton « Traduire » (sans persistance).
export interface ApplicationCallTranslateRequest {
  title?: string | null
  description_html?: string | null
  description_md?: string | null
  target_audience_html?: string | null
  target_audience_md?: string | null
}

export type ApplicationCallTranslateResponse = CallI18nFields

export interface CallEligibilityCriteriaTranslateRequest {
  criterion?: string | null
}

export type CallEligibilityCriteriaTranslateResponse = CriterionI18nFields

export interface CallCoverageTranslateRequest {
  item?: string | null
  description?: string | null
}

export type CallCoverageTranslateResponse = CoverageI18nFields

export interface CallRequiredDocumentTranslateRequest {
  document_name?: string | null
  description?: string | null
}

export type CallRequiredDocumentTranslateResponse = RequiredDocumentI18nFields

export interface CallScheduleTranslateRequest {
  step?: string | null
  description?: string | null
}

export type CallScheduleTranslateResponse = ScheduleI18nFields

// ============================================================================
// Sous-entités Read
// ============================================================================

export interface CallEligibilityCriteriaRead extends CriterionI18nFields {
  id: string
  call_id: string
  criterion: string
  is_mandatory: boolean
  display_order: number
}

export interface CallCoverageRead extends CoverageI18nFields {
  id: string
  call_id: string
  item: string
  description: string | null
  display_order: number
}

export interface CallRequiredDocumentRead extends RequiredDocumentI18nFields {
  id: string
  call_id: string
  document_name: string
  description: string | null
  is_mandatory: boolean
  accepted_formats: string | null
  max_size_mb: number | null
  display_order: number
}

export interface CallScheduleRead extends ScheduleI18nFields {
  id: string
  call_id: string
  step: string
  start_date: string | null
  end_date: string | null
  description: string | null
  display_order: number
}

// ============================================================================
// Application Call Read
// ============================================================================

export interface ApplicationCallRead extends CallI18nFields {
  id: string
  title: string
  slug: string
  description_html: string | null
  description_md: string | null
  cover_image_external_id: string | null
  program_external_id: string | null
  project_external_id: string | null
  campus_external_id: string | null
  country_external_id: string | null
  created_by_external_id: string | null
  location_address: string | null
  type: CallType
  status: CallStatus
  opening_date: string | null
  deadline: string | null
  program_start_date: string | null
  program_end_date: string | null
  target_audience_html: string | null
  target_audience_md: string | null
  registration_fee: number | null
  currency: string
  external_form_url: string | null
  use_internal_form: boolean
  publication_status: PublicationStatus
  created_at: string
  updated_at: string
}

export interface ApplicationCallWithDetails extends ApplicationCallRead {
  eligibility_criteria: CallEligibilityCriteriaRead[]
  coverage: CallCoverageRead[]
  required_documents: CallRequiredDocumentRead[]
  schedule: CallScheduleRead[]
}

// ============================================================================
// Application Call Public (pour le front-office)
// ============================================================================

export interface ApplicationCallPublic extends CallI18nFields {
  id: string
  title: string
  slug: string
  description_html: string | null
  description_md: string | null
  cover_image_external_id: string | null
  program_external_id: string | null
  project_external_id: string | null
  campus_external_id: string | null
  country_external_id: string | null
  location_address: string | null
  type: CallType
  status: CallStatus
  opening_date: string | null
  deadline: string | null
  program_start_date: string | null
  program_end_date: string | null
  target_audience_html: string | null
  target_audience_md: string | null
  registration_fee: number | null
  currency: string
  external_form_url: string | null
  use_internal_form: boolean
}

export interface ApplicationCallPublicWithDetails extends ApplicationCallPublic {
  eligibility_criteria: CallEligibilityCriteriaRead[]
  coverage: CallCoverageRead[]
  required_documents: CallRequiredDocumentRead[]
  schedule: CallScheduleRead[]
}

// ============================================================================
// Application Call Create / Update
// ============================================================================

export interface ApplicationCallCreatePayload extends CallI18nFields {
  title: string
  slug: string
  description_html?: string | null
  description_md?: string | null
  cover_image_external_id?: string | null
  program_external_id?: string | null
  project_external_id?: string | null
  campus_external_id?: string | null
  country_external_id?: string | null
  location_address?: string | null
  type: CallType
  status?: CallStatus
  opening_date?: string | null
  deadline?: string | null
  program_start_date?: string | null
  program_end_date?: string | null
  target_audience_html?: string | null
  target_audience_md?: string | null
  registration_fee?: number | null
  currency?: string
  external_form_url?: string | null
  use_internal_form?: boolean
  publication_status?: PublicationStatus
}

export interface ApplicationCallUpdatePayload extends CallI18nFields {
  title?: string
  slug?: string
  description_html?: string | null
  description_md?: string | null
  cover_image_external_id?: string | null
  program_external_id?: string | null
  project_external_id?: string | null
  campus_external_id?: string | null
  country_external_id?: string | null
  location_address?: string | null
  type?: CallType
  status?: CallStatus
  opening_date?: string | null
  deadline?: string | null
  program_start_date?: string | null
  program_end_date?: string | null
  target_audience_html?: string | null
  target_audience_md?: string | null
  registration_fee?: number | null
  currency?: string
  external_form_url?: string | null
  use_internal_form?: boolean
  publication_status?: PublicationStatus
}

// ============================================================================
// Sous-entités Create
// ============================================================================

export interface CallEligibilityCriteriaCreate extends CriterionI18nFields {
  criterion: string
  is_mandatory?: boolean
  display_order?: number
}

export interface CallCoverageCreate extends CoverageI18nFields {
  item: string
  description?: string | null
  display_order?: number
}

export interface CallRequiredDocumentCreate extends RequiredDocumentI18nFields {
  document_name: string
  description?: string | null
  is_mandatory?: boolean
  accepted_formats?: string | null
  max_size_mb?: number | null
  display_order?: number
}

export interface CallScheduleCreate extends ScheduleI18nFields {
  step: string
  start_date?: string | null
  end_date?: string | null
  description?: string | null
  display_order?: number
}
