/**
 * Mock Data: Campus (Admin)
 * Tables SQL: campuses, campus_partners, campus_team, campus_media_library
 */

import { mockCampusExternalises, campusPrincipal, type CampusExternalise } from './campus-externalises'
import { mockPartenaires } from './partenaires'

// === TYPES ===

export interface CampusAdmin {
  id: string
  code: string
  name: string
  description?: string
  cover_image?: string
  cover_image_alt?: string
  country_id: string
  country_code: string
  country_name: string
  city: string
  address?: string
  postal_code?: string
  latitude?: number
  longitude?: number
  email?: string
  phone?: string
  head_id?: string
  head_name?: string
  head_photo?: string
  album_id?: string
  is_headquarters: boolean
  is_active: boolean
  programs_count: number
  team_members_count: number
  partners_count: number
  created_at: string
  updated_at: string
}

export interface CampusPartnerAdmin {
  id: string
  campus_id: string
  partner_id: string
  partner_name: string
  partner_logo?: string
  partner_type: string
  start_date?: string
  end_date?: string
}

export interface CampusStats {
  total: number
  active: number
  inactive: number
  headquarters: number
  byCountry: Record<string, number>
  totalTeamMembers: number
  totalPartners: number
  totalPrograms: number
}

export interface CampusFilters {
  search?: string
  countryId?: string
  isActive?: boolean | 'all'
}

export interface CampusUsage {
  programs: number
  teamMembers: number
  events: number
  calls: number
}

// === DONNÉES MOCK ===

// Convertir les campus existants en format admin avec le siège
export const mockCampusAdmin: CampusAdmin[] = [
  // Siège - Alexandrie
  {
    id: 'campus-siege',
    code: 'ALX',
    name: 'Siège - Campus d\'Alexandrie',
    description: 'Le siège de l\'Université Senghor situé à Alexandrie, Égypte. Campus principal accueillant les formations de master et les services administratifs centraux.',
    cover_image: null,
    cover_image_alt: 'Vue du campus d\'Alexandrie',
    country_id: 'country-eg',
    country_code: 'EG',
    country_name: 'Égypte',
    city: 'Alexandrie',
    address: '1 Place Ahmed Orabi, El Mancheya',
    postal_code: '21111',
    latitude: campusPrincipal.latitude,
    longitude: campusPrincipal.longitude,
    email: 'info@usenghor.org',
    phone: '+20 3 487 1374',
    head_id: 'staff-rector',
    head_name: 'Pr. Thierry Verdel',
    head_photo: null,
    is_headquarters: true,
    is_active: true,
    programs_count: 12,
    team_members_count: 45,
    partners_count: 8,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2024-12-15T10:30:00Z'
  },
  // Campus externalisés
  ...mockCampusExternalises.map((campus, index) => ({
    id: campus.id,
    code: campus.slug.toUpperCase().substring(0, 3),
    name: campus.name_fr,
    description: campus.description_fr,
    cover_image: campus.image,
    cover_image_alt: `Campus de ${campus.city_fr}`,
    country_id: `country-${campus.country.toLowerCase()}`,
    country_code: campus.country,
    country_name: campus.country_fr,
    city: campus.city_fr,
    address: campus.address_fr,
    postal_code: undefined,
    latitude: campus.latitude,
    longitude: campus.longitude,
    email: campus.contact_email,
    phone: undefined,
    head_id: `staff-head-${campus.slug}`,
    head_name: getHeadName(index),
    head_photo: null,
    is_headquarters: false,
    is_active: campus.is_active,
    programs_count: Math.floor(Math.random() * 5) + 2,
    team_members_count: Math.floor(Math.random() * 10) + 3,
    partners_count: Math.floor(Math.random() * 5) + 1,
    created_at: '2021-06-01T00:00:00Z',
    updated_at: '2024-11-20T14:00:00Z'
  }))
]

