/**
 * Composable API - Countries
 * ==========================
 *
 * Gestion des pays via l'API backend FastAPI.
 * Aligné sur le schéma SQL: countries (01_core.sql)
 */

import type { PaginatedResponse } from '~/types/api'

// ============================================================================
// Types Backend (alignés sur les schemas Pydantic)
// ============================================================================

export interface CountryRead {
  id: string
  iso_code: string
  iso_code3: string | null
  name_fr: string
  name_en: string | null
  name_ar: string | null
  phone_code: string | null
  active: boolean
}

export interface CountryPublic {
  id: string
  iso_code: string
  iso_code3: string | null
  name_fr: string
  name_en: string | null
  phone_code: string | null
}

// ============================================================================
// Composable
// ============================================================================

export function useCountriesApi() {
  const { apiFetch } = useApi()

  // Cache pour les pays
  const countriesCache = ref<CountryRead[]>([])

  // =========================================================================
  // API Calls
  // =========================================================================

  /**
   * Liste tous les pays actifs (endpoint public, sans pagination).
   */
  async function getAllCountries(): Promise<CountryRead[]> {
    // Utiliser le cache s'il est déjà rempli
    if (countriesCache.value.length > 0) {
      return countriesCache.value
    }

    try {
      const response = await apiFetch<CountryPublic[]>('/api/public/countries/all')
      // Mapper vers CountryRead avec active=true
      countriesCache.value = response.map(c => ({
        ...c,
        active: true,
      }))
      return countriesCache.value
    }
    catch (error) {
      console.error('Erreur lors du chargement des pays:', error)
      return []
    }
  }

  /**
   * Liste les pays avec pagination (endpoint admin).
   */
  async function listCountries(params?: {
    page?: number
    limit?: number
    search?: string
    active?: boolean
  }): Promise<PaginatedResponse<CountryRead>> {
    return apiFetch<PaginatedResponse<CountryRead>>('/api/admin/countries', {
      query: {
        page: params?.page || 1,
        limit: params?.limit || 100,
        search: params?.search,
        active: params?.active,
      },
    })
  }

  /**
   * Récupère un pays par son ID.
   */
  async function getCountryById(id: string): Promise<CountryRead> {
    return apiFetch<CountryRead>(`/api/admin/countries/${id}`)
  }

  /**
   * Récupère un pays par son code ISO.
   */
  async function getCountryByCode(isoCode: string): Promise<CountryPublic> {
    return apiFetch<CountryPublic>(`/api/public/countries/${isoCode}`)
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Génère l'emoji drapeau à partir du code ISO.
   */
  function getFlagEmoji(isoCode: string | null | undefined): string {
    if (!isoCode || isoCode.length !== 2) return ''
    const codePoints = isoCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  /**
   * Recherche un pays dans le cache par ID.
   */
  function getCountryFromCache(id: string | null): CountryRead | null {
    if (!id) return null
    return countriesCache.value.find(c => c.id === id) || null
  }

  /**
   * Invalide le cache des pays.
   */
  function invalidateCache(): void {
    countriesCache.value = []
  }

  /**
   * Liste des pays pour un select.
   */
  async function getCountriesForSelect(): Promise<Array<{
    id: string
    iso_code: string
    name: string
  }>> {
    const countries = await getAllCountries()
    return countries
      .map(c => ({
        id: c.id,
        iso_code: c.iso_code,
        name: c.name_fr,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  return {
    // API
    getAllCountries,
    listCountries,
    getCountryById,
    getCountryByCode,

    // Helpers
    getFlagEmoji,
    getCountryFromCache,
    getCountriesForSelect,
    invalidateCache,

    // Cache
    countriesCache,
  }
}
