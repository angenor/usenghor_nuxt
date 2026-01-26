/**
 * Types API alignés sur les schemas Pydantic du backend (app/schemas/application.py)
 */

// ============================================================================
// Pagination
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

// ============================================================================
// Enums (correspondent aux enums Python du backend)
// ============================================================================

export type CallType = 'application' | 'scholarship' | 'project' | 'recruitment' | 'training'
export type CallStatus = 'ongoing' | 'closed' | 'upcoming'
export type PublicationStatus = 'draft' | 'published' | 'archived'

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
  created_by_external_id: string | null
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
// Application Call Create / Update
// ============================================================================

export interface ApplicationCallCreatePayload {
  title: string
  slug: string
  description?: string | null
  cover_image_external_id?: string | null
  program_external_id?: string | null
  campus_external_id?: string | null
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

// ============================================================================
// Auth
// ============================================================================

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface IdResponse {
  id: string
}

export interface MessageResponse {
  message: string
}

// ============================================================================
// Application Enums
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

// ============================================================================
// Extended Application Statistics
// ============================================================================

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

// ============================================================================
// Program Enums
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
  cover_image_external_id: string | null
  department_external_id: string | null
  coordinator_external_id: string | null
  type: ProgramType
  duration_months: number | null
  credits: number | null
  degree_awarded: string | null
  required_degree: string | null
  status: PublicationStatus
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
  department_external_id?: string | null
  type: ProgramType
  duration_months?: number | null
  credits?: number | null
  degree_awarded?: string | null
  required_degree?: string | null
  status?: PublicationStatus
  display_order?: number
}

export interface ProgramUpdatePayload {
  code?: string
  title?: string
  subtitle?: string | null
  slug?: string
  description?: string | null
  teaching_methods?: string | null
  department_external_id?: string | null
  type?: ProgramType
  duration_months?: number | null
  credits?: number | null
  degree_awarded?: string | null
  required_degree?: string | null
  status?: PublicationStatus
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
