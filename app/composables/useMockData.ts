/**
 * Composable pour accéder aux données mock
 * Permet de développer le frontend sans base de données
 *
 * Usage:
 * const { departments, staff, formations } = useMockData()
 *
 * Pour basculer vers l'API réelle, remplacer les imports par des appels API
 */

import { mockDepartments, type Department } from '@bank/mock-data/departments'
import { mockServices, type Service } from '@bank/mock-data/services'
import { mockStaff, type Staff } from '@bank/mock-data/staff'
import { mockPaysBailleurs, getFlagEmoji, type PaysBailleur } from '@bank/mock-data/pays-bailleurs'
import { mockConseilAdministration, type CAMember } from '@bank/mock-data/conseil-administration'
import { mockCampusExternalises, campusPrincipal, type CampusExternalise } from '@bank/mock-data/campus-externalises'
import { mockPartenaires, mockCharterOperators, mockCampusPartners, type Partenaire, type PartnerCategory, type PartnerType } from '@bank/mock-data/partenaires'
import { mockFormations, type Formation, type ProgramModule, type ProgramSemester } from '@bank/mock-data/formations'
import { mockDocuments, type Document } from '@bank/mock-data/documents'
import {
  mockCampusTeam,
  getAllCampusTeamMembers,
  getCampusTeamMemberById as getCampusTeamMemberByIdFromMock,
  getCampusTeamByCampus,
  countTeamMembersByCampus,
  getCampusTeamStats,
  searchAvailableUsers,
  mockAvailableUsers,
  commonPositions,
  generateCampusTeamId,
  type CampusTeamMember,
  type CampusTeamUser,
  type CampusTeamFilters
} from '@bank/mock-data/campus-team'
import { mockCampusCalls, type CampusCall } from '@bank/mock-data/campus-calls'
import { mockCampusEvents, type CampusEvent } from '@bank/mock-data/campus-events'
import { mockCampusNews, type CampusNews } from '@bank/mock-data/campus-news'
import { mockCampusMedia, type CampusMedia } from '@bank/mock-data/campus-media'
import { mockCampusFormationsRealisees, type CampusFormationRealisee } from '@bank/mock-data/campus-formations-realisees'
import {
  mockProjects,
  getAllProjectsAdmin,
  getProjectByIdAdmin,
  getProjectBySlugAdmin,
  getFilteredProjects as getFilteredProjectsFromMock,
  getProjectStats,
  projectStatusLabels,
  projectStatusColors,
  projectPublicationStatusLabels,
  projectPublicationStatusColors,
  generateProjectId,
  generateProjectPartnerId,
  generateProjectCountryId,
  slugifyProject,
  getFlagEmoji as getProjectFlagEmoji,
  type Project,
  type ProjectPartner,
  type ProjectCountry,
  type ProjectStatus,
  type PublicationStatus as ProjectPublicationStatus,
  type ProjectFilters,
  type ProjectStats
} from '@bank/mock-data/projets'
import { mockAlumni, type Alumnus, type Industry } from '@bank/mock-data/alumni'
import { mockSiteFacilities, type SiteFacility } from '@bank/mock-data/site-facilities'
import { mockSiteGallery, type SiteGalleryItem, type MediaType } from '@bank/mock-data/site-gallery'
import { mockAuditLogs, mockActiveUsersCount, type AuditLog, type AuditAction } from '@bank/mock-data/audit-logs'
import { mockProgramSkills, generateSkillId, type ProgramSkill } from '@bank/mock-data/program-skills'
import { mockProgramCareerOpportunities, generateCareerOpportunityId, type ProgramCareerOpportunity } from '@bank/mock-data/program-career-opportunities'
import { mockProgramSemesters, mockProgramCourses, generateSemesterId, generateCourseId, type ProgramSemesterData, type ProgramCourse } from '@bank/mock-data/program-semesters'
import {
  mockApplicationCalls,
  callTypeLabels,
  callTypeColors,
  callStatusLabels,
  callStatusColors,
  publicationStatusLabels,
  publicationStatusColors,
  generateCallId,
  generateCriteriaId,
  generateCoverageId,
  generateDocumentId,
  generateScheduleId,
  type ApplicationCall,
  type EligibilityCriteria,
  type CallCoverage,
  type RequiredDocument,
  type CallScheduleItem,
  type CallType,
  type CallStatus,
  type PublicationStatus
} from '@bank/mock-data/application-calls'
import {
  mockApplications,
  mockReviewers,
  applicationStatusLabels,
  applicationStatusColors,
  salutationLabels,
  maritalStatusLabels,
  employmentStatusLabels,
  experienceDurationLabels,
  getApplicationsStats,
  getReviewerStats,
  getGlobalStatistics,
  getTimelineStatistics,
  getStatisticsByProgram,
  getStatisticsByCountry,
  getStatisticsByCall,
  generateApplicationId,
  generateDegreeId,
  generateDocId,
  type Application,
  type ApplicationDegree,
  type ApplicationDocument,
  type ApplicationStatus,
  type MaritalStatus,
  type EmploymentStatus,
  type ExperienceDuration,
  type Salutation,
  type Reviewer,
  type ApplicationStatistics,
  type TimelineDataPoint,
  type ProgramStatistics,
  type CountryStatistics,
  type CallStatistics
} from '@bank/mock-data/applications'
import {
  mockNews,
  mockNewsTags,
  mockNewsAuthors,
  newsStatusLabels,
  newsStatusColors,
  highlightStatusLabels,
  highlightStatusColors,
  getNewsStats,
  getFilteredNews,
  getNewsById as getAdminNewsById,
  getNewsBySlug as getAdminNewsBySlug,
  generateNewsId,
  generateTagId as generateNewsTagId,
  generateMediaId,
  type News,
  type NewsTag,
  type NewsMedia,
  type NewsAuthor,
  type NewsStatus,
  type HighlightStatus,
  type NewsStats,
  type NewsFilters,
  type EditorJSContent,
  type EditorJSBlock
} from '@bank/mock-data/news'
import {
  mockTags,
  tagColors,
  availableIcons,
  generateTagId,
  slugify,
  getAllTags as getAllTagsFromMock,
  getTagById as getTagByIdFromMock,
  getTagBySlug as getTagBySlugFromMock,
  getTagStats,
  isTagUsed,
  type Tag,
  type TagStats
} from '@bank/mock-data/tags'
import {
  mockEvents,
  eventTypeLabels,
  eventTypeColors,
  eventStatusLabels,
  eventStatusColors,
  generateEventId,
  generateEventPartnerId,
  getAllEvents as getAllEventsFromMock,
  getEventById as getEventByIdFromMock,
  getEventBySlug as getEventBySlugFromMock,
  getEventStats,
  getFilteredEvents,
  slugifyEvent,
  type Event,
  type EventPartner,
  type EventType,
  type EventStatus,
  type EventStats,
  type EventFilters
} from '@bank/mock-data/events'
import {
  mockRegistrations,
  registrationStatusLabels,
  registrationStatusColors,
  generateRegistrationId,
  getAllRegistrations as getAllRegistrationsFromMock,
  getRegistrationById as getRegistrationByIdFromMock,
  getRegistrationsByEventId as getRegistrationsByEventIdFromMock,
  getGlobalRegistrationStats,
  getEventRegistrationStats,
  getFilteredRegistrations,
  getEventsWithRegistrations,
  type EventRegistration,
  type RegistrationStatus,
  type RegistrationStats,
  type RegistrationFilters
} from '@bank/mock-data/event-registrations'
import {
  mockProjectCalls,
  projectCallTypeLabels,
  projectCallTypeColors,
  projectCallStatusLabels,
  projectCallStatusColors,
  generateProjectCallId,
  getAllProjectCalls as getAllProjectCallsFromMock,
  getProjectCallById as getProjectCallByIdFromMock,
  getProjectCallsByProjectId as getProjectCallsByProjectIdFromMock,
  getProjectCallStats,
  getFilteredProjectCalls,
  getProjectsForSelect,
  type ProjectCall,
  type ProjectCallType,
  type ProjectCallStatus,
  type ProjectCallStats,
  type ProjectCallFilters
} from '@bank/mock-data/project-calls'
import {
  mockProjectCategories,
  categoryIcons,
  generateProjectCategoryId,
  slugifyCategory,
  getAllProjectCategories as getAllProjectCategoriesFromMock,
  getProjectCategoryById as getProjectCategoryByIdFromMock,
  getProjectCategoryBySlug as getProjectCategoryBySlugFromMock,
  getFilteredProjectCategories,
  getProjectCategoryStats,
  isProjectCategoryUsed,
  checkProjectCategoryUsage,
  type ProjectCategory,
  type ProjectCategoryStats,
  type ProjectCategoryFilters,
  type CategoryUsage
} from '@bank/mock-data/project-categories'
import {
  mockDepartmentsAdmin,
  departmentIcons,
  generateDepartmentId,
  generateDepartmentCode,
  getAllDepartmentsAdmin as getAllDepartmentsAdminFromMock,
  getDepartmentByIdAdmin as getDepartmentByIdAdminFromMock,
  getDepartmentByCodeAdmin as getDepartmentByCodeAdminFromMock,
  getFilteredDepartmentsAdmin as getFilteredDepartmentsAdminFromMock,
  getDepartmentStats,
  checkDepartmentUsage,
  getDepartmentHeadCandidates as getDepartmentHeadCandidatesFromMock,
  getDepartmentsForSelect as getDepartmentsForSelectFromMock,
  type DepartmentAdmin,
  type DepartmentStats,
  type DepartmentFilters,
  type DepartmentUsage
} from '@bank/mock-data/departments-admin'
import {
  mockServiceObjectives,
  mockServiceAchievements,
  mockServiceProjects,
  serviceProjectStatusLabels,
  serviceProjectStatusColors,
  achievementTypes,
  generateServiceObjectiveId,
  generateServiceAchievementId,
  generateServiceProjectId,
  getServiceObjectives as getServiceObjectivesFromMock,
  getServiceObjectiveById as getServiceObjectiveByIdFromMock,
  getServiceAchievements as getServiceAchievementsFromMock,
  getServiceAchievementById as getServiceAchievementByIdFromMock,
  getServiceAchievementsByType as getServiceAchievementsByTypeFromMock,
  getServiceProjects as getServiceProjectsFromMock,
  getServiceProjectById as getServiceProjectByIdFromMock,
  getServiceProjectsByStatus as getServiceProjectsByStatusFromMock,
  getServiceOverview as getServiceOverviewFromMock,
  getServiceObjectivesStats as getServiceObjectivesStatsFromMock,
  getServicesWithData as getServicesWithDataFromMock,
  getServicesGroupedByCategory as getServicesGroupedByCategoryFromMock,
  type ServiceObjective,
  type ServiceAchievement,
  type ServiceProject,
  type ServiceProjectStatus,
  type ServiceOverview,
  type ServiceObjectivesStats,
  type ServiceWithData
} from '@bank/mock-data/service-objectives'
import {
  mockServicesAdmin,
  serviceCategoryLabels,
  generateServiceId,
  getAllServicesAdmin as getAllServicesAdminFromMock,
  getServiceByIdAdmin as getServiceByIdAdminFromMock,
  getServicesByDepartmentId as getServicesByDepartmentIdFromMock,
  getFilteredServicesAdmin as getFilteredServicesAdminFromMock,
  getServicesGroupedByDepartment as getServicesGroupedByDepartmentFromMock,
  getServiceStats,
  checkServiceUsage,
  getServiceHeadCandidates as getServiceHeadCandidatesFromMock,
  getServicesForSelect as getServicesForSelectFromMock,
  getDepartmentsForServiceSelect as getDepartmentsForServiceSelectFromMock,
  type ServiceAdmin,
  type ServiceStats,
  type ServiceFilters,
  type ServiceUsage,
  type ServicesByDepartment
} from '@bank/mock-data/services-admin'
import {
  mockCampusAdmin,
  mockCampusPartnersAdmin,
  generateCampusId,
  generateCampusCode,
  getAllCampusAdmin as getAllCampusAdminFromMock,
  getCampusByIdAdmin as getCampusByIdAdminFromMock,
  getCampusByCodeAdmin as getCampusByCodeAdminFromMock,
  getFilteredCampusAdmin as getFilteredCampusAdminFromMock,
  getCampusStats,
  checkCampusUsage,
  getCampusPartnersById as getCampusPartnersByIdFromMock,
  getCampusForSelect as getCampusForSelectFromMock,
  getCampusCountries as getCampusCountriesFromMock,
  getCampusHeadCandidates as getCampusHeadCandidatesFromMock,
  type CampusAdmin,
  type CampusPartnerAdmin,
  type CampusStats,
  type CampusFilters,
  type CampusUsage
} from '@bank/mock-data/campus-admin'
import {
  mockPartnersAdmin,
  mockCountries,
  partnerTypeLabels,
  partnerTypeColors,
  generatePartnerId,
  getAllPartnersAdmin as getAllPartnersAdminFromMock,
  getPartnerByIdAdmin as getPartnerByIdAdminFromMock,
  getFilteredPartnersAdmin as getFilteredPartnersAdminFromMock,
  getPartnersByType as getPartnersByTypeFromMock,
  getPartnerStats,
  checkPartnerAssociations,
  getPartnersForSelect as getPartnersForSelectFromMock,
  getCountriesForSelect as getCountriesForSelectFromMock,
  getPartnerTypesForSelect as getPartnerTypesForSelectFromMock,
  type PartnerAdmin,
  type PartnerStats,
  type PartnerFilters,
  type PartnerAssociations,
  type PartnerTypeSql,
  type CountryOption
} from '@bank/mock-data/partners-admin'
import {
  mockMediaAdmin,
  mockAlbumsAdmin,
  mockAlbumMediaAdmin,
  generateAlbumId,
  getAllAlbumsAdmin as getAllAlbumsAdminFromMock,
  getAlbumByIdAdmin as getAlbumByIdAdminFromMock,
  getFilteredAlbumsAdmin as getFilteredAlbumsAdminFromMock,
  getAlbumStats,
  checkAlbumUsage,
  getAlbumMediaAdmin as getAlbumMediaAdminFromMock,
  getAllMediaAdmin as getAllMediaAdminFromMock,
  getMediaByIdAdmin as getMediaByIdAdminFromMock,
  getMediaByTypeAdmin as getMediaByTypeAdminFromMock,
  getFilteredMediaAdmin as getFilteredMediaAdminFromMock,
  getMediaStats,
  checkMediaUsage,
  getAvailableMediaForAlbum as getAvailableMediaForAlbumFromMock,
  getAlbumsForSelect as getAlbumsForSelectFromMock,
  albumStatusLabels,
  albumStatusColors,
  mediaTypeLabels,
  mediaTypeIcons,
  mediaTypeColors,
  formatFileSize,
  formatDuration,
  type MediaAdmin,
  type AlbumAdmin,
  type AlbumMediaAdmin,
  type AlbumStats,
  type AlbumFilters,
  type AlbumUsage,
  type MediaFilters,
  type MediaStats,
  type MediaUsageResult,
  type MediaType as AlbumMediaType,
  type PublicationStatus as AlbumPublicationStatus
} from '@bank/mock-data/albums-admin'
import {
  mockNewsletterSubscribers,
  sourceLabels,
  sourceColors,
  generateSubscriberId,
  generateUnsubscribeToken,
  getAllSubscribers as getAllSubscribersFromMock,
  getSubscriberById as getSubscriberByIdFromMock,
  getSubscriberByEmail as getSubscriberByEmailFromMock,
  isEmailTaken as isEmailTakenFromMock,
  getSubscriberStats,
  validateEmail as validateSubscriberEmail,
  simulateImport,
  exportSubscribersToCSV,
  type NewsletterSubscriber,
  type SubscriberSource,
  type SubscriberFilters,
  type SubscriberStats,
  type ImportResult
} from '@bank/mock-data/newsletter-subscribers'

