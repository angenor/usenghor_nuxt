/**
 * Mock Data: Partenaires (Admin)
 * Gestion complète des partenaires pour le back-office
 * Table SQL: partners (06_partner.sql)
 */

import { mockPartenaires, mockCharterOperators, mockCampusPartners, type Partenaire } from './partenaires'
import { mockPaysBailleurs, getFlagEmoji } from './pays-bailleurs'
import { mockCampusPartnersAdmin } from './campus-admin'
import { mockProjects } from './projets'
import { mockEvents } from './events'

// Types SQL alignés
export type PartnerTypeSql = 'charter_operator' | 'campus_partner' | 'program_partner' | 'project_partner' | 'other'

export interface PartnerAdmin {
  id: string
  name: string
  description?: string
  logo_url?: string
  logo_external_id?: string
  country_external_id?: string
  country?: {
    id: string
    name: string
    code: string
    flag?: string
  }
  website?: string
  type: PartnerTypeSql
  email?: string
  phone?: string
  display_order: number
  active: boolean
  // Compteurs d'associations
  campuses_count: number
  programs_count: number
  projects_count: number
  events_count: number
  // Métadonnées
  created_at: string
  updated_at: string
}

export interface PartnerStats {
  total: number
  active: number
  inactive: number
  byType: Array<{
    type: PartnerTypeSql
    type_label: string
    count: number
  }>
  byCountry: Array<{
    country_id: string
    country_name: string
    country_code: string
    count: number
  }>
  totalAssociations: number
}

export interface PartnerFilters {
  search?: string
  type?: PartnerTypeSql
  country_id?: string
  active?: boolean
  sort_by?: 'name' | 'display_order' | 'type' | 'country'
  sort_order?: 'asc' | 'desc'
}

export interface PartnerAssociations {
  campuses: Array<{ id: string; name: string }>
  programs: Array<{ id: string; title: string }>
  projects: Array<{ id: string; title: string }>
  events: Array<{ id: string; title: string }>
  total: number
  can_delete: boolean
}

// Labels des types de partenaires
export const partnerTypeLabels: Record<PartnerTypeSql, string> = {
  charter_operator: 'Opérateur de la charte',
  campus_partner: 'Partenaire campus',
  program_partner: 'Partenaire académique',
  project_partner: 'Partenaire de projets',
  other: 'Autre'
}