// Helper pour générer des noms de responsables
function getHeadName(index: number): string {
  const names = [
    'Dr. Kouadio Yao',
    'Pr. Fatou Diallo',
    'Dr. Jean-Pierre Nkurunziza',
    'Pr. Amal Ben Salem',
    'Dr. Mohamed El Fassi',
    'Pr. Gisèle Moussavou',
    'Dr. Codjo Agossou',
    'Pr. Katalin Kovács',
    'Dr. Nguyen Van Minh',
    'Pr. Hery Rakotoarison',
    'Dr. Patient Mukendi'
  ]
  return names[index % names.length]
}

// Partenaires des campus
export const mockCampusPartnersAdmin: CampusPartnerAdmin[] = [
  // Partenaires du siège
  {
    id: 'cp-1',
    campus_id: 'campus-siege',
    partner_id: 'partenaire-oif',
    partner_name: 'Organisation Internationale de la Francophonie',
    partner_logo: mockPartenaires.find(p => p.id === 'partenaire-oif')?.logo,
    partner_type: 'institutionnel',
    start_date: '2006-01-01'
  },
  {
    id: 'cp-2',
    campus_id: 'campus-siege',
    partner_id: 'partenaire-auf',
    partner_name: 'Agence Universitaire de la Francophonie',
    partner_logo: mockPartenaires.find(p => p.id === 'partenaire-auf')?.logo,
    partner_type: 'academique',
    start_date: '2006-01-01'
  },
  // Partenaires campus Abidjan
  {
    id: 'cp-3',
    campus_id: 'campus-abidjan',
    partner_id: 'partenaire-univ-fhb',
    partner_name: 'Université Félix Houphouët-Boigny',
    partner_type: 'academique',
    start_date: '2015-09-01'
  },
  // Partenaires campus Dakar
  {
    id: 'cp-4',
    campus_id: 'campus-dakar',
    partner_id: 'partenaire-ucad',
    partner_name: 'Université Cheikh Anta Diop',
    partner_type: 'academique',
    start_date: '2012-01-01'
  },
  // Partenaires campus Yaoundé
  {
    id: 'cp-5',
    campus_id: 'campus-yaounde',
    partner_id: 'partenaire-univ-yaounde',
    partner_name: 'Université de Yaoundé II',
    partner_type: 'academique',
    start_date: '2016-03-01'
  }
]

// === FONCTIONS HELPER ===

/**
 * Génère un ID unique pour un campus
 */
