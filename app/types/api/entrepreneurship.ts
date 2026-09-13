/**
 * Types API du Pôle Entrepreneuriat et Innovation (PEI)
 * Alignés sur specs/021-pei-entrepreneurship-core/contracts/{admin-api,public-api}.md
 * Convention trilingue additive : champ (FR), champ_en, champ_ar ;
 * contenu riche : champ_html / champ_md + champ_en_* / champ_ar_*.
 */

// ============================================================================
// Énumérations
// ============================================================================

export type PeiProgramPhase =
  | 'awareness'
  | 'status'
  | 'pre_incubation'
  | 'incubation'
  | 'funding'
  | 'ecosystem'

export type PeiCohortType = 'fse' | 'see'

export type PeiResourceType = 'document' | 'link' | 'video'

export type PeiColor = 'blue' | 'blue_dark' | 'red' | 'amber' | 'teal'

// ============================================================================
// Transversal
// ============================================================================

export interface PeiPage<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface ReorderResponse {
  updated: number
}

export interface ActiveStatus {
  id: string
  active: boolean
  updated_at: string
}

export interface PublishStatus {
  id: string
  is_published: boolean
  published_at: string | null
  updated_at: string
}

export interface PeiDashboardStats {
  programs: { active: number, total: number }
  cohorts: { active: number, total: number }
  resources: { published: number, total: number }
  dde_service: { id: string | null, name: string | null }
}

export interface PeiTranslateMissingResponse {
  programs: number
  cohorts: number
  resources: number
  /** Faux si le budget de temps serveur est épuisé : relancer l'action. */
  complete: boolean
}

interface AuditColumns {
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

// ============================================================================
// Dispositifs (pei_programs)
// ============================================================================

export interface PeiProgramAdmin extends AuditColumns {
  id: string
  code: string
  sigle: string | null
  title: string
  title_en: string | null
  title_ar: string | null
  phase: PeiProgramPhase
  tagline: string | null
  tagline_en: string | null
  tagline_ar: string | null
  content_html: string | null
  content_md: string | null
  content_en_html: string | null
  content_en_md: string | null
  content_ar_html: string | null
  content_ar_md: string | null
  highlight: string | null
  highlight_en: string | null
  highlight_ar: string | null
  color: PeiColor
  cover_image_external_id: string | null
  cover_image_url: string | null
  display_order: number
  active: boolean
}

export interface PeiProgramCreatePayload {
  code: string
  sigle?: string | null
  title: string
  title_en?: string | null
  title_ar?: string | null
  phase: PeiProgramPhase
  tagline?: string | null
  tagline_en?: string | null
  tagline_ar?: string | null
  content_md?: string | null
  content_html?: string | null
  content_en_md?: string | null
  content_en_html?: string | null
  content_ar_md?: string | null
  content_ar_html?: string | null
  highlight?: string | null
  highlight_en?: string | null
  highlight_ar?: string | null
  color?: PeiColor
  cover_image_external_id?: string | null
  active?: boolean
}

export type PeiProgramUpdatePayload = Partial<PeiProgramCreatePayload>

export interface PeiProgramPublic {
  id: string
  code: string
  sigle: string | null
  phase: PeiProgramPhase
  title: string
  title_en: string | null
  title_ar: string | null
  tagline: string | null
  tagline_en: string | null
  tagline_ar: string | null
  content_html: string | null
  content_en_html: string | null
  content_ar_html: string | null
  highlight: string | null
  highlight_en: string | null
  highlight_ar: string | null
  color: PeiColor
  cover_image_url: string | null
  display_order: number
}

export interface PeiProgramTranslateRequest {
  title?: string | null
  tagline?: string | null
  highlight?: string | null
  content_md?: string | null
  content_html?: string | null
}

export interface PeiProgramTranslateResponse {
  title_en?: string | null
  title_ar?: string | null
  tagline_en?: string | null
  tagline_ar?: string | null
  highlight_en?: string | null
  highlight_ar?: string | null
  content_en_md?: string | null
  content_ar_md?: string | null
  content_en_html?: string | null
  content_ar_html?: string | null
}

// ============================================================================
// Cohortes (pei_cohorts)
// ============================================================================

export interface PeiCohortAdmin extends AuditColumns {
  id: string
  code: string
  label: string
  label_en: string | null
  label_ar: string | null
  year: number
  type: PeiCohortType
  focus: string | null
  focus_en: string | null
  focus_ar: string | null
  summary_html: string | null
  summary_md: string | null
  summary_en_html: string | null
  summary_en_md: string | null
  summary_ar_html: string | null
  summary_ar_md: string | null
  display_order: number
  active: boolean
}

export interface PeiCohortCreatePayload {
  code: string
  label: string
  label_en?: string | null
  label_ar?: string | null
  year: number
  type: PeiCohortType
  focus?: string | null
  focus_en?: string | null
  focus_ar?: string | null
  summary_md?: string | null
  summary_html?: string | null
  summary_en_md?: string | null
  summary_en_html?: string | null
  summary_ar_md?: string | null
  summary_ar_html?: string | null
  active?: boolean
}

export type PeiCohortUpdatePayload = Partial<PeiCohortCreatePayload>

export interface PeiCohortPublic {
  id: string
  code: string
  label: string
  label_en: string | null
  label_ar: string | null
  year: number
  type: PeiCohortType
  focus: string | null
  focus_en: string | null
  focus_ar: string | null
  summary_html: string | null
  summary_en_html: string | null
  summary_ar_html: string | null
  display_order: number
}

export interface PeiCohortTranslateRequest {
  label?: string | null
  focus?: string | null
  summary_md?: string | null
  summary_html?: string | null
}

export interface PeiCohortTranslateResponse {
  label_en?: string | null
  label_ar?: string | null
  focus_en?: string | null
  focus_ar?: string | null
  summary_en_md?: string | null
  summary_ar_md?: string | null
  summary_en_html?: string | null
  summary_ar_html?: string | null
}

// ============================================================================
// Boîte à outils (pei_resources)
// ============================================================================

export interface PeiResourceAdmin extends AuditColumns {
  id: string
  title: string
  title_en: string | null
  title_ar: string | null
  description: string | null
  description_en: string | null
  description_ar: string | null
  type: PeiResourceType
  media_external_id: string | null
  media_url: string | null
  url: string | null
  category: string | null
  category_en: string | null
  category_ar: string | null
  display_order: number
  is_published: boolean
  published_at: string | null
}

export interface PeiResourceCreatePayload {
  title: string
  title_en?: string | null
  title_ar?: string | null
  description?: string | null
  description_en?: string | null
  description_ar?: string | null
  type: PeiResourceType
  media_external_id?: string | null
  url?: string | null
  category?: string | null
  category_en?: string | null
  category_ar?: string | null
  is_published?: boolean
}

export type PeiResourceUpdatePayload = Partial<PeiResourceCreatePayload>

export interface PeiResourcePublic {
  id: string
  title: string
  title_en: string | null
  title_ar: string | null
  description: string | null
  description_en: string | null
  description_ar: string | null
  type: PeiResourceType
  media_url: string | null
  url: string | null
  category: string | null
  category_en: string | null
  category_ar: string | null
  display_order: number
}

export interface PeiResourceTranslateRequest {
  title?: string | null
  description?: string | null
  category?: string | null
}

export interface PeiResourceTranslateResponse {
  title_en?: string | null
  title_ar?: string | null
  description_en?: string | null
  description_ar?: string | null
  category_en?: string | null
  category_ar?: string | null
}
