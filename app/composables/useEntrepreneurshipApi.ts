/**
 * Composable pour l'API admin du Pôle Entrepreneuriat et Innovation (PEI).
 * Authentification JWT requise (préfixe /api/admin/entrepreneurship).
 * Contrat : specs/021-pei-entrepreneurship-core/contracts/admin-api.md
 */

import type {
  ActiveStatus,
  PeiCohortAdmin,
  PeiCohortCreatePayload,
  PeiCohortTranslateRequest,
  PeiCohortTranslateResponse,
  PeiCohortType,
  PeiCohortUpdatePayload,
  PeiColor,
  PeiDashboardStats,
  PeiPage,
  PeiProgramAdmin,
  PeiProgramCreatePayload,
  PeiProgramPhase,
  PeiProgramTranslateRequest,
  PeiProgramTranslateResponse,
  PeiProgramUpdatePayload,
  PeiResourceAdmin,
  PeiResourceCreatePayload,
  PeiResourceTranslateRequest,
  PeiResourceTranslateResponse,
  PeiResourceType,
  PeiResourceUpdatePayload,
  PeiTranslateMissingResponse,
  PublishStatus,
  ReorderResponse,
} from '~/types/api/entrepreneurship'

// ============================================================================
// Options d'énumérations (exports de module)
// ============================================================================

export const programPhaseLabels: Record<PeiProgramPhase, string> = {
  awareness: 'Sensibilisation',
  status: 'Cadre / statut',
  pre_incubation: 'Pré-incubation',
  incubation: 'Incubation',
  funding: 'Amorçage',
  ecosystem: 'Écosystème',
}

export const programPhaseOptions: { value: PeiProgramPhase, label: string }[] = (
  Object.keys(programPhaseLabels) as PeiProgramPhase[]
).map(value => ({ value, label: programPhaseLabels[value] }))

export const cohortTypeOptions: { value: PeiCohortType, label: string }[] = [
  { value: 'fse', label: 'FSE' },
  { value: 'see', label: 'SEE' },
]

export const resourceTypeLabels: Record<PeiResourceType, string> = {
  document: 'Document',
  link: 'Lien',
  video: 'Vidéo',
}

export const resourceTypeOptions: { value: PeiResourceType, label: string }[] = (
  Object.keys(resourceTypeLabels) as PeiResourceType[]
).map(value => ({ value, label: resourceTypeLabels[value] }))

export interface PeiColorOption {
  value: PeiColor
  label: string
  swatchClass: string
  badgeClass: string
}

