/**
 * Types pour les candidatures
 */

// ============================================================================
// Enums
// ============================================================================

export type ApplicationStatus = 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted' | 'incomplete'
export type Salutation = 'Mr' | 'Mrs' | 'Dr' | 'Pr'
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'other'
export type EmploymentStatus = 'student' | 'teacher' | 'civil_servant' | 'private_employee' | 'ngo_employee' | 'unemployed' | 'other'
export type ExperienceDuration = 'less_than_1_year' | 'between_1_3_years' | 'between_3_5_years' | 'between_5_10_years' | 'more_than_10_years'

// ============================================================================
// Application Sub-entities Read
// ============================================================================

export interface ApplicationDegreeRead {
  id: string
  application_id: string
  title: string
  year: number | null
  institution: string | null
  city: string | null
  country_external_id: string | null
  specialization: string | null
  honors: string | null
  display_order: number
}

export interface ApplicationDocumentRead {
  id: string
  application_id: string
  document_name: string
  required_document_id: string | null
  media_external_id: string | null
  is_valid: boolean | null
  validation_comment: string | null
  created_at: string
}

// ============================================================================
// Application Read
// ============================================================================

export interface ApplicationRead {
  id: string
  reference_number: string
  call_id: string | null
  program_external_id: string | null
  user_external_id: string | null
  reviewer_external_id: string | null

  // Personal info
  salutation: Salutation | null
  last_name: string
  first_name: string
  birth_date: string | null
  birth_city: string | null
  birth_country_external_id: string | null
  nationality_external_id: string | null
  country_external_id: string | null
  marital_status: MaritalStatus | null
  employment_status: EmploymentStatus | null
  employment_status_other: string | null

  // Contact
  address: string | null
  city: string | null
  postal_code: string | null
  phone: string | null
  phone_whatsapp: string | null
  email: string

  // Professional
  has_work_experience: boolean
  current_job: string | null
  job_title: string | null
  employer_name: string | null
  employer_address: string | null
  employer_city: string | null
  employer_country_external_id: string | null
  employer_phone: string | null
  employer_email: string | null
  experience_duration: ExperienceDuration | null

  // Academic
  highest_degree_level: string | null
  highest_degree_title: string | null
  degree_date: string | null
  degree_location: string | null

  // Review
  status: ApplicationStatus
  submitted_at: string
  reviewed_at: string | null
  review_notes: string | null
  review_score: number | null
  created_at: string
  updated_at: string
}

export interface ApplicationWithDetails extends ApplicationRead {
  degrees: ApplicationDegreeRead[]
  documents: ApplicationDocumentRead[]
}

// ============================================================================
// Application Statistics
// ============================================================================

export interface ApplicationStatistics {
  total: number
  submitted: number
  under_review: number
  accepted: number
  rejected: number
  waitlisted: number
  incomplete: number
}

export interface TimelineDataPoint {
  period: string
  count: number
}

export interface ProgramStatistics {
  program_id: string
  program_title: string
  total: number
  accepted: number
  acceptance_rate: number
}

export interface CallStatistics {
  call_id: string
  call_title: string
  total: number
  submitted: number
  under_review: number
  accepted: number
  rejected: number
  waitlisted: number
  incomplete: number
}

export interface ExtendedApplicationStatistics {
  total: number
  pending: number
  acceptance_rate: number
  completion_rate: number
  by_status: Record<ApplicationStatus, number>
  timeline: TimelineDataPoint[]
  by_program: ProgramStatistics[]
  by_call: CallStatistics[]
}

export interface StatisticsFilters {
  call_id?: string
  date_from?: string
  date_to?: string
  granularity?: 'day' | 'week' | 'month'
}

// ============================================================================
// Application Status Update
// ============================================================================

export interface ApplicationStatusUpdatePayload {
  status: ApplicationStatus
  review_notes?: string | null
  review_score?: number | null
  reviewer_external_id?: string | null
}
