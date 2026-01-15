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
import { mockFormations, type Formation } from '@bank/mock-data/formations'
import { mockDocuments, type Document } from '@bank/mock-data/documents'
import { mockCampusTeam, type CampusTeamMember } from '@bank/mock-data/campus-team'
import { mockCampusCalls, type CampusCall } from '@bank/mock-data/campus-calls'
import { mockCampusEvents, type CampusEvent } from '@bank/mock-data/campus-events'
import { mockCampusNews, type CampusNews } from '@bank/mock-data/campus-news'
import { mockCampusMedia, type CampusMedia } from '@bank/mock-data/campus-media'
import { mockCampusFormationsRealisees, type CampusFormationRealisee } from '@bank/mock-data/campus-formations-realisees'

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

  // === DOCUMENTS ===
  const documents = computed(() => mockDocuments.filter(d => d.is_public))

  const getDocumentsByCategory = (category: Document['document_category']) =>
    mockDocuments.filter(d => d.is_public && d.document_category === category)

  const getTextesFondateurs = () =>
    getDocumentsByCategory('texte_fondateur')

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

    // Getters documents
    getDocumentsByCategory,
    getTextesFondateurs,

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
  Document,
  CampusTeamMember,
  CampusCall,
  CampusEvent,
  CampusNews,
  CampusMedia,
  CampusFormationRealisee
}
