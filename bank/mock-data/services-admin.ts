/**
 * Mock Data: Services (Admin)
 * Gestion complète des services pour le back-office
 * Table SQL: services (04_organization.sql)
 */

import { mockServices, type Service, type ServiceCategory } from './services'
import { mockSectorsAdmin, type SectorAdmin } from './sectors-admin'
import { mockStaff, type Staff } from './staff'
import {
  mockServiceObjectives,
  mockServiceAchievements,
  mockServiceProjects
} from './service-objectives'

// Types
export interface ServiceAdmin {
  id: string
  sector_id?: string
  sector?: {
    id: string
    name: string
    code: string
  }
  name: string
  description?: string
  mission?: string
  head_id?: string
  head?: {
    id: string
    name: string
    title?: string
    photo?: string
  }
  email?: string
  phone?: string
  album_id?: string
  display_order: number
  active: boolean
  // Compteurs
  objectives_count: number
  achievements_count: number
  projects_count: number
  // Métadonnées
  created_at: string
  updated_at: string
}

export interface ServiceStats {
  total: number
  active: number
  inactive: number
  withHead: number
  withoutHead: number
  bySector: Array<{
    sector_id: string
    sector_name: string
    count: number
  }>
  totalObjectives: number
  totalAchievements: number
  totalProjects: number
}

export interface ServiceFilters {
  search?: string
  sector_id?: string
  active?: boolean
  sort_by?: 'name' | 'display_order' | 'sector' | 'objectives_count'
  sort_order?: 'asc' | 'desc'
}

export interface ServiceUsage {
  objectives_count: number
  achievements_count: number
  projects_count: number
  can_delete: boolean
  items_sample: Array<{ type: string; title: string }>
}

export interface ServicesBySector {
  sector: {
    id: string
    name: string
    code: string
    icon?: string
  }
  services: ServiceAdmin[]
}

// Categories de services (mapping vers les anciens types)
export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  rectorat: 'Rectorat',
  academique: 'Services académiques',
  administratif: 'Services administratifs'
}

// Helper pour trouver un membre du staff
function getStaffById(id: string): Staff | undefined {
  return mockStaff.find(s => s.id === id)
}

// Helper pour trouver un département
function getSectorById(id: string): SectorAdmin | undefined {
  return mockSectorsAdmin.find(d => d.id === id)
}

// Compteurs par service
function countObjectivesByService(serviceId: string): number {
  return mockServiceObjectives.filter(o => o.service_id === serviceId).length
}

function countAchievementsByService(serviceId: string): number {
  return mockServiceAchievements.filter(a => a.service_id === serviceId).length
}

function countProjectsByService(serviceId: string): number {
  return mockServiceProjects.filter(p => p.service_id === serviceId).length
}

// Mapping entre services existants et départements (simulation)
const serviceToSectorMap: Record<string, string> = {
  'srv-cabinet': 'dept-management',
  'srv-communication': 'dept-management',
  'srv-direction-campus': 'dept-management',
  'srv-developpement': 'dept-management',
  'srv-relations-ext': 'dept-management',
  'srv-alumni': 'dept-management',
  'srv-cifip': 'dept-culture',
  'srv-bibliotheque': 'dept-culture',
  'srv-scolarite': 'dept-culture',
  'srv-informatique': 'dept-management',
  'srv-audiovisuel': 'dept-culture',
  'srv-comptabilite': 'dept-management',
  'srv-personnel': 'dept-management',
  'srv-qualite': 'dept-management',
  'srv-voyage': 'dept-management',
  'srv-interieur': 'dept-management'
}

// Mapping entre services et responsables (simulation)
const serviceToHeadMap: Record<string, string> = {
  'srv-cabinet': 'staff-recteur',
  'srv-communication': 'staff-adm-004',
  'srv-scolarite': 'staff-adm-001',
  'srv-informatique': 'staff-adm-002',
  'srv-bibliotheque': 'staff-adm-003'
}

// Conversion d'un service public vers service admin
function toServiceAdmin(service: Service): ServiceAdmin {
  const sectorId = serviceToSectorMap[service.id]
  const sec = sectorId ? getSectorById(sectorId) : undefined
  const headId = serviceToHeadMap[service.id] || service.head_id
  const head = headId ? getStaffById(headId) : undefined

  return {
    id: service.id,
    sector_id: sectorId,
    sector: sec ? {
      id: sec.id,
      name: sec.name,
      code: sec.code
    } : undefined,
    name: service.name_fr,
    description: service.description_fr,
    mission: undefined, // Pas dans le modèle public
    head_id: headId,
    head: head ? {
      id: head.id,
      name: `${head.first_name} ${head.last_name}`,
      title: head.title_fr,
      photo: head.photo
    } : undefined,
    email: service.email,
    phone: service.phone,
    album_id: undefined,
    display_order: service.sort_order,
    active: service.is_active,
    objectives_count: countObjectivesByService(service.id),
    achievements_count: countAchievementsByService(service.id),
    projects_count: countProjectsByService(service.id),
    created_at: '2020-01-01T10:00:00Z',
    updated_at: '2024-12-15T14:30:00Z'
  }
}

// Données mock des services (admin)
export const mockServicesAdmin: ServiceAdmin[] = mockServices.map(toServiceAdmin)

