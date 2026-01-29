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

// ============================================================================
// User Types
// ============================================================================

export interface PermissionRead {
  id: string
  code: string
  name_fr: string
  description: string | null
  category: string | null
  created_at: string
}

export interface RoleRead {
  id: string
  code: string
  name_fr: string
  description: string | null
  hierarchy_level: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface RoleWithPermissions extends RoleRead {
  permissions: PermissionRead[]
}

export interface UserMe {
  id: string
  email: string
  last_name: string
  first_name: string
  salutation: string | null
  birth_date: string | null
  phone: string | null
  phone_whatsapp: string | null
  linkedin: string | null
  city: string | null
  address: string | null
  active: boolean
  email_verified: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
  photo_external_id: string | null
  nationality_external_id: string | null
  residence_country_external_id: string | null
  roles: RoleWithPermissions[]
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
// Event Enums
// ============================================================================

export type EventType = 'conference' | 'workshop' | 'ceremony' | 'seminar' | 'symposium' | 'other'
export type RegistrationStatus = 'registered' | 'confirmed' | 'cancelled' | 'attended'

// ============================================================================
// Event Registration
// ============================================================================

export interface EventRegistrationRead {
  id: string
  event_id: string
  user_external_id: string | null
  last_name: string | null
  first_name: string | null
  email: string
  phone: string | null
  organization: string | null
  status: RegistrationStatus
  registered_at: string
}

// ============================================================================
// Event Read
// ============================================================================

export interface EventRead {
  id: string
  title: string
  slug: string
  description: string | null
  content: string | null
  cover_image_external_id: string | null
  country_external_id: string | null
  campus_external_id: string | null
  sector_external_id: string | null
  project_external_id: string | null
  organizer_external_id: string | null
  album_external_id: string | null
  type: EventType
  type_other: string | null
  start_date: string
  end_date: string | null
  venue: string | null
  address: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  is_online: boolean
  video_conference_link: string | null
  registration_required: boolean
  registration_link: string | null
  max_attendees: number | null
  status: PublicationStatus
  created_at: string
  updated_at: string
}

export interface EventWithRegistrations extends EventRead {
  registrations: EventRegistrationRead[]
  registrations_count: number
}

// ============================================================================
// Event Create / Update
// ============================================================================

export interface EventCreatePayload {
  title: string
  slug: string
  description?: string | null
  content?: string | null
  cover_image_external_id?: string | null
  country_external_id?: string | null
  campus_external_id?: string | null
  sector_external_id?: string | null
  project_external_id?: string | null
  organizer_external_id?: string | null
  album_external_id?: string | null
  type: EventType
  type_other?: string | null
  start_date: string
  end_date?: string | null
  venue?: string | null
  address?: string | null
  city?: string | null
  latitude?: number | null
  longitude?: number | null
  is_online?: boolean
  video_conference_link?: string | null
  registration_required?: boolean
  registration_link?: string | null
  max_attendees?: number | null
  status?: PublicationStatus
}

export interface EventUpdatePayload {
  title?: string
  slug?: string
  description?: string | null
  content?: string | null
  cover_image_external_id?: string | null
  country_external_id?: string | null
  campus_external_id?: string | null
  sector_external_id?: string | null
  project_external_id?: string | null
  organizer_external_id?: string | null
  album_external_id?: string | null
  type?: EventType
  type_other?: string | null
  start_date?: string
  end_date?: string | null
  venue?: string | null
  address?: string | null
  city?: string | null
  latitude?: number | null
  longitude?: number | null
  is_online?: boolean
  video_conference_link?: string | null
  registration_required?: boolean
  registration_link?: string | null
  max_attendees?: number | null
  status?: PublicationStatus
}

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
  sector_external_id: string | null
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
  sector_external_id?: string | null
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
  sector_external_id?: string | null
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

// ============================================================================
// Event Registrations (Content Service)
// ============================================================================

export interface EventRegistrationCreate {
  last_name?: string | null
  first_name?: string | null
  email: string
  phone?: string | null
  organization?: string | null
  user_external_id?: string | null
}

export interface EventRegistrationUpdate {
  last_name?: string | null
  first_name?: string | null
  phone?: string | null
  organization?: string | null
  status?: RegistrationStatus
}

export interface EventRegistrationBulkAction {
  registration_ids: string[]
  action: 'confirm' | 'cancel'
}

export interface EventRegistrationStats {
  total: number
  registered: number
  confirmed: number
  cancelled: number
  attended: number
  capacity?: number
  available_spots?: number
}

// ============================================================================
// Media
// ============================================================================

export type MediaType = 'image' | 'video' | 'audio' | 'document'

export interface MediaRead {
  id: string
  name: string
  description: string | null
  type: MediaType
  url: string
  thumbnail_url: string | null
  size_bytes: number | null
  mime_type: string | null
  width: number | null
  height: number | null
  duration_seconds: number | null
  alt_text: string | null
  credits: string | null
  is_external_url: boolean
  created_at: string
  updated_at: string
}

export interface MediaUploadResponse {
  id: string
  url: string
  name: string
  type: MediaType
  size_bytes: number
  mime_type: string
  width: number | null
  height: number | null
}

export interface MediaUpdatePayload {
  name?: string
  description?: string | null
  alt_text?: string | null
  credits?: string | null
}

// ============================================================================
// Tags
// ============================================================================

export interface TagRead {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  created_at: string
}

export interface TagCreate {
  name: string
  slug: string
  icon?: string | null
  description?: string | null
}

export interface TagUpdate {
  name?: string
  slug?: string
  icon?: string | null
  description?: string | null
}

export interface TagMerge {
  source_tag_ids: string[]
  target_tag_id: string
}

export interface TagUsage {
  news_count: number
}

// ============================================================================
// Projects
// ============================================================================

export type ProjectStatus = 'planned' | 'ongoing' | 'completed' | 'suspended'

export type ProjectCallType = 'application' | 'scholarship' | 'project' | 'recruitment' | 'training'

export type ProjectCallStatus = 'ongoing' | 'closed' | 'upcoming'

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

export interface ProjectStatistics {
  total_projects: number
  ongoing_projects: number
  completed_projects: number
  planned_projects: number
  suspended_projects: number
  total_budget: number
  total_categories: number
}

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

export interface ProjectCountryRead {
  project_id: string
  country_external_id: string
}

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

export interface ProjectMediaRead {
  project_id: string
  album_external_id: string
}

// ============================================================================
// Organization - Sectors
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
// Editorial (Categories & Contents)
// ============================================================================

export type EditorialValueType = 'text' | 'number' | 'json' | 'html' | 'markdown'

// --- Categories ---

export interface EditorialCategoryRead {
  id: string
  code: string
  name: string
  description: string | null
  created_at: string
}

export interface EditorialCategoryWithCount extends EditorialCategoryRead {
  contents_count: number
}

export interface EditorialCategoryCreate {
  code: string
  name: string
  description?: string | null
}

export interface EditorialCategoryUpdate {
  name?: string
  description?: string | null
}

// --- Contents ---

export interface EditorialContentRead {
  id: string
  key: string
  value: string | null
  value_type: EditorialValueType
  category_id: string | null
  year: number | null
  description: string | null
  admin_editable: boolean
  created_at: string
  updated_at: string
}

export interface EditorialContentWithCategory extends EditorialContentRead {
  category: EditorialCategoryRead | null
}

export interface EditorialContentCreate {
  key: string
  value?: string | null
  value_type?: EditorialValueType
  category_id?: string | null
  year?: number | null
  description?: string | null
  admin_editable?: boolean
}

export interface EditorialContentUpdate {
  value?: string | null
  value_type?: EditorialValueType
  category_id?: string | null
  year?: number | null
  description?: string | null
  admin_editable?: boolean
}

// --- History ---

export interface EditorialHistoryRead {
  id: string
  content_id: string
  old_value: string | null
  new_value: string | null
  modified_by_external_id: string | null
  modified_at: string
}

export interface EditorialContentWithHistory extends EditorialContentRead {
  history: EditorialHistoryRead[]
}

// --- Bulk Operations ---

export interface EditorialBulkContentUpdate {
  key: string
  value: string
}

export interface EditorialBulkUpdateRequest {
  updates: EditorialBulkContentUpdate[]
}

export interface EditorialBulkUpdateResult {
  total: number
  updated: number
  errors: number
  not_found: number
}

// --- Value Sections (Frontend-specific types) ---

// Clés principales (sections)
export type ValueSectionKey =
  | 'mission'
  | 'vision'
  | 'history'
  | 'rector_message'
  // Hero section
  | 'hero.slide1.title'
  | 'hero.slide1.subtitle'
  | 'hero.slide2.title'
  | 'hero.slide2.subtitle'
  | 'hero.slide3.title'
  | 'hero.slide3.subtitle'
  | 'hero.slide4.title'
  | 'hero.slide4.subtitle'
  | 'hero.cta.discover'
  | 'hero.cta.contact'
  // Mission section
  | 'mission.badge'
  | 'mission.title'
  | 'mission.subtitle'
  | 'mission.mission.title'
  | 'mission.mission.description'
  | 'mission.mission.tagline'
  | 'mission.vision.title'
  | 'mission.vision.description'
  // Experience section
  | 'experience.badge'
  | 'experience.title'
  | 'experience.description'
  | 'experience.cta'
  | 'experience.stats.countries'
  | 'experience.stats.countries.value'
  | 'experience.stats.graduates'
  | 'experience.stats.graduates.value'
  | 'experience.stats.years'
  | 'experience.stats.years.value'
  // Formations section
  | 'formations.badge'
  | 'formations.title'
  | 'formations.subtitle'
  | 'formations.cta'
  // History section
  | 'history.badge'
  | 'history.title'
  | 'history.subtitle'
  | 'history.genesis.date'
  | 'history.genesis.title'
  | 'history.genesis.description'
  | 'history.usenghor.since'
  | 'history.usenghor.title'
  | 'history.usenghor.description'
  | 'history.legacy.badge'
  | 'history.legacy.title'
  | 'history.legacy.description'
  // Partners/Governance section
  | 'governance.badge'
  | 'governance.title'
  | 'governance.subtitle'
  | 'governance.foundingTexts.badge'
  | 'governance.foundingTexts.title'
  | 'governance.foundingTexts.description'
  | 'governance.donorCountries.title'
  | 'governance.donorCountries.description'
  // Page À propos - Hero
  | 'about.hero.title'
  | 'about.hero.subtitle'
  // Page À propos - Mission
  | 'about.mission.title'
  | 'about.mission.content'
  | 'about.mission.cta.history'
  | 'about.mission.cta.governance'
  // Page À propos - Stats (libellés uniquement, valeurs dans chiffres-clés)
  | 'about.stats.years.label'
  | 'about.stats.countries.label'
  | 'about.stats.alumni.label'
  | 'about.stats.programs.label'
  // Page À propos - Engagements
  | 'about.engagements.title'
  | 'about.engagements.excellence.title'
  | 'about.engagements.excellence.text'
  | 'about.engagements.ethics.title'
  | 'about.engagements.ethics.text'
  | 'about.engagements.inclusion.title'
  | 'about.engagements.inclusion.text'
  | 'about.engagements.innovation.title'
  | 'about.engagements.innovation.text'
  | 'about.engagements.solidarity.title'
  | 'about.engagements.solidarity.text'
  | 'about.charter.title'
  | 'about.charter.download'
  // Page Stratégie - Hero
  | 'strategy.hero.title'
  | 'strategy.hero.subtitle'
  // Page Stratégie - Plan stratégique
  | 'strategy.plan.title'
  | 'strategy.plan.summary'
  | 'strategy.plan.download'
  // Page Stratégie - Axes stratégiques
  | 'strategy.axes.title'
  | 'strategy.axes.subtitle'
  | 'strategy.axes.items.a1.code'
  | 'strategy.axes.items.a1.title'
  | 'strategy.axes.items.a1.description'
  | 'strategy.axes.items.a1.objective1'
  | 'strategy.axes.items.a1.objective2'
  | 'strategy.axes.items.a1.objective3'
  | 'strategy.axes.items.a2.code'
  | 'strategy.axes.items.a2.title'
  | 'strategy.axes.items.a2.description'
  | 'strategy.axes.items.a2.objective1'
  | 'strategy.axes.items.a2.objective2'
  | 'strategy.axes.items.a2.objective3'
  | 'strategy.axes.items.a3.code'
  | 'strategy.axes.items.a3.title'
  | 'strategy.axes.items.a3.description'
  | 'strategy.axes.items.a3.objective1'
  | 'strategy.axes.items.a3.objective2'
  | 'strategy.axes.items.a3.objective3'
  // Page Stratégie - Indicateurs cibles 2030
  | 'strategy.indicators.title'
  | 'strategy.indicators.subtitle'
  | 'strategy.indicators.items.students'
  | 'strategy.indicators.items.programs'
  | 'strategy.indicators.items.women'
  | 'strategy.indicators.items.insertion'
  // Page Stratégie - Levée de fonds
  | 'strategy.fundraising.title'
  | 'strategy.fundraising.subtitle'
  | 'strategy.fundraising.projects.scholarships.title'
  | 'strategy.fundraising.projects.scholarships.description'
  | 'strategy.fundraising.projects.scholarships.amount'
  | 'strategy.fundraising.projects.campus.title'
  | 'strategy.fundraising.projects.campus.description'
  | 'strategy.fundraising.projects.campus.amount'
  | 'strategy.fundraising.projects.research.title'
  | 'strategy.fundraising.projects.research.description'
  | 'strategy.fundraising.projects.research.amount'
  | 'strategy.fundraising.projects.library.title'
  | 'strategy.fundraising.projects.library.description'
  | 'strategy.fundraising.projects.library.amount'
  | 'strategy.fundraising.cta.title'
  | 'strategy.fundraising.cta.text'
  | 'strategy.fundraising.cta.button'
  // Page Organisation - Hero
  | 'organization.hero.title'
  | 'organization.hero.subtitle'
  // Page Organisation - Organigramme
  | 'organization.orgchart.title'
  | 'organization.intro.text'
  // Page Organisation - CTA
  | 'organization.cta.title'
  | 'organization.cta.text'
  | 'organization.cta.button'
  // Page Équipe - Hero
  | 'team.hero.title'
  | 'team.hero.subtitle'
  // Page Équipe - CTA
  | 'team.cta.title'
  | 'team.cta.text'
  | 'team.cta.button'
  // Page Partenaires - Hero
  | 'partners.hero.badge'
  | 'partners.hero.title'
  | 'partners.hero.subtitle'
  // Page Partenaires - Section Campus
  | 'partners.campus.title'
  | 'partners.campus.subtitle'
  // Page Partenaires - Section Liste des partenaires
  | 'partners.list.badge'
  | 'partners.list.title'
  | 'partners.list.subtitle'

export interface ValueSection {
  id: string
  key: ValueSectionKey
  title: string
  content: string
  value_type: EditorialValueType
  category_id: string | null
  display_order: number
  admin_editable: boolean
  created_at: string
  updated_at: string
}

// --- Core Values (Frontend-specific types, stored as JSON in backend) ---

export interface CoreValueData {
  title: string
  description: string
  icon: string
  display_order: number
  is_active: boolean
}

export interface CoreValue extends CoreValueData {
  id: string
  created_at: string
  updated_at: string
}

// --- Statistics ---

export interface EditorialValuesStats {
  sections_count: number
  core_values_count: number
  active_core_values: number
  last_updated: string | null
}

// ============================================================================
// Social Media (Réseaux sociaux)
// ============================================================================

export type SocialMediaPlatform =
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'whatsapp'
  | 'telegram'
  | 'other'

// Données JSON stockées dans editorial_contents.value
export interface SocialMediaData {
  platform: SocialMediaPlatform
  url: string
  active: boolean
  display_order: number
  custom_label?: string
}

// Structure complète d'un réseau social (avec métadonnées)
export interface SocialMediaLink extends SocialMediaData {
  id: string
  created_at: string
  updated_at: string
}

// Payload de création
export interface SocialMediaCreatePayload {
  platform: SocialMediaPlatform
  url: string
  active?: boolean
  display_order?: number
  custom_label?: string
}

// Payload de mise à jour
export interface SocialMediaUpdatePayload {
  platform?: SocialMediaPlatform
  url?: string
  active?: boolean
  display_order?: number
  custom_label?: string
}

// Statistiques des réseaux sociaux
export interface SocialMediaStats {
  total_count: number
  active_count: number
  inactive_count: number
  platforms_used: SocialMediaPlatform[]
  last_updated: string | null
}

// ============================================================================
// Audit Logs (correspond à app/schemas/identity.py)
// ============================================================================

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout'

// Log d'audit en lecture
export interface AuditLogRead {
  id: string
  user_id: string | null
  action: AuditAction
  table_name: string | null
  record_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// Log d'audit avec infos utilisateur (enrichi côté frontend)
export interface AuditLogWithUser extends AuditLogRead {
  user?: {
    id: string
    name: string
    email: string
  }
  summary?: string
}

// Détail d'un log d'audit avec les changements
export interface AuditLogDetail extends AuditLogWithUser {
  changes: AuditChange[]
}

// Changement individuel pour l'affichage diff
export interface AuditChange {
  field: string
  old: unknown
  new: unknown
}

// Filtres pour la liste des logs
export interface AuditLogFilters {
  user_id?: string
  action?: AuditAction
  table_name?: string
  date_from?: string
  date_to?: string
  ip_address?: string
  search?: string
}

// Statistiques des logs d'audit
export interface AuditLogStatistics {
  total: number
  by_action: Record<AuditAction, number>
  by_table: Record<string, number>
  by_user?: { user_id: string; count: number }[]
  by_day?: { date: string; count: number }[]
}

// Statistiques enrichies pour l'affichage UI
export interface AuditLogStatsUI {
  total_events: number
  by_action: Record<AuditAction, number>
  by_table: { table: string; count: number }[]
  by_user: { user_id: string; user_name: string; count: number }[]
  by_day: { date: string; count: number }[]
}

// Requête de purge des logs
export interface AuditLogPurgePayload {
  before_date: string
}