export const generateCampusId = () => `campus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

/**
 * Génère un code campus à partir du nom
 */
export const generateCampusCode = (name: string): string => {
  const words = name.split(/\s+/)
  if (words.length >= 2) {
    return (words[0].substring(0, 1) + words[1].substring(0, 2)).toUpperCase()
  }
  return name.substring(0, 3).toUpperCase()
}

/**
 * Récupère tous les campus (admin)
 */
export const getAllCampusAdmin = (): CampusAdmin[] => {
  return [...mockCampusAdmin].sort((a, b) => {
    // Siège en premier
    if (a.is_headquarters) return -1
    if (b.is_headquarters) return 1
    return a.name.localeCompare(b.name)
  })
}

/**
 * Récupère un campus par ID
 */
export const getCampusByIdAdmin = (id: string): CampusAdmin | undefined => {
  return mockCampusAdmin.find(c => c.id === id)
}

/**
 * Récupère un campus par code
 */
export const getCampusByCodeAdmin = (code: string): CampusAdmin | undefined => {
  return mockCampusAdmin.find(c => c.code.toLowerCase() === code.toLowerCase())
}

/**
 * Filtre les campus selon les critères
 */
export const getFilteredCampusAdmin = (filters?: CampusFilters): CampusAdmin[] => {
  let result = [...mockCampusAdmin]

  if (filters?.search) {
    const query = filters.search.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.city.toLowerCase().includes(query) ||
      c.country_name.toLowerCase().includes(query) ||
      c.head_name?.toLowerCase().includes(query)
    )
  }

  if (filters?.countryId && filters.countryId !== 'all') {
    result = result.filter(c => c.country_id === filters.countryId)
  }

  if (filters?.isActive !== undefined && filters.isActive !== 'all') {
    result = result.filter(c => c.is_active === filters.isActive)
  }

  // Siège en premier
  return result.sort((a, b) => {
    if (a.is_headquarters) return -1
    if (b.is_headquarters) return 1
    return a.name.localeCompare(b.name)
  })
}

/**
 * Statistiques des campus
 */
export const getCampusStats = (): CampusStats => {
  const byCountry: Record<string, number> = {}

  mockCampusAdmin.forEach(c => {
    byCountry[c.country_name] = (byCountry[c.country_name] || 0) + 1
  })

  return {
    total: mockCampusAdmin.length,
    active: mockCampusAdmin.filter(c => c.is_active).length,
    inactive: mockCampusAdmin.filter(c => !c.is_active).length,
    headquarters: mockCampusAdmin.filter(c => c.is_headquarters).length,
    byCountry,
    totalTeamMembers: mockCampusAdmin.reduce((sum, c) => sum + c.team_members_count, 0),
    totalPartners: mockCampusAdmin.reduce((sum, c) => sum + c.partners_count, 0),
    totalPrograms: mockCampusAdmin.reduce((sum, c) => sum + c.programs_count, 0)
  }
}

/**
 * Vérifie l'utilisation d'un campus
 */
export const checkCampusUsage = (campusId: string): CampusUsage => {
  const campus = mockCampusAdmin.find(c => c.id === campusId)
  return {
    programs: campus?.programs_count || 0,
    teamMembers: campus?.team_members_count || 0,
    events: Math.floor(Math.random() * 5),
    calls: Math.floor(Math.random() * 3)
  }
}

/**
 * Récupère les partenaires d'un campus
 */
export const getCampusPartnersById = (campusId: string): CampusPartnerAdmin[] => {
  return mockCampusPartnersAdmin.filter(p => p.campus_id === campusId)
}

/**
 * Liste des campus pour un select
 */
export const getCampusForSelect = (): Array<{ id: string; name: string; code: string }> => {
  return mockCampusAdmin
    .filter(c => c.is_active)
    .map(c => ({
      id: c.id,
      name: c.name,
      code: c.code
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Liste des pays uniques des campus
 */
export const getCampusCountries = (): Array<{ id: string; code: string; name: string }> => {
  const countries = new Map<string, { id: string; code: string; name: string }>()

  mockCampusAdmin.forEach(c => {
    if (!countries.has(c.country_id)) {
      countries.set(c.country_id, {
        id: c.country_id,
        code: c.country_code,
        name: c.country_name
      })
    }
  })

  return Array.from(countries.values()).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Liste des responsables potentiels pour un campus
 */
export const getCampusHeadCandidates = (): Array<{ id: string; name: string; photo?: string }> => {
  return [
    { id: 'staff-1', name: 'Dr. Kouadio Yao', photo: undefined },
    { id: 'staff-2', name: 'Pr. Fatou Diallo', photo: undefined },
    { id: 'staff-3', name: 'Dr. Jean-Pierre Nkurunziza', photo: undefined },
    { id: 'staff-4', name: 'Pr. Amal Ben Salem', photo: undefined },
    { id: 'staff-5', name: 'Dr. Mohamed El Fassi', photo: undefined },
    { id: 'staff-6', name: 'Pr. Gisèle Moussavou', photo: undefined },
    { id: 'staff-7', name: 'Dr. Codjo Agossou', photo: undefined },
    { id: 'staff-8', name: 'Pr. Katalin Kovács', photo: undefined },
    { id: 'staff-9', name: 'Dr. Nguyen Van Minh', photo: undefined },
    { id: 'staff-10', name: 'Pr. Hery Rakotoarison', photo: undefined }
  ]
}
