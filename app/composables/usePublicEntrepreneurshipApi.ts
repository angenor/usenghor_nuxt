/**
 * Composable API - Pôle Entrepreneuriat et Innovation (lectures publiques)
 * =========================================================================
 *
 * Lectures sans authentification de /api/public/entrepreneurship.
 * Contrats : specs/021-pei-entrepreneurship-core/contracts/public-api.md,
 * specs/022-pei-laureates-partners/contracts/public-api.md.
 * Les erreurs sont propagées : les pages les absorbent (sections masquées).
 */

import type {
  PeiCohortPublic,
  PeiCohortType,
  PeiLaureatesPublic,
  PeiLaureateType,
  PeiPartnerFamilyPublic,
  PeiProgramPublic,
  PeiResourcePublic,
  PeiResourceType,
} from '~/types/api/entrepreneurship'

const BASE = '/api/public/entrepreneurship'

export function usePublicEntrepreneurshipApi() {
  const apiBase = useApiBase()

  function publicFetch<T>(endpoint: string, query?: Record<string, string>): Promise<T> {
    return $fetch<T>(`${apiBase}${BASE}${endpoint}`, { query })
  }

  /** Dispositifs actifs, triés par ordre d'affichage. */
  function listPrograms(): Promise<PeiProgramPublic[]> {
    return publicFetch<PeiProgramPublic[]>('/programs')
  }

  function getProgram(code: string): Promise<PeiProgramPublic> {
    return publicFetch<PeiProgramPublic>(`/programs/${encodeURIComponent(code)}`)
  }

  function listCohorts(type?: PeiCohortType): Promise<PeiCohortPublic[]> {
    return publicFetch<PeiCohortPublic[]>('/cohorts', type ? { type } : undefined)
  }

  function getCohort(code: string): Promise<PeiCohortPublic> {
    return publicFetch<PeiCohortPublic>(`/cohorts/${encodeURIComponent(code)}`)
  }

  /** Portraits publiés regroupés par cohorte active. */
  function listLaureates(type?: PeiLaureateType): Promise<PeiLaureatesPublic> {
    return publicFetch<PeiLaureatesPublic>('/laureates', type ? { type } : undefined)
  }

  /** Partenaires du pôle par famille (ordre fixe). */
  function listPartners(): Promise<PeiPartnerFamilyPublic[]> {
    return publicFetch<PeiPartnerFamilyPublic[]>('/partners')
  }

  function listResources(params: { type?: PeiResourceType, category?: string } = {}): Promise<PeiResourcePublic[]> {
    const query: Record<string, string> = {}
    if (params.type) query.type = params.type
    if (params.category) query.category = params.category
    return publicFetch<PeiResourcePublic[]>('/resources', query)
  }

  return {
    listPrograms,
    getProgram,
    listCohorts,
    getCohort,
    listLaureates,
    listPartners,
    listResources,
  }
}
