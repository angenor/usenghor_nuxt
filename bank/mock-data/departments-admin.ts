/**
 * Mock Data: Départements (Admin)
 * Gestion complète des départements pour le back-office
 * Table SQL: departments (04_organization.sql)
 */

import { mockServices, type Service } from './services'
import { mockStaff, type Staff } from './staff'

// Types
export interface DepartmentAdmin {
  id: string
  code: string
  name: string
  description?: string
  mission?: string
  icon?: string
  cover_image?: string
  head_id?: string
  head?: {
    id: string
    name: string
    title?: string
    photo?: string
  }
  services_count: number
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface DepartmentStats {
  total: number
  active: number
  inactive: number
  totalServices: number
  withHead: number
  withoutHead: number
}

export interface DepartmentFilters {
  search?: string
  active?: boolean
  sort_by?: 'name' | 'code' | 'display_order' | 'services_count'
  sort_order?: 'asc' | 'desc'
}

export interface DepartmentUsage {
  services_count: number
  programs_count: number
  projects_count: number
  staff_count: number
  can_delete: boolean
  services_sample: Array<{ id: string; name: string }>
}

// Liste des icônes disponibles pour les départements
export const departmentIcons = [
  { value: 'palette', label: 'Culture' },
  { value: 'leaf', label: 'Environnement' },
  { value: 'briefcase', label: 'Management' },
  { value: 'heart-pulse', label: 'Santé' },
  { value: 'graduation-cap', label: 'Éducation' },
  { value: 'building-columns', label: 'Institution' },
  { value: 'globe', label: 'International' },
  { value: 'laptop-code', label: 'Numérique' },
  { value: 'microscope', label: 'Recherche' },
  { value: 'scale-balanced', label: 'Droit' },
  { value: 'landmark', label: 'Gouvernance' },
  { value: 'users', label: 'Ressources humaines' },
  { value: 'coins', label: 'Finance' },
  { value: 'chart-line', label: 'Économie' },
  { value: 'book-open', label: 'Documentation' }
]

// Helper pour trouver un membre du staff
function getStaffById(id: string): Staff | undefined {
  return mockStaff.find(s => s.id === id)
}

// Helper pour compter les services d'un département
function countServicesByDepartment(deptId: string): number {
  // Note: les services actuels n'ont pas de department_id,
  // on simule un comptage basé sur la catégorie
  return mockServices.filter(s => s.is_active).length > 0 ? Math.floor(Math.random() * 5) + 1 : 0
}

// Données mock des départements (admin)
export const mockDepartmentsAdmin: DepartmentAdmin[] = [
  {
    id: 'dept-culture',
    code: 'DEP-CUL',
    name: 'Culture',
    description: 'Le département Culture forme des professionnels capables de concevoir et mettre en œuvre des politiques culturelles adaptées aux réalités africaines.',
    mission: '<p>Former des cadres de haut niveau dans les domaines de la <strong>gestion des industries culturelles et créatives</strong>, du patrimoine et des arts du spectacle.</p><p>Développer la recherche et l\'expertise dans le secteur culturel africain.</p>',
    icon: 'palette',
    cover_image: 'https://picsum.photos/seed/dept-culture/1200/400',
    head_id: 'staff-001',
    services_count: 3,
    display_order: 1,
    active: true,
    created_at: '2020-01-01T10:00:00Z',
    updated_at: '2024-12-15T14:30:00Z'
  },
  {
    id: 'dept-environnement',
    code: 'DEP-ENV',
    name: 'Environnement',
    description: 'Le département Environnement forme des cadres spécialisés dans la gestion durable des ressources naturelles et l\'adaptation au changement climatique.',
    mission: '<p>Former des experts en <strong>gestion environnementale</strong> et développement durable pour l\'Afrique.</p><p>Accompagner la transition écologique du continent africain.</p>',
    icon: 'leaf',
    cover_image: 'https://picsum.photos/seed/dept-env/1200/400',
    head_id: 'staff-002',
    services_count: 4,
    display_order: 2,
    active: true,
    created_at: '2020-01-01T10:00:00Z',
    updated_at: '2024-11-20T11:00:00Z'
  },
  {
    id: 'dept-management',
    code: 'DEP-MGT',
    name: 'Management',
    description: 'Le département Management forme des dirigeants et gestionnaires capables de piloter des organisations publiques et privées en Afrique.',
    mission: '<p>Former les <strong>leaders de demain</strong> pour les secteurs public et privé africains.</p><p>Développer des compétences en gouvernance, stratégie et leadership.</p>',
    icon: 'briefcase',
    cover_image: 'https://picsum.photos/seed/dept-mgt/1200/400',
    head_id: 'staff-003',
    services_count: 5,
    display_order: 3,
    active: true,
    created_at: '2020-01-01T10:00:00Z',
    updated_at: '2025-01-10T09:00:00Z'
  },
  {
    id: 'dept-sante',
    code: 'DEP-SAN',
    name: 'Santé',
    description: 'Le département Santé forme des professionnels de santé publique et des gestionnaires de systèmes de santé pour l\'Afrique.',
    mission: '<p>Former des cadres en <strong>santé publique</strong> et gestion des systèmes de santé.</p><p>Contribuer à l\'amélioration des indicateurs sanitaires en Afrique francophone.</p>',
    icon: 'heart-pulse',
    cover_image: 'https://picsum.photos/seed/dept-sante/1200/400',
    head_id: 'staff-004',
    services_count: 4,
    display_order: 4,
    active: true,
    created_at: '2020-01-01T10:00:00Z',
    updated_at: '2024-10-05T16:00:00Z'
  },
  {
    id: 'dept-doctoral',
    code: 'DEP-DOC',
    name: 'École doctorale',
    description: 'L\'École doctorale coordonne les programmes de doctorat et encadre les travaux de recherche des doctorants.',
    mission: '<p>Coordonner les <strong>programmes doctoraux</strong> de l\'Université.</p><p>Encadrer et accompagner les doctorants dans leurs travaux de recherche.</p><p>Promouvoir l\'excellence scientifique et la publication académique.</p>',
    icon: 'graduation-cap',
    cover_image: 'https://picsum.photos/seed/dept-doctoral/1200/400',
    head_id: 'staff-005',
    services_count: 2,
    display_order: 5,
    active: true,
    created_at: '2020-01-01T10:00:00Z',
    updated_at: '2024-09-12T10:00:00Z'
  },
  {
    id: 'dept-numerique',
    code: 'DEP-NUM',
    name: 'Numérique et Innovation',
    description: 'Le département Numérique et Innovation accompagne la transformation digitale et développe les compétences technologiques.',
    mission: '<p>Développer les compétences en <strong>transformation digitale</strong> et innovation technologique.</p><p>Former les futurs leaders du numérique en Afrique.</p>',
    icon: 'laptop-code',
    cover_image: 'https://picsum.photos/seed/dept-num/1200/400',
    services_count: 2,
    display_order: 6,
    active: false,
    created_at: '2023-06-01T10:00:00Z',
    updated_at: '2024-06-15T14:00:00Z'
  }
]

// Générer un nouvel ID de département
export function generateDepartmentId(): string {
  return `dept-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Générer un code de département
export function generateDepartmentCode(name: string): string {
  const slug = name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .substring(0, 3)
  return `DEP-${slug}`
}

// Récupérer tous les départements (admin)
export function getAllDepartmentsAdmin(): DepartmentAdmin[] {
  return [...mockDepartmentsAdmin]
    .map(dept => ({
      ...dept,
      head: dept.head_id ? (() => {
        const staff = getStaffById(dept.head_id)
        return staff ? {
          id: staff.id,
          name: `${staff.first_name} ${staff.last_name}`,
          title: staff.title,
          photo: staff.photo
        } : undefined
      })() : undefined
    }))
    .sort((a, b) => a.display_order - b.display_order)
}

// Récupérer un département par ID
export function getDepartmentByIdAdmin(id: string): DepartmentAdmin | undefined {
  const dept = mockDepartmentsAdmin.find(d => d.id === id)
  if (!dept) return undefined

  const staff = dept.head_id ? getStaffById(dept.head_id) : undefined
  return {
    ...dept,
    head: staff ? {
      id: staff.id,
      name: `${staff.first_name} ${staff.last_name}`,
      title: staff.title,
      photo: staff.photo
    } : undefined
  }
}

// Récupérer un département par code
export function getDepartmentByCodeAdmin(code: string): DepartmentAdmin | undefined {
  const dept = mockDepartmentsAdmin.find(d => d.code === code)
  if (!dept) return undefined

  const staff = dept.head_id ? getStaffById(dept.head_id) : undefined
  return {
    ...dept,
    head: staff ? {
      id: staff.id,
      name: `${staff.first_name} ${staff.last_name}`,
      title: staff.title,
      photo: staff.photo
    } : undefined
  }
}

// Récupérer les départements filtrés
export function getFilteredDepartmentsAdmin(filters?: DepartmentFilters): DepartmentAdmin[] {
  let result = getAllDepartmentsAdmin()

  // Filtre par statut actif
  if (filters?.active !== undefined) {
    result = result.filter(d => d.active === filters.active)
  }

  // Recherche textuelle
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(d =>
      d.name.toLowerCase().includes(search) ||
      d.code.toLowerCase().includes(search) ||
      d.description?.toLowerCase().includes(search) ||
      d.head?.name.toLowerCase().includes(search)
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
      case 'code':
        comparison = a.code.localeCompare(b.code)
        break
      case 'services_count':
        comparison = a.services_count - b.services_count
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

// Statistiques des départements
export function getDepartmentStats(): DepartmentStats {
  const departments = mockDepartmentsAdmin
  const activeDepts = departments.filter(d => d.active)

  return {
    total: departments.length,
    active: activeDepts.length,
    inactive: departments.length - activeDepts.length,
    totalServices: departments.reduce((sum, d) => sum + d.services_count, 0),
    withHead: departments.filter(d => d.head_id).length,
    withoutHead: departments.filter(d => !d.head_id).length
  }
}

// Vérifier si un département est utilisé (pour la suppression)
export function checkDepartmentUsage(departmentId: string): DepartmentUsage {
  const dept = mockDepartmentsAdmin.find(d => d.id === departmentId)
  if (!dept) {
    return {
      services_count: 0,
      programs_count: 0,
      projects_count: 0,
      staff_count: 0,
      can_delete: true,
      services_sample: []
    }
  }

  // Simulation de données d'utilisation
  const servicesCount = dept.services_count
  const programsCount = Math.floor(Math.random() * 3) + 1
  const projectsCount = Math.floor(Math.random() * 5)
  const staffCount = Math.floor(Math.random() * 10) + 2

  return {
    services_count: servicesCount,
    programs_count: programsCount,
    projects_count: projectsCount,
    staff_count: staffCount,
    can_delete: servicesCount === 0, // On ne peut supprimer que si pas de services
    services_sample: mockServices.slice(0, 3).map(s => ({
      id: s.id,
      name: s.name_fr
    }))
  }
}

// Liste des responsables potentiels (pour le select)
export function getDepartmentHeadCandidates(): Array<{ id: string; name: string; title?: string }> {
  return mockStaff
    .filter(s => s.is_active)
    .map(s => ({
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      title: s.title
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Départements pour select (formulaires)
export function getDepartmentsForSelect(): Array<{ id: string; name: string; code: string }> {
  return mockDepartmentsAdmin
    .filter(d => d.active)
    .map(d => ({
      id: d.id,
      name: d.name,
      code: d.code
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
