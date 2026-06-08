/**
 * Types pour l'organisation (secteurs, services, partenaires)
 */

// ============================================================================
// Sectors
// ============================================================================

// Champs de traduction auto FR → EN/AR (convention additive) partagés par
// secteurs et services (name + description rich + mission rich).
export interface SectorServiceI18nFields {
  name_en?: string | null
  name_ar?: string | null
  description_en_html?: string | null
  description_en_md?: string | null
  description_ar_html?: string | null
  description_ar_md?: string | null
  mission_en_html?: string | null
  mission_en_md?: string | null
  mission_ar_html?: string | null
  mission_ar_md?: string | null
}

export interface SectorRead extends SectorServiceI18nFields {
  id: string
  code: string
  name: string
  description_html: string | null
  description_md: string | null
  mission_html: string | null
  mission_md: string | null
  icon_external_id: string | null
  cover_image_external_id: string | null
  head_external_id: string | null
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface SectorCreate extends SectorServiceI18nFields {
  code: string
  name: string
  description_html?: string | null
  description_md?: string | null
  mission_html?: string | null
  mission_md?: string | null
  icon_external_id?: string | null
  cover_image_external_id?: string | null
  head_external_id?: string | null
  display_order?: number
  active?: boolean
}

export interface SectorUpdate extends SectorServiceI18nFields {
  code?: string
  name?: string
  description_html?: string | null
  description_md?: string | null
  mission_html?: string | null
  mission_md?: string | null
  icon_external_id?: string | null
  cover_image_external_id?: string | null
  head_external_id?: string | null
  display_order?: number
  active?: boolean
}

export interface SectorReorder {
  sector_ids: string[]
}

/** Champs source FR d'un secteur/service à traduire (sans persistance). */
export interface SectorTranslateRequest {
  name?: string | null
  description_html?: string | null
  description_md?: string | null
  mission_html?: string | null
  mission_md?: string | null
}

/** Traductions EN/AR générées pour pré-remplir le formulaire admin. */
export type SectorTranslateResponse = SectorServiceI18nFields

// Les services partagent exactement le même périmètre traduit que les secteurs.
export type ServiceTranslateRequest = SectorTranslateRequest
export type ServiceTranslateResponse = SectorServiceI18nFields

// ============================================================================
// Services
// ============================================================================

export interface ServiceRead extends SectorServiceI18nFields {
  id: string
  name: string
  sigle: string | null
  color: string | null
  description_html: string | null
  description_md: string | null
  mission_html: string | null
  mission_md: string | null
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
  // Traductions auto FR → EN/AR (convention additive). name reste en FR.
  description_en: string | null
  description_ar: string | null
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
  description_en?: string | null
  description_ar?: string | null
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
  description_en?: string | null
  description_ar?: string | null
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

/** Champ source FR d'un partenaire à traduire (sans persistance). */
export interface PartnerTranslateRequest {
  description?: string | null
}

/** Traductions EN/AR générées pour pré-remplir le formulaire admin. */
export interface PartnerTranslateResponse {
  description_en: string | null
  description_ar: string | null
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