// Générer un nouvel ID de service
export function generateServiceId(): string {
  return `srv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Récupérer tous les services (admin)
export function getAllServicesAdmin(): ServiceAdmin[] {
  return [...mockServicesAdmin].sort((a, b) => {
    // Tri par département puis par ordre d'affichage
    const deptCompare = (a.sector?.name || '').localeCompare(b.sector?.name || '')
    if (deptCompare !== 0) return deptCompare
    return a.display_order - b.display_order
  })
}

// Récupérer un service par ID
export function getServiceByIdAdmin(id: string): ServiceAdmin | undefined {
  return mockServicesAdmin.find(s => s.id === id)
}

// Récupérer les services d'un département
export function getServicesBySectorId(sectorId: string): ServiceAdmin[] {
  return mockServicesAdmin
    .filter(s => s.sector_id === sectorId)
    .sort((a, b) => a.display_order - b.display_order)
}

// Récupérer les services filtrés
export function getFilteredServicesAdmin(filters?: ServiceFilters): ServiceAdmin[] {
  let result = getAllServicesAdmin()

  // Filtre par département
  if (filters?.sector_id) {
    result = result.filter(s => s.sector_id === filters.sector_id)
  }

  // Filtre par statut actif
  if (filters?.active !== undefined) {
    result = result.filter(s => s.active === filters.active)
  }

  // Recherche textuelle
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(s =>
      s.name.toLowerCase().includes(search) ||
      s.description?.toLowerCase().includes(search) ||
      s.sector?.name.toLowerCase().includes(search) ||
      s.head?.name.toLowerCase().includes(search) ||
      s.email?.toLowerCase().includes(search)
    )
  }

  // Tri
  const sortBy = filters?.sort_by || 'display_order'
  const sortOrder = filters?.sort_order || 'asc'

  result.sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'sector':
        comparison = (a.sector?.name || '').localeCompare(b.sector?.name || '')
        break
      case 'objectives_count':
        comparison = a.objectives_count - b.objectives_count
        break
      case 'display_order':
      default:
        comparison = a.display_order - b.display_order
        break
    }
    return sortOrder === 'desc' ? -comparison : comparison
  })

  return result
}

// Récupérer les services groupés par département
export function getServicesGroupedBySector(): ServicesBySector[] {
  const services = getAllServicesAdmin()
  const grouped = new Map<string, ServiceAdmin[]>()

  for (const service of services) {
    const deptId = service.sector_id || 'none'
    if (!grouped.has(deptId)) {
      grouped.set(deptId, [])
    }
    grouped.get(deptId)!.push(service)
  }

  const result: ServicesBySector[] = []
  for (const [deptId, deptServices] of grouped) {
    const dept = getSectorById(deptId)
    result.push({
      sector: dept ? {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        icon: dept.icon
      } : {
        id: 'none',
        name: 'Sans département',
        code: 'N/A'
      },
      services: deptServices.sort((a, b) => a.display_order - b.display_order)
    })
  }

  // Trier par nom de département
  return result.sort((a, b) => a.sector.name.localeCompare(b.sector.name))
}

// Statistiques des services
export function getServiceStats(): ServiceStats {
  const services = mockServicesAdmin
  const activeServices = services.filter(s => s.active)

  // Compter par département
  const byDeptMap = new Map<string, number>()
  for (const service of services) {
    const deptId = service.sector_id || 'none'
    byDeptMap.set(deptId, (byDeptMap.get(deptId) || 0) + 1)
  }

  const bySector: ServiceStats['bySector'] = []
  for (const [deptId, count] of byDeptMap) {
    const dept = getSectorById(deptId)
    bySector.push({
      sector_id: deptId,
      sector_name: dept?.name || 'Sans département',
      count
    })
  }

  return {
    total: services.length,
    active: activeServices.length,
    inactive: services.length - activeServices.length,
    withHead: services.filter(s => s.head_id).length,
    withoutHead: services.filter(s => !s.head_id).length,
    bySector: bySector.sort((a, b) => b.count - a.count),
    totalObjectives: mockServiceObjectives.length,
    totalAchievements: mockServiceAchievements.length,
    totalProjects: mockServiceProjects.length
  }
}

// Vérifier si un service est utilisé (pour la suppression)
export function checkServiceUsage(serviceId: string): ServiceUsage {
  const objectives = mockServiceObjectives.filter(o => o.service_id === serviceId)
  const achievements = mockServiceAchievements.filter(a => a.service_id === serviceId)
  const projects = mockServiceProjects.filter(p => p.service_id === serviceId)

  const itemsSample: ServiceUsage['items_sample'] = []

  // Ajouter des exemples d'éléments liés
  objectives.slice(0, 2).forEach(o => {
    itemsSample.push({ type: 'Objectif', title: o.title })
  })
  achievements.slice(0, 2).forEach(a => {
    itemsSample.push({ type: 'Réalisation', title: a.title })
  })
  projects.slice(0, 2).forEach(p => {
    itemsSample.push({ type: 'Projet', title: p.title })
  })

  const totalItems = objectives.length + achievements.length + projects.length

  return {
    objectives_count: objectives.length,
    achievements_count: achievements.length,
    projects_count: projects.length,
    can_delete: totalItems === 0,
    items_sample: itemsSample.slice(0, 5)
  }
}

// Liste des responsables potentiels pour un service
export function getServiceHeadCandidates(): Array<{ id: string; name: string; title?: string }> {
  return mockStaff
    .filter(s => s.is_published)
    .map(s => ({
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      title: s.title_fr
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Services pour select (formulaires)
export function getServicesForSelect(): Array<{ id: string; name: string; sector?: string }> {
  return mockServicesAdmin
    .filter(s => s.active)
    .map(s => ({
      id: s.id,
      name: s.name,
      sector: s.sector?.name
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Départements pour select dans le formulaire de service
export function getSectorsForServiceSelect(): Array<{ id: string; name: string; code: string }> {
  return mockSectorsAdmin
    .filter(d => d.active)
    .map(d => ({
      id: d.id,
      name: d.name,
      code: d.code
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
