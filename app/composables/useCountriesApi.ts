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
  created_at: string
  updated_at: string
}

export interface CountryPublic {
  id: string
  iso_code: string
  iso_code3: string | null
  name_fr: string
  name_en: string | null
  phone_code: string | null
}

export interface CountryCreate {
  iso_code: string
  iso_code3?: string | null
  name_fr: string
  name_en?: string | null
  name_ar?: string | null
  phone_code?: string | null
  active?: boolean
}

export interface CountryUpdate {
  iso_code3?: string | null
  name_fr?: string
  name_en?: string | null
  name_ar?: string | null
  phone_code?: string | null
  active?: boolean
}

export interface CountryFilters {
  search?: string
  active?: boolean
  sort_by?: 'iso_code' | 'name_fr' | 'name_en' | 'created_at'
  sort_order?: 'asc' | 'desc'
}

export interface CountryStats {
  total: number
  active: number
  inactive: number
  with_phone_code: number
}

// Alias pour compatibilité avec le frontend
export type Country = CountryRead

// ============================================================================
// Composable
// ============================================================================

export function useCountriesApi() {
  const { apiFetch } = useApi()

  // Cache pour les pays
  const countriesCache = ref<CountryRead[]>([])
  const cacheLoaded = ref(false)

  // =========================================================================
  // API Calls - Lecture
  // =========================================================================

  /**
   * Liste tous les pays actifs (endpoint public, sans pagination).
   */
  async function getAllCountriesPublic(): Promise<CountryRead[]> {
    // Utiliser le cache s'il est déjà rempli
    if (countriesCache.value.length > 0) {
      return countriesCache.value
    }

    try {
      const response = await apiFetch<CountryPublic[]>('/api/public/countries/all')
      // Mapper vers CountryRead avec active=true
      countriesCache.value = response.map(c => ({
        ...c,
        name_ar: null,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      return countriesCache.value
    }
    catch (error) {
      console.error('Erreur lors du chargement des pays:', error)
      return []
    }
  }

  /**
   * Charge tous les pays depuis l'API admin (avec filtrage/tri côté client).
   */
  async function loadCountries(): Promise<CountryRead[]> {
    try {
      const response = await apiFetch<PaginatedResponse<CountryRead>>('/api/admin/countries', {
        query: { limit: 300 },
      })

      if (response?.items) {
        countriesCache.value = response.items
        cacheLoaded.value = true
      }

      return countriesCache.value
    }
    catch (error) {
      console.error('Erreur lors du chargement des pays:', error)
      return []
    }
  }

  /**
   * Récupère tous les pays avec filtres (côté client).
   */
  async function getAllCountries(filters?: CountryFilters): Promise<CountryRead[]> {
    if (!cacheLoaded.value) {
      await loadCountries()
    }

    let countries = [...countriesCache.value]

    // Filtrage par recherche
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      countries = countries.filter(c =>
        c.iso_code.toLowerCase().includes(search)
        || c.iso_code3?.toLowerCase().includes(search)
        || c.name_fr.toLowerCase().includes(search)
        || c.name_en?.toLowerCase().includes(search)
        || c.name_ar?.includes(search),
      )
    }

    // Filtrage par statut actif
    if (filters?.active !== undefined) {
      countries = countries.filter(c => c.active === filters.active)
    }

    // Tri
    const sortBy = filters?.sort_by || 'name_fr'
    const sortOrder = filters?.sort_order || 'asc'
    countries.sort((a, b) => {
      let aVal: string | number = ''
      let bVal: string | number = ''

      switch (sortBy) {
        case 'iso_code':
          aVal = a.iso_code
          bVal = b.iso_code
          break
        case 'name_fr':
          aVal = a.name_fr
          bVal = b.name_fr
          break
        case 'name_en':
          aVal = a.name_en || ''
          bVal = b.name_en || ''
          break
        case 'created_at':
          aVal = new Date(a.created_at).getTime()
          bVal = new Date(b.created_at).getTime()
          break
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })

    return countries
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
  async function getCountryById(id: string): Promise<CountryRead | null> {
    // Chercher dans le cache d'abord
    const cached = countriesCache.value.find(c => c.id === id)
    if (cached) return cached

    try {
      return await apiFetch<CountryRead>(`/api/admin/countries/${id}`)
    }
    catch (error) {
      console.error(`Erreur lors du chargement du pays ${id}:`, error)
      return null
    }
  }

  /**
   * Récupère un pays par son code ISO.
   */
  async function getCountryByCode(isoCode: string): Promise<CountryPublic | null> {
    try {
      return await apiFetch<CountryPublic>(`/api/public/countries/${isoCode}`)
    }
    catch {
      return null
    }
  }

  /**
   * Récupère un pays par son code ISO depuis le cache.
   */
  async function getCountryByIsoCode(isoCode: string): Promise<CountryRead | null> {
    if (!cacheLoaded.value) {
      await loadCountries()
    }
    return countriesCache.value.find(c => c.iso_code === isoCode) || null
  }

  /**
   * Récupère uniquement les pays actifs.
   */
  async function getActiveCountries(): Promise<CountryRead[]> {
    return getAllCountries({ active: true })
  }

  // =========================================================================
  // API Calls - CRUD Admin
  // =========================================================================

  /**
   * Crée un nouveau pays.
   */
  async function createCountry(data: CountryCreate): Promise<CountryRead | null> {
    try {
      const response = await apiFetch<{ id: string, message?: string }>(
        '/api/admin/countries',
        {
          method: 'POST',
          body: data,
        },
      )

      // Recharger le cache
      invalidateCache()
      await loadCountries()

      return countriesCache.value.find(c => c.id === response.id) || null
    }
    catch (error) {
      console.error('Erreur lors de la création du pays:', error)
      throw error
    }
  }

  /**
   * Met à jour un pays.
   */
  async function updateCountry(id: string, data: CountryUpdate): Promise<CountryRead | null> {
    try {
      const updated = await apiFetch<CountryRead>(
        `/api/admin/countries/${id}`,
        {
          method: 'PUT',
          body: data,
        },
      )

      // Mettre à jour le cache
      const index = countriesCache.value.findIndex(c => c.id === id)
      if (index !== -1) {
        countriesCache.value[index] = updated
      }

      return updated
    }
    catch (error) {
      console.error(`Erreur lors de la mise à jour du pays ${id}:`, error)
      throw error
    }
  }

  /**
   * Bascule le statut actif d'un pays.
   */
  async function toggleCountryActive(id: string): Promise<CountryRead | null> {
    try {
      const updated = await apiFetch<CountryRead>(
        `/api/admin/countries/${id}/toggle-active`,
        { method: 'POST' },
      )

      // Mettre à jour le cache
      const index = countriesCache.value.findIndex(c => c.id === id)
      if (index !== -1) {
        countriesCache.value[index] = updated
      }

      return updated
    }
    catch (error) {
      console.error(`Erreur lors du toggle du pays ${id}:`, error)
      throw error
    }
  }

  /**
   * Supprime un pays (pas d'endpoint DELETE, utilise désactivation).
   */
  async function deleteCountry(id: string): Promise<boolean> {
    // Le backend n'a pas d'endpoint DELETE, on utilise la désactivation
    try {
      const country = countriesCache.value.find(c => c.id === id)
      if (country?.active) {
        await toggleCountryActive(id)
      }
      return true
    }
    catch {
      return false
    }
  }

  // =========================================================================
  // Validation
  // =========================================================================

  /**
   * Vérifie si un code ISO 2 est déjà utilisé.
   */
  async function isIsoCodeTaken(isoCode: string, excludeId?: string): Promise<boolean> {
    if (!cacheLoaded.value) {
      await loadCountries()
    }
    return countriesCache.value.some(
      c => c.iso_code.toUpperCase() === isoCode.toUpperCase() && c.id !== excludeId,
    )
  }

  /**
   * Vérifie si un code ISO 3 est déjà utilisé.
   */
  async function isIsoCode3Taken(isoCode3: string, excludeId?: string): Promise<boolean> {
    if (!cacheLoaded.value) {
      await loadCountries()
    }
    return countriesCache.value.some(
      c => c.iso_code3?.toUpperCase() === isoCode3.toUpperCase() && c.id !== excludeId,
    )
  }

  /**
   * Valide le format d'un code ISO 2.
   */
  function validateIsoCode(code: string): boolean {
    return /^[A-Z]{2}$/i.test(code)
  }

  /**
   * Valide le format d'un code ISO 3.
   */
  function validateIsoCode3(code: string): boolean {
    return /^[A-Z]{3}$/i.test(code)
  }

  /**
   * Valide le format d'un indicatif téléphonique.
   */
  function validatePhoneCodeFormat(code: string): boolean {
    return /^\+?\d{1,4}$/.test(code.replace(/\s/g, ''))
  }

  // =========================================================================
  // Statistiques
  // =========================================================================

  /**
   * Calcule les statistiques des pays.
   */
  async function getCountryStats(): Promise<CountryStats> {
    if (!cacheLoaded.value) {
      await loadCountries()
    }

    const countries = countriesCache.value

    return {
      total: countries.length,
      active: countries.filter(c => c.active).length,
      inactive: countries.filter(c => !c.active).length,
      with_phone_code: countries.filter(c => c.phone_code).length,
    }
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

  // Alias pour compatibilité
  const getCountryFlagEmoji = getFlagEmoji

  /**
   * Formate un indicatif téléphonique pour l'affichage.
   */
  function formatPhoneCodeDisplay(phoneCode: string | null): string {
    if (!phoneCode) return '-'
    return phoneCode.startsWith('+') ? phoneCode : `+${phoneCode}`
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
    cacheLoaded.value = false
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
    // API - Lecture
    getAllCountries,
    getAllCountriesPublic,
    loadCountries,
    listCountries,
    getCountryById,
    getCountryByCode,
    getCountryByIsoCode,
    getActiveCountries,

    // API - CRUD Admin
    createCountry,
    updateCountry,
    toggleCountryActive,
    deleteCountry,

    // Validation
    isIsoCodeTaken,
    isIsoCode3Taken,
    validateIsoCode,
    validateIsoCode3,
    validatePhoneCodeFormat,

    // Stats
    getCountryStats,

    // Helpers
    getFlagEmoji,
    getCountryFlagEmoji,
    formatPhoneCodeDisplay,
    getCountryFromCache,
    getCountriesForSelect,
    invalidateCache,

    // Cache
    countriesCache,
    cacheLoaded,
  }
}
