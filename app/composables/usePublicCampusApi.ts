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

  return {
    // API calls
    listCampuses,
    getAllCampuses,
    getCampusByCode,
    getCampusBySlug,

    // Helpers
    getCampusUrl,
    getCoverImageUrl,
    getCampusFlagEmoji,
    getCampusLocation,
    getFlagEmoji,
  }
}
