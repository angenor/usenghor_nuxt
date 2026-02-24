/**
 * Types pour les programmes académiques
 */

import type { PublicationStatus } from './common'

// ============================================================================
// Enums
// ============================================================================

export type ProgramType = 'master' | 'doctorate' | 'university_diploma' | 'certificate'

// ============================================================================
// Program Sub-entities Read
// ============================================================================

export interface ProgramCourseRead {
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

export interface ProgramSemesterRead {
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

export interface ProgramRead {
  id: string
  code: string
  title: string
  subtitle: string | null
  slug: string
  description: string | null
  teaching_methods: string | null
  objectives: string | null
  target_audience: string | null
  format: string | null
  evaluation_methods: string | null
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

export interface ProgramCreatePayload {
  code: string
  title: string
  subtitle?: string | null
  slug: string
  description?: string | null
  teaching_methods?: string | null
  objectives?: string | null
  target_audience?: string | null
  format?: string | null
  evaluation_methods?: string | null
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

export interface ProgramUpdatePayload {
  code?: string
  title?: string
  subtitle?: string | null
  slug?: string
  description?: string | null
  teaching_methods?: string | null
  objectives?: string | null
  target_audience?: string | null
  format?: string | null
  evaluation_methods?: string | null
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

export interface ProgramSemesterCreatePayload {
  program_id: string
  number: number
  title?: string | null
  credits?: number
  display_order?: number
}

export interface ProgramSemesterUpdatePayload {
  number?: number
  title?: string | null
  credits?: number
  display_order?: number
}

// ============================================================================
// Program Course Create/Update
// ============================================================================

export interface ProgramCourseCreatePayload {
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

export interface ProgramCourseUpdatePayload {
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