export function useMockData() {
  // === DÉPARTEMENTS ===
  const departments = computed(() => mockDepartments)

  const getDepartmentById = (id: string) =>
    mockDepartments.find(d => d.id === id)

  const getDepartmentBySlug = (slug: string) =>
    mockDepartments.find(d => d.slug === slug)

  // === SERVICES ===
  const services = computed(() => mockServices)

  const getServicesByCategory = (category: Service['category']) =>
    mockServices.filter(s => s.category === category)

  const getServiceById = (id: string) =>
    mockServices.find(s => s.id === id)

  // === STAFF ===
  const staff = computed(() => mockStaff.filter(s => s.is_published))

  const getStaffByType = (type: Staff['staff_type']) =>
    mockStaff.filter(s => s.is_published && s.staff_type === type)

  const getStaffByDepartment = (departmentId: string) =>
    mockStaff.filter(s => s.is_published && s.department_id === departmentId)

  const getStaffByService = (serviceId: string) =>
    mockStaff.filter(s => s.is_published && s.service_id === serviceId)

  const getStaffById = (id: string) =>
    mockStaff.find(s => s.id === id)

  // === PAYS BAILLEURS ===
  const paysBailleurs = computed(() => mockPaysBailleurs.filter(p => p.is_active))

  // === CONSEIL D'ADMINISTRATION ===
  const conseilAdministration = computed(() =>
    mockConseilAdministration.filter(m => m.is_active)
  )

  const getCAPresident = () =>
    mockConseilAdministration.find(m => m.ca_role === 'president' && m.is_active)

  const getCAMembers = () =>
    mockConseilAdministration.filter(m => m.ca_role === 'membre' && m.is_active)

  // === CAMPUS EXTERNALISÉS ===
  const campusExternalises = computed(() =>
    mockCampusExternalises.filter(c => c.is_active)
  )

  const getCampusById = (id: string) =>
    mockCampusExternalises.find(c => c.id === id)

  const getCampusBySlug = (slug: string) =>
    mockCampusExternalises.find(c => c.slug === slug)

  // === PAYS AFRICAINS (pour projets) ===
  const africanCountries = [
    { code: 'DZ', name: 'Algérie' },
    { code: 'AO', name: 'Angola' },
    { code: 'BJ', name: 'Bénin' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BI', name: 'Burundi' },
    { code: 'CV', name: 'Cap-Vert' },
    { code: 'CM', name: 'Cameroun' },
    { code: 'CF', name: 'Centrafrique' },
    { code: 'TD', name: 'Tchad' },
    { code: 'KM', name: 'Comores' },
    { code: 'CG', name: 'Congo' },
    { code: 'CD', name: 'RDC' },
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'EG', name: 'Égypte' },
    { code: 'GQ', name: 'Guinée équatoriale' },
    { code: 'ER', name: 'Érythrée' },
    { code: 'SZ', name: 'Eswatini' },
    { code: 'ET', name: 'Éthiopie' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambie' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GN', name: 'Guinée' },
    { code: 'GW', name: 'Guinée-Bissau' },
    { code: 'KE', name: 'Kenya' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LY', name: 'Libye' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MW', name: 'Malawi' },
    { code: 'ML', name: 'Mali' },
    { code: 'MR', name: 'Mauritanie' },
    { code: 'MU', name: 'Maurice' },
    { code: 'MA', name: 'Maroc' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'NA', name: 'Namibie' },
    { code: 'NE', name: 'Niger' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'ST', name: 'Sao Tomé-et-Príncipe' },
    { code: 'SN', name: 'Sénégal' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'SO', name: 'Somalie' },
    { code: 'ZA', name: 'Afrique du Sud' },
    { code: 'SS', name: 'Soudan du Sud' },
    { code: 'SD', name: 'Soudan' },
    { code: 'TZ', name: 'Tanzanie' },
    { code: 'TG', name: 'Togo' },
    { code: 'TN', name: 'Tunisie' },
    { code: 'UG', name: 'Ouganda' },
    { code: 'ZM', name: 'Zambie' },
    { code: 'ZW', name: 'Zimbabwe' },
    { code: 'UN', name: 'International' }
  ]

  const countries = africanCountries

  // === PARTENAIRES ===
  const partenaires = computed(() => mockPartenaires.filter(p => p.is_active))

  // Opérateurs et acteurs de la charte (OIF, APF, AUF, AIMF)
  const charterOperators = computed(() => mockCharterOperators.filter(p => p.is_active))

  // Partenaires Campus (institutions partenaires)
  const campusPartners = computed(() => mockCampusPartners.filter(p => p.is_active))

  const getPartenairesByCategory = (category: PartnerCategory) =>
    mockPartenaires.filter(p => p.is_active && p.category === category)

  const getPartenairesByType = (type: PartnerType) =>
    mockPartenaires.filter(p => p.is_active && p.partner_type === type)

  const getCampusPartnersByType = (type: PartnerType) =>
    mockCampusPartners.filter(p => p.is_active && p.partner_type === type)

  // === DONNÉES CAMPUS (équipes, appels, événements, actualités, médias) ===
  const getCampusTeam = (campusId: string) =>
    mockCampusTeam.filter(m => m.campus_id === campusId && m.active).sort((a, b) => a.display_order - b.display_order)

  // === ÉQUIPES CAMPUS (ADMIN) ===
  const campusTeamAdmin = computed(() => mockCampusTeam)

  const getAllCampusTeamAdmin = (filters?: CampusTeamFilters) => getAllCampusTeamMembers(filters)

  const getCampusTeamMemberById = (id: string) => getCampusTeamMemberByIdFromMock(id)

  const getCampusTeamByCampusAdmin = (campusId: string, activeOnly = true) => getCampusTeamByCampus(campusId, activeOnly)

  const countCampusTeamMembers = (campusId: string, activeOnly = true) => countTeamMembersByCampus(campusId, activeOnly)

  const getCampusTeamStatsAdmin = () => getCampusTeamStats()

  const searchUsersForTeam = (query: string) => searchAvailableUsers(query)

  const availableUsers = computed(() => mockAvailableUsers)

  const getCampusCalls = (campusId: string) =>
    mockCampusCalls.filter(c => c.campus_id === campusId && c.is_active && c.status === 'open' && c.type !== 'recrutement')

  const getCampusClosedCalls = (campusId: string) =>
    mockCampusCalls.filter(c => c.campus_id === campusId && c.is_active && c.status === 'closed')

  const getCampusRecruitments = (campusId: string) =>
    mockCampusCalls.filter(c => c.campus_id === campusId && c.is_active && c.type === 'recrutement')

  const getCampusEvents = (campusId: string) =>
    mockCampusEvents.filter(e => e.campus_id === campusId)

  const getCampusNews = (campusId: string) =>
    mockCampusNews.filter(n => n.campus_id === campusId)

  const getCampusMedia = (campusId: string) =>
    mockCampusMedia.filter(m => m.campus_id === campusId)

  const getCampusMediaByType = (campusId: string, type: CampusMedia['type']) =>
    mockCampusMedia.filter(m => m.campus_id === campusId && m.type === type)

  // === FORMATIONS RÉALISÉES PAR CAMPUS ===
  const getCampusFormationsRealisees = (campusId: string) =>
    mockCampusFormationsRealisees.filter(f => f.campus_id === campusId).sort((a, b) => b.year - a.year)

  // === DONNÉES SIÈGE ALEXANDRIE (pour pages /actualites) ===
  // Actualités du siège triées par date décroissante
  const getAllNews = () =>
    [...mockCampusNews]
      .filter(n => n.campus_id === 'siege')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Événements du siège triés par date croissante
  const getAllEvents = () =>
    [...mockCampusEvents]
      .filter(e => e.campus_id === 'siege')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Événements à venir (siège uniquement)
  const getUpcomingEvents = () => {
    const now = new Date()
    return [...mockCampusEvents]
      .filter(e => e.campus_id === 'siege' && new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Événements passés (siège uniquement)
  const getPastEvents = () => {
    const now = new Date()
    return [...mockCampusEvents]
      .filter(e => e.campus_id === 'siege' && new Date(e.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // Événements à la une (featured, à venir uniquement)
  const getFeaturedEvents = () => {
    const now = new Date()
    return [...mockCampusEvents]
      .filter(e => e.is_featured && new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Actualités à la une (featured)
  const getFeaturedNews = () =>
    [...mockCampusNews]
      .filter(n => n.is_featured)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Appels du siège (tous types, tous statuts)
  const getAllCalls = () =>
    [...mockCampusCalls]
      .filter(c => c.campus_id === 'siege' && c.is_active)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  // Appels ouverts du siège (hors recrutements)
  const getAllOpenCalls = () =>
    [...mockCampusCalls]
      .filter(c => c.campus_id === 'siege' && c.is_active && c.status === 'open' && c.type !== 'recrutement')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  // Appels clos du siège
  const getAllClosedCalls = () =>
    [...mockCampusCalls]
      .filter(c => c.campus_id === 'siege' && c.status === 'closed')
      .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())

  // Recrutements du siège
  const getAllRecruitments = () =>
    [...mockCampusCalls]
      .filter(c => c.campus_id === 'siege' && c.is_active && c.type === 'recrutement')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  // === GETTERS PAR ID (pour pages de détails) ===
  const getNewsById = (id: string) =>
    mockCampusNews.find(n => n.id === id)

  const getNewsBySlug = (slug: string) =>
    mockCampusNews.find(n => n.url === `/actualites/${slug}` || n.id === slug)

  const getCallById = (id: string) =>
    mockCampusCalls.find(c => c.id === id)

  const getEventById = (id: string) =>
    mockCampusEvents.find(e => e.id === id)

  // === FORMATIONS ===
  const formations = computed(() => mockFormations.filter(f => f.is_published))

  const getFormationsFeatured = () =>
    mockFormations.filter(f => f.is_published && f.is_featured)

  const getFormationsByType = (type: Formation['formation_type']) =>
    mockFormations.filter(f => f.is_published && f.formation_type === type)

  const getFormationsByCampus = (campus: Formation['campus']) =>
    mockFormations.filter(f => f.is_published && f.campus === campus)

  const getFormationsByDepartment = (departmentId: string) =>
    mockFormations.filter(f => f.is_published && f.department_id === departmentId)

  const getFormationBySlug = (slug: string) =>
    mockFormations.find(f => f.slug === slug)

  // Get formations count by type
  const getFormationsCountByType = () => {
    const published = mockFormations.filter(f => f.is_published)
    return {
      master: published.filter(f => f.formation_type === 'master').length,
      doctorat: published.filter(f => f.formation_type === 'doctorat').length,
      du: published.filter(f => f.formation_type === 'du').length,
      certifiante: published.filter(f => f.formation_type === 'certifiante').length
    }
  }

  // Get formations with open applications
  const getFormationsWithOpenApplications = () =>
    mockFormations.filter(f => f.is_published && f.application_open)

  // Get related formations (same type or department, excluding current)
  const getRelatedFormations = (formation: Formation, limit = 3) =>
    mockFormations
      .filter(f => f.is_published && f.id !== formation.id && (
        f.formation_type === formation.formation_type ||
        f.department_id === formation.department_id
      ))
      .slice(0, limit)

  // === DOCUMENTS ===
  const documents = computed(() => mockDocuments.filter(d => d.is_public))

  const getDocumentsByCategory = (category: Document['document_category']) =>
    mockDocuments.filter(d => d.is_public && d.document_category === category)

  const getTextesFondateurs = () =>
    getDocumentsByCategory('texte_fondateur')

  // === PROJETS ===
  const projects = computed(() => mockProjects)

  const getAllProjects = () =>
    [...mockProjects]

  const getFeaturedProjects = () =>
    mockProjects.filter(p => p.featured)

  const getProjectsByCategory = (category: Project['category']) =>
    mockProjects.filter(p => p.category === category)

  const getProjectsByStatus = (status: Project['status']) =>
    mockProjects.filter(p => p.status === status)

  const getProjectBySlug = (slug: string) =>
    mockProjects.find(p => p.slug === slug)

  const getProjectById = (id: string) =>
    mockProjects.find(p => p.id === id)

  // === DONNÉES PROJET (appels, actualités, médias liés à un projet) ===
  const getProjectCalls = (projectId: string) =>
    mockCampusCalls.filter(c => c.project_id === projectId && c.is_active && c.status === 'open')

  const getProjectClosedCalls = (projectId: string) =>
    mockCampusCalls.filter(c => c.project_id === projectId && c.is_active && c.status === 'closed')

  const getProjectAllCalls = (projectId: string) =>
    mockCampusCalls.filter(c => c.project_id === projectId && c.is_active)

  const getProjectCallBySlug = (projectSlug: string, callSlug: string) => {
    const project = getProjectBySlug(projectSlug)
    if (!project) return null
    return mockCampusCalls.find(c => c.project_id === project.id && c.slug === callSlug)
  }

  const getProjectNews = (projectId: string) =>
    mockCampusNews
      .filter(n => n.project_id === projectId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getProjectMedia = (projectId: string) =>
    mockCampusMedia
      .filter(m => m.project_id === projectId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getProjectMediaByType = (projectId: string, type: CampusMedia['type']) =>
    mockCampusMedia
      .filter(m => m.project_id === projectId && m.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // === ALUMNI ===
  const alumni = computed(() => mockAlumni.filter(a => a.is_published))

  const getAllAlumni = () =>
    [...mockAlumni].filter(a => a.is_published)

  const getFeaturedAlumni = () =>
    mockAlumni.filter(a => a.is_published && a.is_featured)

  const getAlumniByDepartment = (departmentId: string) =>
    mockAlumni.filter(a => a.is_published && a.department_id === departmentId)

  const getAlumniByYear = (year: number) =>
    mockAlumni.filter(a => a.is_published && a.graduation_year === year)

  const getAlumniByCountry = (country: string) =>
    mockAlumni.filter(a => a.is_published && a.country === country)

  const getAlumniByIndustry = (industry: Industry) =>
    mockAlumni.filter(a => a.is_published && a.industry === industry)

  const getAlumnusBySlug = (slug: string) =>
    mockAlumni.find(a => a.slug === slug)

  // Statistiques alumni
  const getAlumniStats = () => {
    const publishedAlumni = mockAlumni.filter(a => a.is_published)
    const uniqueCountries = [...new Set(publishedAlumni.map(a => a.country))]
    const uniqueIndustries = [...new Set(publishedAlumni.map(a => a.industry))]
    const uniquePromotions = [...new Set(publishedAlumni.map(a => a.promotion))]

    return {
      total: publishedAlumni.length,
      countries: uniqueCountries.length,
      industries: uniqueIndustries.length,
      promotions: uniquePromotions.length
    }
  }

  // Liste des années de graduation uniques
  const getAlumniGraduationYears = () =>
    [...new Set(mockAlumni.filter(a => a.is_published).map(a => a.graduation_year))].sort((a, b) => b - a)

  // Liste des pays uniques
  const getAlumniCountries = () =>
    [...new Set(mockAlumni.filter(a => a.is_published).map(a => a.country))].sort()

  // === SITE (SIÈGE ALEXANDRIE) ===
  const siteFacilities = computed(() =>
    [...mockSiteFacilities].sort((a, b) => a.sort_order - b.sort_order)
  )

  const getAllSiteFacilities = () =>
    [...mockSiteFacilities].sort((a, b) => a.sort_order - b.sort_order)

  const getSiteFacilityBySlug = (slug: string) =>
    mockSiteFacilities.find(f => f.slug === slug)

  const getSiteFacilityById = (id: string) =>
    mockSiteFacilities.find(f => f.id === id)

  // Galerie média du site
  const siteGallery = computed(() =>
    [...mockSiteGallery].sort((a, b) => a.sort_order - b.sort_order)
  )

  const getAllSiteGallery = () =>
    [...mockSiteGallery].sort((a, b) => a.sort_order - b.sort_order)

  const getSiteGalleryByType = (type: MediaType) =>
    mockSiteGallery.filter(g => g.type === type).sort((a, b) => a.sort_order - b.sort_order)

  const getSitePhotos = () =>
    mockSiteGallery.filter(g => g.type === 'photo').sort((a, b) => a.sort_order - b.sort_order)

  const getSiteVideos = () =>
    mockSiteGallery.filter(g => g.type === 'video').sort((a, b) => a.sort_order - b.sort_order)

  const getSiteGalleryByFacility = (facilityId: string) =>
    mockSiteGallery.filter(g => g.facility_id === facilityId).sort((a, b) => a.sort_order - b.sort_order)

  // === AUDIT LOGS ===
  const auditLogs = computed(() => mockAuditLogs)

  const getRecentAuditLogs = (limit = 10) =>
    [...mockAuditLogs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)

  const getAuditLogsByAction = (action: AuditAction) =>
    mockAuditLogs
      .filter(log => log.action === action)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const getActiveUsersCount = () => mockActiveUsersCount

  // === COMPÉTENCES (SKILLS) ===
  const programSkills = computed(() => mockProgramSkills)

  const getSkillsByProgram = (programId: string) =>
    [...mockProgramSkills]
      .filter(s => s.program_id === programId)
      .sort((a, b) => a.display_order - b.display_order)

  const getSkillById = (skillId: string) =>
    mockProgramSkills.find(s => s.id === skillId)

  const getAllSkills = () =>
    [...mockProgramSkills].sort((a, b) => a.display_order - b.display_order)

  const getProgramsWithSkills = () => {
    const programIds = [...new Set(mockProgramSkills.map(s => s.program_id))]
    return programIds.map(id => mockFormations.find(f => f.id === id)).filter(Boolean)
  }

  // === DÉBOUCHÉS (CAREER OPPORTUNITIES) ===
  const programCareerOpportunities = computed(() => mockProgramCareerOpportunities)

  const getCareerOpportunitiesByProgram = (programId: string) =>
    [...mockProgramCareerOpportunities]
      .filter(c => c.program_id === programId)
      .sort((a, b) => a.display_order - b.display_order)

  const getCareerOpportunityById = (id: string) =>
    mockProgramCareerOpportunities.find(c => c.id === id)

  const getAllCareerOpportunities = () =>
    [...mockProgramCareerOpportunities].sort((a, b) => a.display_order - b.display_order)

  const getProgramsWithCareerOpportunities = () => {
    const programIds = [...new Set(mockProgramCareerOpportunities.map(c => c.program_id))]
    return programIds.map(id => mockFormations.find(f => f.id === id)).filter(Boolean)
  }

  // === SEMESTRES ET COURS ===
  const programSemesters = computed(() => mockProgramSemesters)
  const programCourses = computed(() => mockProgramCourses)

  // Récupérer tous les semestres d'un programme
  const getSemestersByProgram = (programId: string) =>
    [...mockProgramSemesters]
      .filter(s => s.program_id === programId)
      .sort((a, b) => a.display_order - b.display_order)

  // Récupérer un semestre par ID
  const getSemesterById = (semesterId: string) =>
    mockProgramSemesters.find(s => s.id === semesterId)

  // Récupérer tous les cours d'un semestre
  const getCoursesBySemester = (semesterId: string) =>
    [...mockProgramCourses]
      .filter(c => c.semester_id === semesterId)
      .sort((a, b) => a.display_order - b.display_order)

  // Récupérer un cours par ID
  const getCourseById = (courseId: string) =>
    mockProgramCourses.find(c => c.id === courseId)

  // Récupérer tous les cours d'un programme (à travers ses semestres)
  const getCoursesByProgram = (programId: string) => {
    const semesterIds = mockProgramSemesters
      .filter(s => s.program_id === programId)
      .map(s => s.id)
    return mockProgramCourses
      .filter(c => semesterIds.includes(c.semester_id))
      .sort((a, b) => a.display_order - b.display_order)
  }

  // Récupérer les programmes qui ont des semestres définis
  const getProgramsWithSemesters = () => {
    const programIds = [...new Set(mockProgramSemesters.map(s => s.program_id))]
    return programIds.map(id => mockFormations.find(f => f.id === id)).filter(Boolean)
  }

  // Calculer le total des crédits d'un semestre
  const getSemesterTotalCredits = (semesterId: string) =>
    mockProgramCourses
      .filter(c => c.semester_id === semesterId)
      .reduce((sum, c) => sum + (c.credits || 0), 0)

  // Calculer le total des heures d'un semestre
  const getSemesterTotalHours = (semesterId: string) => {
    const courses = mockProgramCourses.filter(c => c.semester_id === semesterId)
    return {
      lecture: courses.reduce((sum, c) => sum + c.lecture_hours, 0),
      tutorial: courses.reduce((sum, c) => sum + c.tutorial_hours, 0),
      practical: courses.reduce((sum, c) => sum + c.practical_hours, 0),
      total: courses.reduce((sum, c) => sum + c.lecture_hours + c.tutorial_hours + c.practical_hours, 0)
    }
  }

  // === APPELS À CANDIDATURES (ADMIN) ===
  const applicationCalls = computed(() => mockApplicationCalls)

  // Récupérer tous les appels
  const getAllApplicationCalls = () =>
    [...mockApplicationCalls].sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )

  // Récupérer un appel par ID
  const getApplicationCallById = (id: string) =>
    mockApplicationCalls.find(c => c.id === id)

  // Récupérer un appel par slug
  const getApplicationCallBySlug = (slug: string) =>
    mockApplicationCalls.find(c => c.slug === slug)

  // Appels par type
  const getApplicationCallsByType = (type: CallType) =>
    mockApplicationCalls.filter(c => c.type === type)

  // Appels par statut
  const getApplicationCallsByStatus = (status: CallStatus) =>
    mockApplicationCalls.filter(c => c.status === status)

  // Appels par statut de publication
  const getApplicationCallsByPublicationStatus = (status: PublicationStatus) =>
    mockApplicationCalls.filter(c => c.publication_status === status)

  // Appels publiés et en cours
  const getPublishedOngoingCalls = () =>
    mockApplicationCalls.filter(c =>
      c.publication_status === 'published' &&
      (c.status === 'ongoing' || c.status === 'upcoming')
    )

  // Statistiques des appels
  const getApplicationCallsStats = () => ({
    total: mockApplicationCalls.length,
    published: mockApplicationCalls.filter(c => c.publication_status === 'published').length,
    draft: mockApplicationCalls.filter(c => c.publication_status === 'draft').length,
    ongoing: mockApplicationCalls.filter(c => c.status === 'ongoing').length,
    upcoming: mockApplicationCalls.filter(c => c.status === 'upcoming').length,
    closed: mockApplicationCalls.filter(c => c.status === 'closed').length,
    totalApplications: mockApplicationCalls.reduce((sum, c) => sum + (c.applications_count || 0), 0)
  })

  // === CANDIDATURES (DOSSIERS) ===
  const applications = computed(() => mockApplications)

  // Récupérer toutes les candidatures
  const getAllApplications = () =>
    [...mockApplications].sort((a, b) =>
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    )

  // Récupérer une candidature par ID
  const getApplicationById = (id: string) =>
    mockApplications.find(a => a.id === id)

  // Récupérer une candidature par référence
  const getApplicationByReference = (reference: string) =>
    mockApplications.find(a => a.reference_number === reference)

  // Candidatures par statut
  const getApplicationsByStatus = (status: ApplicationStatus) =>
    mockApplications.filter(a => a.status === status)

  // Candidatures par appel
  const getApplicationsByCall = (callId: string) =>
    mockApplications.filter(a => a.call_id === callId)

  // Candidatures par évaluateur
  const getApplicationsByReviewer = (reviewerId: string) =>
    mockApplications.filter(a => a.reviewer_external_id === reviewerId)

  // Candidatures non assignées
  const getUnassignedApplications = () =>
    mockApplications.filter(a => !a.reviewer_external_id && a.status === 'submitted')

  // Statistiques des candidatures (utilise la fonction du mock)
  const getApplicationsStatistics = getApplicationsStats

  // Statistiques par évaluateur (utilise la fonction du mock)
  const getReviewersStatistics = getReviewerStats

  // Liste des évaluateurs
  const reviewers = computed(() => mockReviewers)
  const getAllReviewers = () => [...mockReviewers]

  // === ACTUALITÉS (ADMIN) ===
  const news = computed(() => mockNews)
  const newsTags = computed(() => mockNewsTags)
  const newsAuthors = computed(() => mockNewsAuthors)

  // Récupérer toutes les actualités (admin)
  const getAllAdminNews = () =>
    [...mockNews].sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )

  // Récupérer une actualité par ID (admin)
  const getAdminNewsItemById = (id: string) => getAdminNewsById(id)

  // Récupérer une actualité par slug (admin)
  const getAdminNewsItemBySlug = (slug: string) => getAdminNewsBySlug(slug)

  // Récupérer les actualités filtrées (admin)
  const getAdminFilteredNews = (filters?: NewsFilters) => getFilteredNews(filters)

  // Statistiques des actualités (admin)
  const getAdminNewsStats = () => getNewsStats()

  // Récupérer tous les tags
  const getAllNewsTags = () => [...mockNewsTags]

  // Récupérer tous les auteurs
  const getAllNewsAuthors = () => [...mockNewsAuthors]

  // === ÉTIQUETTES (TAGS) ===
  const tags = computed(() => mockTags)

  // Récupérer tous les tags
  const getAllTags = () => getAllTagsFromMock()

  // Récupérer un tag par ID
  const getTagById = (id: string) => getTagByIdFromMock(id)

  // Récupérer un tag par slug
  const getTagBySlug = (slug: string) => getTagBySlugFromMock(slug)

  // Statistiques des tags
  const getTagStatistics = () => getTagStats()

  // Vérifier si un tag est utilisé
  const checkTagUsed = (tagId: string) => isTagUsed(tagId)

  // === ÉVÉNEMENTS (ADMIN) ===
  const events = computed(() => mockEvents)

  // Récupérer tous les événements (admin)
  const getAllAdminEvents = () => getAllEventsFromMock()

  // Récupérer un événement par ID (admin)
  const getAdminEventById = (id: string) => getEventByIdFromMock(id)

  // Récupérer un événement par slug (admin)
  const getAdminEventBySlug = (slug: string) => getEventBySlugFromMock(slug)

  // Récupérer les événements filtrés (admin)
  const getAdminFilteredEvents = (filters?: EventFilters) => getFilteredEvents(filters)

  // Statistiques des événements (admin)
  const getAdminEventStats = () => getEventStats()

  // === INSCRIPTIONS AUX ÉVÉNEMENTS (ADMIN) ===
  const registrations = computed(() => mockRegistrations)

  // Récupérer toutes les inscriptions
  const getAllRegistrations = () => getAllRegistrationsFromMock()

  // Récupérer une inscription par ID
  const getRegistrationById = (id: string) => getRegistrationByIdFromMock(id)

  // Récupérer les inscriptions pour un événement
  const getRegistrationsByEventId = (eventId: string) => getRegistrationsByEventIdFromMock(eventId)

  // Statistiques globales des inscriptions
  const getRegistrationStats = () => getGlobalRegistrationStats()

  // Statistiques des inscriptions pour un événement
  const getEventRegistrationStatsById = (eventId: string, capacity?: number) =>
    getEventRegistrationStats(eventId, capacity)

  // Récupérer les inscriptions filtrées
  const getAdminFilteredRegistrations = (filters?: RegistrationFilters) => getFilteredRegistrations(filters)

  // Liste des événements avec inscriptions (pour le select)
  const getEventsForRegistrationFilter = () => getEventsWithRegistrations()

  // === APPELS À PROJETS (ADMIN) ===
  const projectCalls = computed(() => mockProjectCalls)

  // Récupérer tous les appels à projets
  const getAllProjectCalls = () => getAllProjectCallsFromMock()

  // Récupérer un appel par ID
  const getProjectCallById = (id: string) => getProjectCallByIdFromMock(id)

  // Récupérer les appels d'un projet
  const getProjectCallsByProjectId = (projectId: string) => getProjectCallsByProjectIdFromMock(projectId)

  // Récupérer les appels filtrés
  const getFilteredProjectCallsAdmin = (filters?: ProjectCallFilters) => getFilteredProjectCalls(filters)

  // Statistiques des appels à projets
  const getProjectCallsStats = () => getProjectCallStats()

  // Liste des projets pour le select
  const getProjectsForCallSelect = () => getProjectsForSelect()

  // === CATÉGORIES DE PROJETS (ADMIN) ===
  const projectCategories = computed(() => mockProjectCategories)

  // Récupérer toutes les catégories de projets
  const getAllProjectCategories = () => getAllProjectCategoriesFromMock()

  // Récupérer une catégorie par ID
  const getProjectCategoryById = (id: string) => getProjectCategoryByIdFromMock(id)

  // Récupérer une catégorie par slug
  const getProjectCategoryBySlug = (slug: string) => getProjectCategoryBySlugFromMock(slug)

  // Récupérer les catégories filtrées
  const getFilteredProjectCategoriesAdmin = (filters?: ProjectCategoryFilters) => getFilteredProjectCategories(filters)

  // Statistiques des catégories de projets
  const getProjectCategoriesStats = () => getProjectCategoryStats()

  // Vérifier si une catégorie est utilisée
  const checkProjectCategoryUsed = (categoryId: string) => isProjectCategoryUsed(categoryId)

  // Vérifier l'utilisation d'une catégorie (pour la suppression)
  const getProjectCategoryUsage = (categoryId: string) => checkProjectCategoryUsage(categoryId)

  // === DÉPARTEMENTS (ADMIN) ===
  const departmentsAdmin = computed(() => mockDepartmentsAdmin)

  // Récupérer tous les départements (admin)
  const getAllDepartmentsAdmin = () => getAllDepartmentsAdminFromMock()

  // Récupérer un département par ID (admin)
  const getDepartmentByIdAdmin = (id: string) => getDepartmentByIdAdminFromMock(id)

  // Récupérer un département par code (admin)
  const getDepartmentByCodeAdmin = (code: string) => getDepartmentByCodeAdminFromMock(code)

  // Récupérer les départements filtrés (admin)
  const getFilteredDepartmentsAdmin = (filters?: DepartmentFilters) => getFilteredDepartmentsAdminFromMock(filters)

  // Statistiques des départements
  const getDepartmentsStats = () => getDepartmentStats()

  // Vérifier l'utilisation d'un département (pour la suppression)
  const getDepartmentUsage = (departmentId: string) => checkDepartmentUsage(departmentId)

  // Liste des responsables potentiels
  const getDepartmentHeadCandidates = () => getDepartmentHeadCandidatesFromMock()

  // Liste des départements pour select
  const getDepartmentsForSelect = () => getDepartmentsForSelectFromMock()

  // === SERVICES (ADMIN) ===
  const servicesAdmin = computed(() => mockServicesAdmin)

  // Récupérer tous les services (admin)
  const getAllServicesAdmin = () => getAllServicesAdminFromMock()

  // Récupérer un service par ID (admin)
  const getServiceByIdAdmin = (id: string) => getServiceByIdAdminFromMock(id)

  // Récupérer les services d'un département
  const getServicesByDepartmentIdAdmin = (departmentId: string) => getServicesByDepartmentIdFromMock(departmentId)

  // Récupérer les services filtrés (admin)
  const getFilteredServicesAdmin = (filters?: ServiceFilters) => getFilteredServicesAdminFromMock(filters)

  // Récupérer les services groupés par département
  const getServicesGroupedByDepartmentAdmin = () => getServicesGroupedByDepartmentFromMock()

  // Statistiques des services
  const getServicesStats = () => getServiceStats()

  // Vérifier l'utilisation d'un service (pour la suppression)
  const getServiceUsage = (serviceId: string) => checkServiceUsage(serviceId)

  // Liste des responsables potentiels pour un service
  const getServiceHeadCandidates = () => getServiceHeadCandidatesFromMock()

  // Liste des services pour select
  const getServicesForSelect = () => getServicesForSelectFromMock()

  // Liste des départements pour le select dans formulaire service
  const getDepartmentsForServiceSelect = () => getDepartmentsForServiceSelectFromMock()

  return {
    // Données
    departments,
    services,
    staff,
    paysBailleurs,
    conseilAdministration,
    campusExternalises,
    campusPrincipal,
    partenaires,
    charterOperators,
    campusPartners,
    formations,
    documents,
    projects,
    alumni,
    siteFacilities,
    siteGallery,

    // Getters départements
    getDepartmentById,
    getDepartmentBySlug,

    // Getters services
    getServicesByCategory,
    getServiceById,

    // Getters staff
    getStaffByType,
    getStaffByDepartment,
    getStaffByService,
    getStaffById,

    // Getters CA
    getCAPresident,
    getCAMembers,

    // Getters campus
    getCampusById,
    getCampusBySlug,

    // Getters partenaires
    getPartenairesByCategory,
    getPartenairesByType,
    getCampusPartnersByType,

    // Getters données campus
    getCampusTeam,
    getCampusCalls,
    getCampusClosedCalls,
    getCampusRecruitments,
    getCampusEvents,
    getCampusNews,
    getCampusMedia,
    getCampusMediaByType,
    getCampusFormationsRealisees,

    // Getters globaux (tous campus)
    getAllNews,
    getAllEvents,
    getUpcomingEvents,
    getPastEvents,
    getFeaturedEvents,
    getFeaturedNews,
    getAllCalls,
    getAllOpenCalls,
    getAllClosedCalls,
    getAllRecruitments,

    // Getters par ID (pages de détails)
    getNewsById,
    getNewsBySlug,
    getCallById,
    getEventById,

    // Getters formations
    getFormationsFeatured,
    getFormationsByType,
    getFormationsByCampus,
    getFormationsByDepartment,
    getFormationBySlug,
    getFormationsCountByType,
    getFormationsWithOpenApplications,
    getRelatedFormations,

    // Getters documents
    getDocumentsByCategory,
    getTextesFondateurs,

    // Getters projets
    getAllProjects,
    getFeaturedProjects,
    getProjectsByCategory,
    getProjectsByStatus,
    getProjectBySlug,
    getProjectById,

    // Getters données projet (appels, actualités, médias)
    getProjectCalls,
    getProjectClosedCalls,
    getProjectAllCalls,
    getProjectCallBySlug,
    getProjectNews,
    getProjectMedia,
    getProjectMediaByType,

    // Getters alumni
    getAllAlumni,
    getFeaturedAlumni,
    getAlumniByDepartment,
    getAlumniByYear,
    getAlumniByCountry,
    getAlumniByIndustry,
    getAlumnusBySlug,
    getAlumniStats,
    getAlumniGraduationYears,
    getAlumniCountries,

    // Getters site (siège Alexandrie)
    getAllSiteFacilities,
    getSiteFacilityBySlug,
    getSiteFacilityById,
    getAllSiteGallery,
    getSiteGalleryByType,
    getSitePhotos,
    getSiteVideos,
    getSiteGalleryByFacility,

    // Getters audit logs
    auditLogs,
    getRecentAuditLogs,
    getAuditLogsByAction,
    getActiveUsersCount,

    // Getters compétences (skills)
    programSkills,
    getSkillsByProgram,
    getSkillById,
    getAllSkills,
    getProgramsWithSkills,
    generateSkillId,

    // Getters débouchés (career opportunities)
    programCareerOpportunities,
    getCareerOpportunitiesByProgram,
    getCareerOpportunityById,
    getAllCareerOpportunities,
    getProgramsWithCareerOpportunities,
    generateCareerOpportunityId,

    // Getters semestres et cours
    programSemesters,
    programCourses,
    getSemestersByProgram,
    getSemesterById,
    getCoursesBySemester,
    getCourseById,
    getCoursesByProgram,
    getProgramsWithSemesters,
    getSemesterTotalCredits,
    getSemesterTotalHours,
    generateSemesterId,
    generateCourseId,

    // Utilitaires
    getFlagEmoji,

    // Appels à candidatures (admin)
    applicationCalls,
    getAllApplicationCalls,
    getApplicationCallById,
    getApplicationCallBySlug,
    getApplicationCallsByType,
    getApplicationCallsByStatus,
    getApplicationCallsByPublicationStatus,
    getPublishedOngoingCalls,
    getApplicationCallsStats,
    callTypeLabels,
    callTypeColors,
    callStatusLabels,
    callStatusColors,
    publicationStatusLabels,
    publicationStatusColors,
    generateCallId,
    generateCriteriaId,
    generateCoverageId,
    generateDocumentId,
    generateScheduleId,

    // Candidatures (dossiers)
    applications,
    reviewers,
    getAllApplications,
    getApplicationById,
    getApplicationByReference,
    getApplicationsByStatus,
    getApplicationsByCall,
    getApplicationsByReviewer,
    getUnassignedApplications,
    getApplicationsStatistics,
    getReviewersStatistics,
    getAllReviewers,
    applicationStatusLabels,
    applicationStatusColors,
    salutationLabels,
    maritalStatusLabels,
    employmentStatusLabels,
    experienceDurationLabels,
    generateApplicationId,
    generateDegreeId,
    generateDocId,

    // Statistiques avancées des candidatures
    getGlobalStatistics,
    getTimelineStatistics,
    getStatisticsByProgram,
    getStatisticsByCountry,
    getStatisticsByCall,

    // Actualités (admin)
    news,
    newsTags,
    newsAuthors,
    getAllAdminNews,
    getAdminNewsItemById,
    getAdminNewsItemBySlug,
    getAdminFilteredNews,
    getAdminNewsStats,
    getAllNewsTags,
    getAllNewsAuthors,
    newsStatusLabels,
    newsStatusColors,
    highlightStatusLabels,
    highlightStatusColors,
    generateNewsId,
    generateMediaId,

    // Étiquettes (tags)
    tags,
    getAllTags,
    getTagById,
    getTagBySlug,
    getTagStatistics,
    checkTagUsed,
    tagColors,
    availableIcons,
    generateTagId,
    slugify,

    // Événements (admin)
    events,
    getAllAdminEvents,
    getAdminEventById,
    getAdminEventBySlug,
    getAdminFilteredEvents,
    getAdminEventStats,
    eventTypeLabels,
    eventTypeColors,
    eventStatusLabels,
    eventStatusColors,
    generateEventId,
    generateEventPartnerId,
    slugifyEvent,

    // Inscriptions aux événements (admin)
    registrations,
    getAllRegistrations,
    getRegistrationById,
    getRegistrationsByEventId,
    getRegistrationStats,
    getEventRegistrationStatsById,
    getAdminFilteredRegistrations,
    getEventsForRegistrationFilter,
    registrationStatusLabels,
    registrationStatusColors,
    generateRegistrationId,

    // Appels à projets (admin)
    projectCalls,
    getAllProjectCalls,
    getProjectCallById,
    getProjectCallsByProjectId,
    getFilteredProjectCallsAdmin,
    getProjectCallsStats,
    getProjectsForCallSelect,
    projectCallTypeLabels,
    projectCallTypeColors,
    projectCallStatusLabels,
    projectCallStatusColors,
    generateProjectCallId,

    // Catégories de projets (admin)
    projectCategories,
    getAllProjectCategories,
    getProjectCategoryById,
    getProjectCategoryBySlug,
    getFilteredProjectCategoriesAdmin,
    getProjectCategoriesStats,
    checkProjectCategoryUsed,
    getProjectCategoryUsage,
    categoryIcons,
    generateProjectCategoryId,
    slugifyCategory,

    // Projets (admin)
    getAllProjectsAdmin,
    getProjectByIdAdmin,
    getProjectBySlugAdmin,
    getFilteredProjectsAdmin: getFilteredProjectsFromMock,
    getProjectStatsAdmin: getProjectStats,
    projectStatusLabels,
    projectStatusColors,
    projectPublicationStatusLabels,
    projectPublicationStatusColors,
    generateProjectId,
    generateProjectPartnerId,
    generateProjectCountryId,
    slugifyProject,
    countries,

    // Départements (admin)
    departmentsAdmin,
    getAllDepartmentsAdmin,
    getDepartmentByIdAdmin,
    getDepartmentByCodeAdmin,
    getFilteredDepartmentsAdmin,
    getDepartmentsStats,
    getDepartmentUsage,
    getDepartmentHeadCandidates,
    getDepartmentsForSelect,
    departmentIcons,
    generateDepartmentId,
    generateDepartmentCode,

    // Services (admin)
    servicesAdmin,
    getAllServicesAdmin,
    getServiceByIdAdmin,
    getServicesByDepartmentIdAdmin,
    getFilteredServicesAdmin,
    getServicesGroupedByDepartmentAdmin,
    getServicesStats,
    getServiceUsage,
    getServiceHeadCandidates,
    getServicesForSelect,
    getDepartmentsForServiceSelect,
    serviceCategoryLabels,
    generateServiceId,

    // Équipes campus (admin)
    campusTeamAdmin,
    getAllCampusTeamAdmin,
    getCampusTeamMemberById,
    getCampusTeamByCampusAdmin,
    countCampusTeamMembers,
    getCampusTeamStatsAdmin,
    searchUsersForTeam,
    availableUsers,
    commonPositions,
    generateCampusTeamId,

    // Objectifs, réalisations et projets de services (admin)
    serviceObjectives: mockServiceObjectives,
    serviceAchievements: mockServiceAchievements,
    serviceProjects: mockServiceProjects,
    getServiceObjectives: getServiceObjectivesFromMock,
    getServiceObjectiveById: getServiceObjectiveByIdFromMock,
    getServiceAchievements: getServiceAchievementsFromMock,
    getServiceAchievementById: getServiceAchievementByIdFromMock,
    getServiceAchievementsByType: getServiceAchievementsByTypeFromMock,
    getServiceProjects: getServiceProjectsFromMock,
    getServiceProjectById: getServiceProjectByIdFromMock,
    getServiceProjectsByStatus: getServiceProjectsByStatusFromMock,
    getServiceOverview: getServiceOverviewFromMock,
    getServiceObjectivesStats: getServiceObjectivesStatsFromMock,
    getServicesWithData: getServicesWithDataFromMock,
    getServicesGroupedByCategory: getServicesGroupedByCategoryFromMock,
    serviceProjectStatusLabels,
    serviceProjectStatusColors,
    achievementTypes,
    generateServiceObjectiveId,
    generateServiceAchievementId,
    generateServiceProjectId,

    // Campus (admin)
    campusAdmin: mockCampusAdmin,
    campusPartnersAdmin: mockCampusPartnersAdmin,
    getAllCampusAdmin: getAllCampusAdminFromMock,
    getCampusByIdAdmin: getCampusByIdAdminFromMock,
    getCampusByCodeAdmin: getCampusByCodeAdminFromMock,
    getFilteredCampusAdmin: getFilteredCampusAdminFromMock,
    getCampusStatsAdmin: getCampusStats,
    getCampusUsage: checkCampusUsage,
    getCampusPartnersById: getCampusPartnersByIdFromMock,
    getCampusForSelect: getCampusForSelectFromMock,
    getCampusCountries: getCampusCountriesFromMock,
    getCampusHeadCandidates: getCampusHeadCandidatesFromMock,
    generateCampusId,
    generateCampusCode,

    // Partenaires (admin)
    partnersAdmin: mockPartnersAdmin,
    countriesForPartners: mockCountries,
    getAllPartnersAdmin: getAllPartnersAdminFromMock,
    getPartnerByIdAdmin: getPartnerByIdAdminFromMock,
    getFilteredPartnersAdmin: getFilteredPartnersAdminFromMock,
    getPartnersByTypeAdmin: getPartnersByTypeFromMock,
    getPartnerStatsAdmin: getPartnerStats,
    getPartnerAssociations: checkPartnerAssociations,
    getPartnersForSelect: getPartnersForSelectFromMock,
    getCountriesForSelect: getCountriesForSelectFromMock,
    getPartnerTypesForSelect: getPartnerTypesForSelectFromMock,
    partnerTypeLabels,
    partnerTypeColors,
    generatePartnerId,

    // Albums et médias (admin)
    albumsAdmin: mockAlbumsAdmin,
    mediaAdmin: mockMediaAdmin,
    albumMediaAdmin: mockAlbumMediaAdmin,
    getAllAlbumsAdmin: getAllAlbumsAdminFromMock,
    getAlbumByIdAdmin: getAlbumByIdAdminFromMock,
    getFilteredAlbumsAdmin: getFilteredAlbumsAdminFromMock,
    getAlbumStatsAdmin: getAlbumStats,
    getAlbumUsage: checkAlbumUsage,
    getAlbumMediaAdmin: getAlbumMediaAdminFromMock,
    getAllMediaAdmin: getAllMediaAdminFromMock,
    getMediaByIdAdmin: getMediaByIdAdminFromMock,
    getMediaByTypeAdmin: getMediaByTypeAdminFromMock,
    getFilteredMediaAdmin: getFilteredMediaAdminFromMock,
    getMediaStatsAdmin: getMediaStats,
    getMediaUsage: checkMediaUsage,
    getAvailableMediaForAlbum: getAvailableMediaForAlbumFromMock,
    getAlbumsForSelect: getAlbumsForSelectFromMock,
    albumStatusLabels,
    albumStatusColors,
    mediaTypeLabels,
    mediaTypeIcons,
    mediaTypeColors,
    formatFileSize,
    formatDuration,
    generateAlbumId,

    // Newsletter - Abonnés (admin)
    newsletterSubscribers: mockNewsletterSubscribers,
    getAllSubscribers: getAllSubscribersFromMock,
    getSubscriberById: getSubscriberByIdFromMock,
    getSubscriberByEmail: getSubscriberByEmailFromMock,
    isSubscriberEmailTaken: isEmailTakenFromMock,
    getSubscriberStatsAdmin: getSubscriberStats,
    validateSubscriberEmail,
    simulateSubscriberImport: simulateImport,
    exportSubscribersToCSV,
    sourceLabels,
    sourceColors,
    generateSubscriberId,
    generateUnsubscribeToken
  }
}

// Export des types pour utilisation externe
export type {
  Department,
  Service,
  Staff,
  PaysBailleur,
  CAMember,
  CampusExternalise,
  Partenaire,
  PartnerCategory,
  PartnerType,
  Formation,
  ProgramModule,
  ProgramSemester,
  Document,
  CampusTeamMember,
  CampusTeamUser,
  CampusTeamFilters,
  CampusCall,
  CampusEvent,
  CampusNews,
  CampusMedia,
  CampusFormationRealisee,
  Project,
  ProjectPartner,
  ProjectCountry,
  Alumnus,
  Industry,
  SiteFacility,
  SiteGalleryItem,
  MediaType,
  AuditLog,
  AuditAction,
  ProgramSkill,
  ProgramCareerOpportunity,
  ProgramSemesterData,
  ProgramCourse,
  ApplicationCall,
  EligibilityCriteria,
  CallCoverage,
  RequiredDocument,
  CallScheduleItem,
  CallType,
  CallStatus,
  PublicationStatus,
  Application,
  ApplicationDegree,
  ApplicationDocument,
  ApplicationStatus,
  MaritalStatus,
  EmploymentStatus,
  ExperienceDuration,
  Salutation,
  Reviewer,
  ApplicationStatistics,
  TimelineDataPoint,
  ProgramStatistics,
  CountryStatistics,
  CallStatistics,
  News,
  NewsTag,
  NewsMedia,
  NewsAuthor,
  NewsStatus,
  HighlightStatus,
  NewsStats,
  NewsFilters,
  EditorJSContent,
  EditorJSBlock,
  Tag,
  TagStats,
  Event,
  EventPartner,
  EventType,
  EventStatus,
  EventStats,
  EventFilters,
  EventRegistration,
  RegistrationStatus,
  RegistrationStats,
  RegistrationFilters,
  ProjectCall,
  ProjectCallType,
  ProjectCallStatus,
  ProjectCallStats,
  ProjectCallFilters,
  ProjectCategory,
  ProjectCategoryStats,
  ProjectCategoryFilters,
  CategoryUsage,
  ProjectStatus,
  ProjectPublicationStatus,
  ProjectFilters,
  ProjectStats,
  DepartmentAdmin,
  DepartmentStats,
  DepartmentFilters,
  DepartmentUsage,
  ServiceObjective,
  ServiceAchievement,
  ServiceProject,
  ServiceProjectStatus,
  ServiceOverview,
  ServiceObjectivesStats,
  ServiceWithData,
  ServiceAdmin,
  ServiceStats,
  ServiceFilters,
  ServiceUsage,
  ServicesByDepartment,
  CampusAdmin,
  CampusPartnerAdmin,
  CampusStats,
  CampusFilters,
  CampusUsage,
  PartnerAdmin,
  PartnerStats,
  PartnerFilters,
  PartnerAssociations,
  PartnerTypeSql,
  CountryOption,
  MediaAdmin,
  AlbumAdmin,
  AlbumMediaAdmin,
  AlbumStats,
  AlbumFilters,
  AlbumUsage,
  MediaFilters,
  MediaStats,
  MediaUsageResult,
  AlbumMediaType,
  AlbumPublicationStatus,
  NewsletterSubscriber,
  SubscriberSource,
  SubscriberFilters,
  SubscriberStats,
  ImportResult
}

// Re-export utility function
export { getProjectFlagEmoji }
