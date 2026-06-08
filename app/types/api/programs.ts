/**
 * Types pour les programmes académiques
 */

import type { PublicationStatus } from './common'

// ============================================================================
// Enums
// ============================================================================

export type ProgramType = 'master' | 'doctorate' | 'university_diploma' | 'certificate' | 'clom'

// ============================================================================
// Champs de traduction auto FR → EN/AR (convention additive)
// rich = paire _html/_md (langue insérée avant le suffixe) ; listes = JSONB.
// ============================================================================

export interface ProgramI18nFields {
  title_en?: string | null
  title_ar?: string | null
  subtitle_en?: string | null
  subtitle_ar?: string | null
  description_en_html?: string | null
  description_en_md?: string | null
  description_ar_html?: string | null
  description_ar_md?: string | null
  teaching_methods_en_html?: string | null
  teaching_methods_en_md?: string | null
  teaching_methods_ar_html?: string | null
  teaching_methods_ar_md?: string | null
  format_en_html?: string | null
  format_en_md?: string | null
  format_ar_html?: string | null
  format_ar_md?: string | null
  evaluation_methods_en_html?: string | null
  evaluation_methods_en_md?: string | null
  evaluation_methods_ar_html?: string | null
  evaluation_methods_ar_md?: string | null
  required_degree_en?: string | null
  required_degree_ar?: string | null
  objectives_en?: string[] | null
  objectives_ar?: string[] | null
  target_audience_en?: string[] | null
  target_audience_ar?: string[] | null
}

export interface SemesterI18nFields {
  title_en?: string | null
  title_ar?: string | null
}

export interface CourseI18nFields {
  title_en?: string | null
  title_ar?: string | null
  description_en?: string | null
  description_ar?: string | null
}

// Requêtes/réponses du bouton « Traduire » (sans persistance).
export interface ProgramTranslateRequest {
  title?: string | null
  subtitle?: string | null
  description_html?: string | null
  description_md?: string | null
  teaching_methods_html?: string | null
  teaching_methods_md?: string | null
  format_html?: string | null
  format_md?: string | null
  evaluation_methods_html?: string | null
  evaluation_methods_md?: string | null
  required_degree?: string | null
  objectives?: string[] | null
  target_audience?: string[] | null
}

export type ProgramTranslateResponse = ProgramI18nFields

export interface ProgramSemesterTranslateRequest {
  title?: string | null
}

export type ProgramSemesterTranslateResponse = SemesterI18nFields

export interface ProgramCourseTranslateRequest {
  title?: string | null
  description?: string | null
}

export type ProgramCourseTranslateResponse = CourseI18nFields

// ============================================================================
// Program Sub-entities Read
// ============================================================================

export interface ProgramCourseRead extends CourseI18nFields {
  id: string
  semester_id: string
  code: string | null
  title: string
  description: string | null
  credits: number | null
  lecture_hours: number
  tutorial_hours: number
  practical_hours: number
  coefficient: number | null
  display_order: number
}

export interface ProgramSemesterRead extends SemesterI18nFields {
  id: string
  program_id: string
  number: number
  title: string | null
  credits: number
  display_order: number
}

export interface ProgramSemesterWithCourses extends ProgramSemesterRead {
  courses: ProgramCourseRead[]
}

export interface ProgramSkillRead {
  id: string
  program_id: string
  title: string
  description: string | null
  display_order: number
}

export interface ProgramCareerOpportunityRead {
  id: string
  program_id: string
  title: string
  description: string | null
  display_order: number
}

// ============================================================================
// Program Field (Champs disciplinaires)
// ============================================================================

