/**
 * Composable API - Partenaires Public
 * ====================================
 *
 * Accès aux données publiques des partenaires via l'API backend.
 * Version publique (sans authentification).
 */

import type { PaginatedResponse } from '~/types/api'
import type { PartnerType } from '~/types/api/organization'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Partenaire tel que retourné par l'API publique
 */
export interface PartnerPublicRaw {
  id: string
  name: string
  description: string | null
  logo_external_id: string | null
  country_external_id: string | null
  website: string | null
  type: PartnerType
}

/**
 * Partenaire enrichi pour l'affichage frontend
 */
export interface PartnerPublic {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  website: string | null
  type: PartnerType
  // Infos pays enrichies
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

export function usePublicPartnersApi() {
  const baseUrl = useApiBase()
  const { getMediaUrl } = useMediaApi()
  const { getAllCountriesPublic } = useCountriesApi()

  // Cache des pays pour enrichissement
  const countriesCache = ref<Map<string, { iso_code: string, name_fr: string }>>(new Map())
  const countriesCacheLoaded = ref(false)

  /**
   * Charge le cache des pays
   */
  async function loadCountriesCache(): Promise<void> {
    if (countriesCacheLoaded.value) return

    try {
      const countries = await getAllCountriesPublic()
      countriesCache.value = new Map(
        countries.map(c => [c.id, { iso_code: c.iso_code, name_fr: c.name_fr }])
      )
      countriesCacheLoaded.value = true
    }
    catch (error) {
      console.error('Erreur chargement pays:', error)
    }
  }

  /**
   * Enrichit un partenaire avec les données résolues (logo URL, pays)
   */
  function enrichPartner(partner: PartnerPublicRaw): PartnerPublic {
    const country = partner.country_external_id
      ? countriesCache.value.get(partner.country_external_id)
      : null

    return {
      id: partner.id,
      name: partner.name,
      description: partner.description,
      logo_url: partner.logo_external_id ? getMediaUrl(partner.logo_external_id, 'low') : null,
      website: partner.website,
      type: partner.type,
      country_iso_code: country?.iso_code || null,
      country_name_fr: country?.name_fr || null,
    }
  }

  // ==========================================================================
  // API CALLS
  // ==========================================================================

  /**
   * Liste les partenaires actifs avec pagination
   */
  async function listPartners(params?: {
    page?: number
    limit?: number
    partner_type?: PartnerType
    country_id?: string
  }): Promise<PaginatedResponse<PartnerPublic>> {
    // S'assurer que le cache des pays est chargé
    await loadCountriesCache()

    const query: Record<string, string> = {}
    if (params?.page) query.page = String(params.page)
    if (params?.limit) query.limit = String(params.limit)
    if (params?.partner_type) query.partner_type = params.partner_type
    if (params?.country_id) query.country_id = params.country_id

    const response = await $fetch<PaginatedResponse<PartnerPublicRaw>>(`${baseUrl}/api/public/partners`, {
      query,
    })

    return {
      ...response,
      items: response.items.map(enrichPartner),
    }
  }

  /**
   * Récupère tous les partenaires actifs (sans pagination)
   */
  async function getAllPartners(): Promise<PartnerPublic[]> {
    // S'assurer que le cache des pays est chargé
    await loadCountriesCache()

    // Récupérer tous les partenaires (limite haute)
    const response = await $fetch<PaginatedResponse<PartnerPublicRaw>>(`${baseUrl}/api/public/partners`, {
      query: { limit: '500' },
    })

    return response.items.map(enrichPartner)
  }

  /**
   * Récupère les partenaires d'un type donné
   */
  async function getPartnersByType(partnerType: PartnerType): Promise<PartnerPublic[]> {
    // S'assurer que le cache des pays est chargé
    await loadCountriesCache()

    const partners = await $fetch<PartnerPublicRaw[]>(`${baseUrl}/api/public/partners/by-type/${partnerType}`)

    return partners.map(enrichPartner)
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Retourne l'URL du logo ou un placeholder
   */
  function getPartnerLogoUrl(partner: PartnerPublic): string | null {
    if (partner.logo_url) {
      return partner.logo_url
    }
    return null
  }

  /**
   * Retourne l'emoji du drapeau du pays
   */
  function getPartnerFlagEmoji(partner: PartnerPublic): string {
    return getFlagEmoji(partner.country_iso_code)
  }

  /**
   * Vérifie si un partenaire est un opérateur de la charte
   */
  function isCharterOperator(partner: PartnerPublic): boolean {
    return partner.type === 'charter_operator'
  }

  /**
   * Vérifie si un partenaire est un partenaire de campus
   */
  function isCampusPartner(partner: PartnerPublic): boolean {
    return partner.type === 'campus_partner'
  }

  return {
    // API calls
    listPartners,
    getAllPartners,
    getPartnersByType,

    // Helpers
    getPartnerLogoUrl,
    getPartnerFlagEmoji,
    getFlagEmoji,
    isCharterOperator,
    isCampusPartner,

    // Cache
    loadCountriesCache,
  }
}
