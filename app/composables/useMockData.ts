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
import { mockCampusTeam, type CampusTeamMember } from '@bank/mock-data/campus-team'
import { mockCampusCalls, type CampusCall } from '@bank/mock-data/campus-calls'
import { mockCampusEvents, type CampusEvent } from '@bank/mock-data/campus-events'
import { mockCampusNews, type CampusNews } from '@bank/mock-data/campus-news'
import { mockCampusMedia, type CampusMedia } from '@bank/mock-data/campus-media'
import { mockCampusFormationsRealisees, type CampusFormationRealisee } from '@bank/mock-data/campus-formations-realisees'
import { mockProjects, type Project, type ProjectPartner, type ProjectCountry, getFlagEmoji as getProjectFlagEmoji } from '@bank/mock-data/projets'
import { mockAlumni, type Alumnus, type Industry } from '@bank/mock-data/alumni'
import { mockSiteFacilities, type SiteFacility } from '@bank/mock-data/site-facilities'
import { mockSiteGallery, type SiteGalleryItem, type MediaType } from '@bank/mock-data/site-gallery'
import { mockAuditLogs, mockActiveUsersCount, type AuditLog, type AuditAction } from '@bank/mock-data/audit-logs'
import { mockProgramSkills, generateSkillId, type ProgramSkill } from '@bank/mock-data/program-skills'
import { mockProgramCareerOpportunities, generateCareerOpportunityId, type ProgramCareerOpportunity } from '@bank/mock-data/program-career-opportunities'
import { mockProgramSemesters, mockProgramCourses, generateSemesterId, generateCourseId, type ProgramSemesterData, type ProgramCourse } from '@bank/mock-data/program-semesters'

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
    mockCampusTeam.filter(m => m.campus_id === campusId)

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
    getFlagEmoji
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
  ProgramCourse
}

// Re-export utility function
export { getProjectFlagEmoji }