export const colorOptions: PeiColorOption[] = [
  {
    value: 'blue',
    label: 'Bleu',
    swatchClass: 'bg-brand-blue-500',
    badgeClass: 'bg-brand-blue-100 text-brand-blue-800 dark:bg-brand-blue-900/30 dark:text-brand-blue-300',
  },
  {
    value: 'blue_dark',
    label: 'Bleu foncé',
    swatchClass: 'bg-brand-blue-900',
    badgeClass: 'bg-brand-blue-200 text-brand-blue-900 dark:bg-brand-blue-950/50 dark:text-brand-blue-200',
  },
  {
    value: 'red',
    label: 'Rouge',
    swatchClass: 'bg-brand-red-500',
    badgeClass: 'bg-brand-red-100 text-brand-red-800 dark:bg-brand-red-900/30 dark:text-brand-red-300',
  },
  {
    value: 'amber',
    label: 'Ambre',
    swatchClass: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  {
    value: 'teal',
    label: 'Turquoise',
    swatchClass: 'bg-teal-600',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  },
]

// ============================================================================
// Paramètres de liste
// ============================================================================

export interface PeiProgramListParams {
  q?: string
  phase?: PeiProgramPhase
  active?: boolean
  page?: number
  page_size?: number
}

export interface PeiCohortListParams {
  q?: string
  type?: PeiCohortType
  active?: boolean
  page?: number
  page_size?: number
}

export interface PeiResourceListParams {
  q?: string
  type?: PeiResourceType
  category?: string
  is_published?: boolean
  page?: number
  page_size?: number
}

const BASE = '/api/admin/entrepreneurship'

export function useEntrepreneurshipApi() {
  const { apiFetch } = useApi()

  // ── Transversal ───────────────────────────────────────────────

  async function getDashboard(): Promise<PeiDashboardStats> {
    return await apiFetch<PeiDashboardStats>(`${BASE}/dashboard`)
  }

  async function translateMissing(): Promise<PeiTranslateMissingResponse> {
    return await apiFetch<PeiTranslateMissingResponse>(`${BASE}/translate-missing`, {
      method: 'POST',
    })
  }

  // ── Dispositifs ───────────────────────────────────────────────

  async function listPrograms(params: PeiProgramListParams = {}): Promise<PeiPage<PeiProgramAdmin>> {
    return await apiFetch<PeiPage<PeiProgramAdmin>>(`${BASE}/programs`, {
      query: params as Record<string, unknown>,
    })
  }

  async function getProgram(id: string): Promise<PeiProgramAdmin> {
    return await apiFetch<PeiProgramAdmin>(`${BASE}/programs/${id}`)
  }

  async function createProgram(payload: PeiProgramCreatePayload): Promise<PeiProgramAdmin> {
    return await apiFetch<PeiProgramAdmin>(`${BASE}/programs`, { method: 'POST', body: payload })
  }

  async function updateProgram(id: string, payload: PeiProgramUpdatePayload): Promise<PeiProgramAdmin> {
    return await apiFetch<PeiProgramAdmin>(`${BASE}/programs/${id}`, { method: 'PATCH', body: payload })
  }

  async function deleteProgram(id: string): Promise<void> {
    await apiFetch(`${BASE}/programs/${id}`, { method: 'DELETE' })
  }

  async function reorderPrograms(ids: string[]): Promise<ReorderResponse> {
    return await apiFetch<ReorderResponse>(`${BASE}/programs/reorder`, { method: 'PATCH', body: { ids } })
  }

  async function setProgramActive(id: string, active: boolean): Promise<ActiveStatus> {
    return await apiFetch<ActiveStatus>(`${BASE}/programs/${id}/active`, { method: 'PATCH', body: { active } })
  }

  async function translateProgram(payload: PeiProgramTranslateRequest): Promise<PeiProgramTranslateResponse> {
    return await apiFetch<PeiProgramTranslateResponse>(`${BASE}/programs/translate`, { method: 'POST', body: payload })
  }

  // ── Cohortes ──────────────────────────────────────────────────

  async function listCohorts(params: PeiCohortListParams = {}): Promise<PeiPage<PeiCohortAdmin>> {
    return await apiFetch<PeiPage<PeiCohortAdmin>>(`${BASE}/cohorts`, {
      query: params as Record<string, unknown>,
    })
  }

  async function getCohort(id: string): Promise<PeiCohortAdmin> {
    return await apiFetch<PeiCohortAdmin>(`${BASE}/cohorts/${id}`)
  }

  async function createCohort(payload: PeiCohortCreatePayload): Promise<PeiCohortAdmin> {
    return await apiFetch<PeiCohortAdmin>(`${BASE}/cohorts`, { method: 'POST', body: payload })
  }

  async function updateCohort(id: string, payload: PeiCohortUpdatePayload): Promise<PeiCohortAdmin> {
    return await apiFetch<PeiCohortAdmin>(`${BASE}/cohorts/${id}`, { method: 'PATCH', body: payload })
  }

  async function deleteCohort(id: string): Promise<void> {
    await apiFetch(`${BASE}/cohorts/${id}`, { method: 'DELETE' })
  }

  async function reorderCohorts(ids: string[]): Promise<ReorderResponse> {
    return await apiFetch<ReorderResponse>(`${BASE}/cohorts/reorder`, { method: 'PATCH', body: { ids } })
  }

  async function setCohortActive(id: string, active: boolean): Promise<ActiveStatus> {
    return await apiFetch<ActiveStatus>(`${BASE}/cohorts/${id}/active`, { method: 'PATCH', body: { active } })
  }

  async function translateCohort(payload: PeiCohortTranslateRequest): Promise<PeiCohortTranslateResponse> {
    return await apiFetch<PeiCohortTranslateResponse>(`${BASE}/cohorts/translate`, { method: 'POST', body: payload })
  }

  // ── Boîte à outils ────────────────────────────────────────────

  async function listResources(params: PeiResourceListParams = {}): Promise<PeiPage<PeiResourceAdmin>> {
    return await apiFetch<PeiPage<PeiResourceAdmin>>(`${BASE}/resources`, {
      query: params as Record<string, unknown>,
    })
  }

  async function listResourceCategories(): Promise<string[]> {
    return await apiFetch<string[]>(`${BASE}/resources/categories`)
  }

  async function getResource(id: string): Promise<PeiResourceAdmin> {
    return await apiFetch<PeiResourceAdmin>(`${BASE}/resources/${id}`)
  }

  async function createResource(payload: PeiResourceCreatePayload): Promise<PeiResourceAdmin> {
    return await apiFetch<PeiResourceAdmin>(`${BASE}/resources`, { method: 'POST', body: payload })
  }

  async function updateResource(id: string, payload: PeiResourceUpdatePayload): Promise<PeiResourceAdmin> {
    return await apiFetch<PeiResourceAdmin>(`${BASE}/resources/${id}`, { method: 'PATCH', body: payload })
  }

  async function deleteResource(id: string): Promise<void> {
    await apiFetch(`${BASE}/resources/${id}`, { method: 'DELETE' })
  }

  async function reorderResources(ids: string[]): Promise<ReorderResponse> {
    return await apiFetch<ReorderResponse>(`${BASE}/resources/reorder`, { method: 'PATCH', body: { ids } })
  }

  async function setResourcePublished(id: string, isPublished: boolean): Promise<PublishStatus> {
    return await apiFetch<PublishStatus>(`${BASE}/resources/${id}/publish`, {
      method: 'PATCH',
      body: { is_published: isPublished },
    })
  }

  async function translateResource(payload: PeiResourceTranslateRequest): Promise<PeiResourceTranslateResponse> {
    return await apiFetch<PeiResourceTranslateResponse>(`${BASE}/resources/translate`, { method: 'POST', body: payload })
  }

  return {
    getDashboard,
    translateMissing,
    listPrograms,
    getProgram,
    createProgram,
    updateProgram,
    deleteProgram,
    reorderPrograms,
    setProgramActive,
    translateProgram,
    listCohorts,
    getCohort,
    createCohort,
    updateCohort,
    deleteCohort,
    reorderCohorts,
    setCohortActive,
    translateCohort,
    listResources,
    listResourceCategories,
    getResource,
    createResource,
    updateResource,
    deleteResource,
    reorderResources,
    setResourcePublished,
    translateResource,
  }
}