// Couleurs des types de partenaires (pour badges)
export const partnerTypeColors: Record<PartnerTypeSql, string> = {
  charter_operator: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  campus_partner: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  program_partner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  project_partner: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

// Liste des pays disponibles (pour sélection)
export interface CountryOption {
  id: string
  name: string
  code: string
  flag: string
}

// Générer une liste de pays depuis les partenaires existants + pays bailleurs
function getUniqueCountries(): CountryOption[] {
  const countriesMap = new Map<string, CountryOption>()

  // Ajouter les pays des bailleurs
  mockPaysBailleurs.forEach(pb => {
    if (!countriesMap.has(pb.code)) {
      countriesMap.set(pb.code, {
        id: `country-${pb.code.toLowerCase()}`,
        name: pb.name_fr,
        code: pb.code,
        flag: getFlagEmoji(pb.code)
      })
    }
  })

  // Ajouter les pays des partenaires existants
  mockPartenaires.forEach(p => {
    if (p.country && !countriesMap.has(p.country)) {
      countriesMap.set(p.country, {
        id: `country-${p.country.toLowerCase()}`,
        name: getCountryName(p.country),
        code: p.country,
        flag: getFlagEmoji(p.country)
      })
    }
  })

  return Array.from(countriesMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

// Helper pour obtenir le nom d'un pays par son code
function getCountryName(code: string): string {
  const countryNames: Record<string, string> = {
    FR: 'France',
    CA: 'Canada',
    BE: 'Belgique',
    CH: 'Suisse',
    EG: 'Égypte',
    SN: 'Sénégal',
    CI: 'Côte d\'Ivoire',
    CM: 'Cameroun',
    BF: 'Burkina Faso',
    BJ: 'Bénin',
    TG: 'Togo',
    GN: 'Guinée',
    MG: 'Madagascar',
    CD: 'RD Congo',
    MA: 'Maroc',
    LU: 'Luxembourg',
    PT: 'Portugal',
    HU: 'Hongrie',
    VN: 'Vietnam'
  }
  return countryNames[code] || code
}

// Mapper le type de catégorie existant vers le type SQL
function mapPartnerType(partenaire: Partenaire): PartnerTypeSql {
  if (partenaire.category === 'charter_operator') {
    return 'charter_operator'
  }
  // Pour les campus_partners, on distingue selon le partner_type
  switch (partenaire.partner_type) {
    case 'academique':
      return 'program_partner'
    case 'recherche':
      return 'project_partner'
    case 'institutionnel':
    case 'environnement':
    case 'culture':
    default:
      return 'campus_partner'
  }
}

// Compter les associations d'un partenaire
function countCampusesByPartner(partnerId: string): number {
  return mockCampusPartnersAdmin.filter(cp => cp.partner_id === partnerId).length
}

function countProjectsByPartner(partnerId: string): number {
  return mockProjects.filter(p =>
    p.partners.some(partner => partner.partner_id === partnerId)
  ).length
}

function countEventsByPartner(partnerId: string): number {
  return mockEvents.filter(e =>
    e.partners?.some(partner => partner.partner_id === partnerId)
  ).length
}

// Conversion d'un partenaire public vers partenaire admin
function toPartnerAdmin(partenaire: Partenaire): PartnerAdmin {
  const countryCode = partenaire.country
  const country = countryCode ? {
    id: `country-${countryCode.toLowerCase()}`,
    name: getCountryName(countryCode),
    code: countryCode,
    flag: getFlagEmoji(countryCode)
  } : undefined

  return {
    id: partenaire.id,
    name: partenaire.name_fr,
    description: partenaire.description_fr,
    logo_url: partenaire.logo,
    country_external_id: country?.id,
    country,
    website: partenaire.website,
    type: mapPartnerType(partenaire),
    email: undefined, // Pas dans le modèle public
    phone: undefined, // Pas dans le modèle public
    display_order: partenaire.sort_order,
    active: partenaire.is_active,
    campuses_count: countCampusesByPartner(partenaire.id),
    programs_count: 0, // À implémenter si formations liées aux partenaires
    projects_count: countProjectsByPartner(partenaire.id),
    events_count: countEventsByPartner(partenaire.id),
    created_at: '2020-01-01T10:00:00Z',
    updated_at: '2024-12-15T14:30:00Z'
  }
}

// Données mock des partenaires (admin)
export const mockPartnersAdmin: PartnerAdmin[] = mockPartenaires.map(toPartnerAdmin)

// Liste des pays disponibles
export const mockCountries: CountryOption[] = getUniqueCountries()

// Générer un nouvel ID de partenaire
export function generatePartnerId(): string {
  return `partner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Récupérer tous les partenaires (admin)
export function getAllPartnersAdmin(): PartnerAdmin[] {
  return [...mockPartnersAdmin].sort((a, b) => a.display_order - b.display_order)
}

// Récupérer un partenaire par ID
export function getPartnerByIdAdmin(id: string): PartnerAdmin | undefined {
  return mockPartnersAdmin.find(p => p.id === id)
}

// Récupérer les partenaires filtrés
export function getFilteredPartnersAdmin(filters?: PartnerFilters): PartnerAdmin[] {
  let result = getAllPartnersAdmin()

  // Filtre par type
  if (filters?.type) {
    result = result.filter(p => p.type === filters.type)
  }

  // Filtre par pays
  if (filters?.country_id) {
    result = result.filter(p => p.country_external_id === filters.country_id)
  }

  // Filtre par statut actif
  if (filters?.active !== undefined) {
    result = result.filter(p => p.active === filters.active)
  }

  // Recherche textuelle
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search) ||
      p.country?.name.toLowerCase().includes(search) ||
      p.website?.toLowerCase().includes(search)
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
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
      case 'country':
        comparison = (a.country?.name || '').localeCompare(b.country?.name || '')
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

// Récupérer les partenaires par type
export function getPartnersByType(type: PartnerTypeSql): PartnerAdmin[] {
  return mockPartnersAdmin
    .filter(p => p.type === type && p.active)
    .sort((a, b) => a.display_order - b.display_order)
}

// Statistiques des partenaires
export function getPartnerStats(): PartnerStats {
  const partners = mockPartnersAdmin
  const activePartners = partners.filter(p => p.active)

  // Compter par type
  const byTypeMap = new Map<PartnerTypeSql, number>()
  const allTypes: PartnerTypeSql[] = ['charter_operator', 'campus_partner', 'program_partner', 'project_partner', 'other']
  allTypes.forEach(t => byTypeMap.set(t, 0))
  partners.forEach(p => {
    byTypeMap.set(p.type, (byTypeMap.get(p.type) || 0) + 1)
  })

  const byType = allTypes.map(type => ({
    type,
    type_label: partnerTypeLabels[type],
    count: byTypeMap.get(type) || 0
  })).filter(t => t.count > 0)

  // Compter par pays
  const byCountryMap = new Map<string, { name: string; code: string; count: number }>()
  partners.forEach(p => {
    if (p.country) {
      const key = p.country.id
      const existing = byCountryMap.get(key)
      if (existing) {
        existing.count++
      } else {
        byCountryMap.set(key, {
          name: p.country.name,
          code: p.country.code,
          count: 1
        })
      }
    }
  })

  const byCountry = Array.from(byCountryMap.entries())
    .map(([id, data]) => ({
      country_id: id,
      country_name: data.name,
      country_code: data.code,
      count: data.count
    }))
    .sort((a, b) => b.count - a.count)

  // Total des associations
  const totalAssociations = partners.reduce((sum, p) =>
    sum + p.campuses_count + p.programs_count + p.projects_count + p.events_count, 0
  )

  return {
    total: partners.length,
    active: activePartners.length,
    inactive: partners.length - activePartners.length,
    byType,
    byCountry,
    totalAssociations
  }
}

// Vérifier les associations d'un partenaire (pour la suppression)
export function checkPartnerAssociations(partnerId: string): PartnerAssociations {
  // Campus associés
  const campuses = mockCampusPartnersAdmin
    .filter(cp => cp.partner_id === partnerId)
    .map(cp => ({
      id: cp.campus_id,
      name: cp.partner_name // On utilise le nom du campus ici
    }))

  // Projets associés
  const projects = mockProjects
    .filter(p => p.partners.some(partner => partner.partner_id === partnerId))
    .map(p => ({
      id: p.id,
      title: p.title_fr
    }))

  // Événements associés
  const events = mockEvents
    .filter(e => e.partners?.some(partner => partner.partner_id === partnerId))
    .map(e => ({
      id: e.id,
      title: e.title_fr
    }))

  // Programmes (à implémenter si besoin)
  const programs: Array<{ id: string; title: string }> = []

  const total = campuses.length + programs.length + projects.length + events.length

  return {
    campuses,
    programs,
    projects,
    events,
    total,
    can_delete: total === 0
  }
}

// Partenaires pour select (formulaires)
export function getPartnersForSelect(): Array<{ id: string; name: string; type: string; type_label: string }> {
  return mockPartnersAdmin
    .filter(p => p.active)
    .map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      type_label: partnerTypeLabels[p.type]
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Pays pour select dans le formulaire
export function getCountriesForSelect(): CountryOption[] {
  return mockCountries
}

// Types de partenaires pour select
export function getPartnerTypesForSelect(): Array<{ value: PartnerTypeSql; label: string }> {
  return Object.entries(partnerTypeLabels).map(([value, label]) => ({
    value: value as PartnerTypeSql,
    label
  }))
}
