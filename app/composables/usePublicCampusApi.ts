/**
 * Composable API - Campus Public
 * ===============================
 *
 * Accès aux données publiques des campus via l'API backend.
 * Version publique (sans authentification).
 */

import type { PaginatedResponse } from '~/types/api'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Campus public avec données enrichies (pays résolu)
 */
export interface CampusPublic {
  id: string
  code: string // Utilisé comme slug
  name: string
  description: string | null
  cover_image_url: string | null
  city: string | null
  email: string | null
  phone: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  is_headquarters: boolean
  country_iso_code: string | null
  country_name_fr: string | null
}

/**
 * Partenaire d'un campus
 */
export interface CampusPartnerPublic {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  website: string | null
  type: 'charter_operator' | 'campus_partner' | 'program_partner' | 'project_partner' | 'other'
  country_iso_code: string | null
  country_name_fr: string | null
}

/**
 * Membre d'équipe d'un campus
 */
export interface CampusTeamMemberPublic {
  id: string
  first_name: string
  last_name: string
  position: string
  photo_url: string | null
  email: string | null
  display_order: number
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Génère un emoji de drapeau depuis un code ISO pays (2 lettres)
 */
export function getFlagEmoji(isoCode: string | null | undefined): string {
  if (!isoCode || isoCode.length !== 2) return ''
  const codePoints = isoCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// ============================================================================
// COMPOSABLE
// ============================================================================

export function usePublicCampusApi() {
  const config = useRuntimeConfig()
  const baseUrl = (config.public.apiBase || config.public.apiBaseUrl || 'http://localhost:8000') as string

  /**
   * Résout une URL de média (ajoute le baseUrl si c'est un chemin relatif)
   */
  function resolveMediaUrl(url: string | null): string | null {
    if (!url) return null
    // Si c'est une URL absolue (http:// ou https://), la retourner telle quelle
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // Sinon, préfixer avec le baseUrl
    return `${baseUrl}${url}`
  }

  // ==========================================================================
  // API CALLS
  // ==========================================================================

  /**
   * Liste les campus actifs avec pagination
   */
  async function listCampuses(params?: {
    page?: number
    limit?: number
    country_id?: string
    is_headquarters?: boolean
  }): Promise<PaginatedResponse<CampusPublic>> {
    const query: Record<string, string> = {}
    if (params?.page) query.page = String(params.page)
    if (params?.limit) query.limit = String(params.limit)
    if (params?.country_id) query.country_id = params.country_id
    if (params?.is_headquarters !== undefined) query.is_headquarters = String(params.is_headquarters)

    return $fetch<PaginatedResponse<CampusPublic>>(`${baseUrl}/api/public/campuses`, {
      query,
    })
  }

  /**
   * Récupère tous les campus actifs (sans pagination, pour la carte)
   */
  async function getAllCampuses(isHeadquarters?: boolean): Promise<CampusPublic[]> {
    const query: Record<string, string> = {}
    if (isHeadquarters !== undefined) query.is_headquarters = String(isHeadquarters)

    return $fetch<CampusPublic[]>(`${baseUrl}/api/public/campuses/all`, {
      query,
    })
  }

  /**
   * Récupère un campus par son code (slug)
   * Le code est insensible à la casse
   */
  async function getCampusByCode(code: string): Promise<CampusPublic> {
    return $fetch<CampusPublic>(`${baseUrl}/api/public/campuses/${code}`)
  }

  /**
   * Récupère un campus par son slug (alias pour getCampusByCode)
   * Le slug est le code en minuscules
   */
  async function getCampusBySlug(slug: string): Promise<CampusPublic | null> {
    try {
      return await getCampusByCode(slug)
    }
    catch {
      return null
    }
  }

  /**
   * Récupère les partenaires d'un campus
   */
  async function getCampusPartners(campusId: string): Promise<CampusPartnerPublic[]> {
    return $fetch<CampusPartnerPublic[]>(`${baseUrl}/api/public/campuses/${campusId}/partners`)
  }

  /**
   * Récupère les membres de l'équipe d'un campus
   */
  async function getCampusTeam(campusId: string): Promise<CampusTeamMemberPublic[]> {
    return $fetch<CampusTeamMemberPublic[]>(`${baseUrl}/api/public/campuses/${campusId}/team`)
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Génère l'URL d'une page campus
   */
  function getCampusUrl(campus: CampusPublic): string {
    return `/a-propos/partenaires/campus/${campus.code.toLowerCase()}`
  }

  /**
   * Retourne l'URL de l'image de couverture ou un placeholder
   */
  function getCoverImageUrl(campus: CampusPublic): string {
    const resolvedUrl = resolveMediaUrl(campus.cover_image_url)
    if (resolvedUrl) {
      return resolvedUrl
    }
    return `https://picsum.photos/seed/campus-${campus.code}/800/500`
  }

  /**
   * Retourne l'emoji du drapeau du pays
   */
  function getCampusFlagEmoji(campus: CampusPublic): string {
    return getFlagEmoji(campus.country_iso_code)
  }

  /**
   * Formate la localisation du campus
   */
  function getCampusLocation(campus: CampusPublic): string {
    const parts = []
    if (campus.city) parts.push(campus.city)
    if (campus.country_name_fr) parts.push(campus.country_name_fr)
    return parts.join(', ')
  }

  /**
   * Retourne l'URL du logo d'un partenaire ou un placeholder
   */
  function getPartnerLogoUrl(partner: CampusPartnerPublic): string {
    const resolvedUrl = resolveMediaUrl(partner.logo_url)
    if (resolvedUrl) {
      return resolvedUrl
    }
    return `https://picsum.photos/seed/partner-${partner.id}/200/200`
  }

  /**
   * Retourne l'emoji du drapeau du pays d'un partenaire
   */
  function getPartnerFlagEmoji(partner: CampusPartnerPublic): string {
    return getFlagEmoji(partner.country_iso_code)
  }

  /**
   * Retourne l'URL de la photo d'un membre d'équipe ou un placeholder
   */
  function getTeamMemberPhotoUrl(member: CampusTeamMemberPublic): string {
    const resolvedUrl = resolveMediaUrl(member.photo_url)
    if (resolvedUrl) {
      return resolvedUrl
    }
    return `https://i.pravatar.cc/200?u=${member.id}`
  }

  /**
   * Retourne le nom complet d'un membre d'équipe
   */
  function getTeamMemberFullName(member: CampusTeamMemberPublic): string {
    return `${member.first_name} ${member.last_name}`
  }

  return {
    // API calls
    listCampuses,
    getAllCampuses,
    getCampusByCode,
    getCampusBySlug,
    getCampusPartners,
    getCampusTeam,

    // Helpers
    getCampusUrl,
    getCoverImageUrl,
    getCampusFlagEmoji,
    getCampusLocation,
    getPartnerLogoUrl,
    getPartnerFlagEmoji,
    getTeamMemberPhotoUrl,
    getTeamMemberFullName,
    getFlagEmoji,
  }
}