export interface ProgramFieldRead {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface ProgramFieldCreatePayload {
  name: string
  slug: string
  description?: string | null
  display_order?: number
}

export interface ProgramFieldUpdatePayload {
  name?: string
  slug?: string
  description?: string | null
  display_order?: number
}

// ============================================================================
// Program Read
// ============================================================================

export interface ProgramRead extends ProgramI18nFields {
  id: string
  code: string
  title: string
  subtitle: string | null
  slug: string
  description_html: string | null
  description_md: string | null
  teaching_methods_html: string | null
  teaching_methods_md: string | null
  objectives: string[] | null
  target_audience: string[] | null
  format_html: string | null
  format_md: string | null
  evaluation_methods_html: string | null
  evaluation_methods_md: string | null
  cover_image_external_id: string | null
  sector_external_id: string | null
  campus_external_id: string | null
  service_external_id: string | null
  coordinator_external_id: string | null
  field_id: string | null
  type: ProgramType
  duration_months: number | null
  credits: number | null
  degree_awarded: string | null
  required_degree: string | null
  status: PublicationStatus
  is_featured: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ProgramWithDetails extends ProgramRead {
  semesters: ProgramSemesterWithCourses[]
  skills: ProgramSkillRead[]
  career_opportunities: ProgramCareerOpportunityRead[]
}

// ============================================================================
// Program Create/Update
// ============================================================================

export interface ProgramCreatePayload extends ProgramI18nFields {
  code: string
  title: string
  subtitle?: string | null
  slug: string
  description_html?: string | null
  description_md?: string | null
  teaching_methods_html?: string | null
  teaching_methods_md?: string | null
  objectives?: string[] | null
  target_audience?: string[] | null
  format_html?: string | null
  format_md?: string | null
  evaluation_methods_html?: string | null
  evaluation_methods_md?: string | null
  cover_image_external_id?: string | null
  sector_external_id?: string | null
  campus_external_id?: string | null
  service_external_id?: string | null
  field_id?: string | null
  type: ProgramType
  duration_months?: number | null
  credits?: number | null
  degree_awarded?: string | null
  required_degree?: string | null
  status?: PublicationStatus
  is_featured?: boolean
  display_order?: number
}

export interface ProgramUpdatePayload extends ProgramI18nFields {
  code?: string
  title?: string
  subtitle?: string | null
  slug?: string
  description_html?: string | null
  description_md?: string | null
  teaching_methods_html?: string | null
  teaching_methods_md?: string | null
  objectives?: string[] | null
  target_audience?: string[] | null
  format_html?: string | null
  format_md?: string | null
  evaluation_methods_html?: string | null
  evaluation_methods_md?: string | null
  cover_image_external_id?: string | null
  sector_external_id?: string | null
  campus_external_id?: string | null
  service_external_id?: string | null
  field_id?: string | null
  type?: ProgramType
  duration_months?: number | null
  credits?: number | null
  degree_awarded?: string | null
  required_degree?: string | null
  status?: PublicationStatus
  is_featured?: boolean
  display_order?: number
}

// ============================================================================
// Program Skill Create/Update
// ============================================================================

export interface ProgramSkillCreatePayload {
  program_id: string
  title: string
  description?: string | null
  display_order?: number
}

export interface ProgramSkillUpdatePayload {
  title?: string
  description?: string | null
  display_order?: number
}

export interface ProgramSkillReorderPayload {
  skill_ids: string[]
}

// ============================================================================
// Career Opportunity Create/Update
// ============================================================================

export interface ProgramCareerOpportunityCreatePayload {
  program_id: string
  title: string
  description?: string | null
  display_order?: number
}

export interface ProgramCareerOpportunityUpdatePayload {
  title?: string
  description?: string | null
  display_order?: number
}

// ============================================================================
// Program Semester Create/Update
// ============================================================================

export interface ProgramSemesterCreatePayload extends SemesterI18nFields {
  program_id: string
  number: number
  title?: string | null
  credits?: number
  display_order?: number
}

export interface ProgramSemesterUpdatePayload extends SemesterI18nFields {
  number?: number
  title?: string | null
  credits?: number
  display_order?: number
}

// ============================================================================
// Program Course Create/Update
// ============================================================================

export interface ProgramCourseCreatePayload extends CourseI18nFields {
  title: string
  code?: string | null
  description?: string | null
  credits?: number | null
  lecture_hours?: number
  tutorial_hours?: number
  practical_hours?: number
  coefficient?: number | null
  display_order?: number
}

export interface ProgramCourseUpdatePayload extends CourseI18nFields {
  title?: string
  code?: string | null
  description?: string | null
  credits?: number | null
  lecture_hours?: number
  tutorial_hours?: number
  practical_hours?: number
  coefficient?: number | null
  display_order?: number
}
