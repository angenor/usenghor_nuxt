/**
 * Types pour l'organisation (secteurs, services, partenaires)
 */

// ============================================================================
// Sectors
// ============================================================================

export interface SectorRead {
  id: string
  code: string
  name: string
  description: string | null
  mission: string | null
  icon_external_id: string | null
  cover_image_external_id: string | null
  head_external_id: string | null
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface SectorCreate {
  code: string
  name: string
  description?: string | null
  mission?: string | null
  icon_external_id?: string | null
  cover_image_external_id?: string | null
  head_external_id?: string | null
  display_order?: number
  active?: boolean
}

export interface SectorUpdate {
  code?: string
  name?: string
  description?: string | null
  mission?: string | null
  icon_external_id?: string | null
  cover_image_external_id?: string | null
  head_external_id?: string | null
  display_order?: number
  active?: boolean
}

export interface SectorReorder {
  sector_ids: string[]
}

// ============================================================================
// Services
// ============================================================================

export interface ServiceRead {
  id: string
  name: string
  description: string | null
  mission: string | null
  email: string | null
  phone: string | null
  sector_id: string | null
  head_external_id: string | null
  album_external_id: string | null
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface SectorWithServices extends SectorRead {
  services: ServiceRead[]
}

// ============================================================================
// Partners
// ============================================================================

export type PartnerType = 'charter_operator' | 'campus_partner' | 'program_partner' | 'project_partner' | 'other'

export interface PartnerRead {
  id: string
  name: string
  description: string | null
  logo_external_id: string | null
  country_external_id: string | null
  website: string | null
  type: PartnerType
  email: string | null
  phone: string | null
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface PartnerCreate {
  name: string
  description?: string | null
  logo_external_id?: string | null
  country_external_id?: string | null
  website?: string | null
  type: PartnerType
  email?: string | null
  phone?: string | null
  display_order?: number
  active?: boolean
}

export interface PartnerUpdate {
  name?: string
  description?: string | null
  logo_external_id?: string | null
  country_external_id?: string | null
  website?: string | null
  type?: PartnerType
  email?: string | null
  phone?: string | null
  display_order?: number
  active?: boolean
}

export interface PartnerReorder {
  partner_ids: string[]
}

// ============================================================================
// Partnership Requests
// ============================================================================

export type PartnershipRequestType = 'academic' | 'institutional' | 'business' | 'other'
export type PartnershipRequestStatus = 'pending' | 'approved' | 'rejected'

export interface PartnershipRequestRead {
  id: string
  contact_name: string
  email: string
  organization: string
  type: PartnershipRequestType
  message: string | null
  status: PartnershipRequestStatus
  rejection_reason: string | null
  reviewed_by_external_id: string | null
  reviewed_at: string | null
  partner_external_id: string | null
  created_at: string
  updated_at: string
}

export interface PartnershipRequestSubmit {
  contact_name: string
  email: string
  organization: string
  type: PartnershipRequestType
  message?: string
}
