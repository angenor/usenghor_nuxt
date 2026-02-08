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
// Sous-entités Read
// ============================================================================

export interface CallEligibilityCriteriaRead {
  id: string
  call_id: string
  criterion: string
  is_mandatory: boolean
  display_order: number
}

export interface CallCoverageRead {
  id: string
  call_id: string
  item: string
  description: string | null
  display_order: number
}

export interface CallRequiredDocumentRead {
  id: string
  call_id: string
  document_name: string
  description: string | null
  is_mandatory: boolean
  accepted_formats: string | null
  max_size_mb: number | null
  display_order: number
}

export interface CallScheduleRead {
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

export interface ApplicationCallRead {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_external_id: string | null
  program_external_id: string | null
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
  target_audience: string | null
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

export interface ApplicationCallPublic {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_external_id: string | null
  program_external_id: string | null
  campus_external_id: string | null
  country_external_id: string | null
  location_address: string | null
  type: CallType
  status: CallStatus
  opening_date: string | null
  deadline: string | null
  program_start_date: string | null
  program_end_date: string | null
  target_audience: string | null
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

export interface ApplicationCallCreatePayload {
  title: string
  slug: string
  description?: string | null
  cover_image_external_id?: string | null
  program_external_id?: string | null
  campus_external_id?: string | null
  country_external_id?: string | null
  location_address?: string | null
  type: CallType
  status?: CallStatus
  opening_date?: string | null
  deadline?: string | null
  program_start_date?: string | null
  program_end_date?: string | null
  target_audience?: string | null
  registration_fee?: number | null
  currency?: string
  external_form_url?: string | null
  use_internal_form?: boolean
  publication_status?: PublicationStatus
}

export interface ApplicationCallUpdatePayload {
  title?: string
  slug?: string
  description?: string | null
  cover_image_external_id?: string | null
  program_external_id?: string | null
  campus_external_id?: string | null
  country_external_id?: string | null
  location_address?: string | null
  type?: CallType
  status?: CallStatus
  opening_date?: string | null
  deadline?: string | null
  program_start_date?: string | null
  program_end_date?: string | null
  target_audience?: string | null
  registration_fee?: number | null
  currency?: string
  external_form_url?: string | null
  use_internal_form?: boolean
  publication_status?: PublicationStatus
}

// ============================================================================
// Sous-entités Create
// ============================================================================

export interface CallEligibilityCriteriaCreate {
  criterion: string
  is_mandatory?: boolean
  display_order?: number
}

export interface CallCoverageCreate {
  item: string
  description?: string | null
  display_order?: number
}

export interface CallRequiredDocumentCreate {
  document_name: string
  description?: string | null
  is_mandatory?: boolean
  accepted_formats?: string | null
  max_size_mb?: number | null
  display_order?: number
}

export interface CallScheduleCreate {
  step: string
  start_date?: string | null
  end_date?: string | null
  description?: string | null
  display_order?: number
}
