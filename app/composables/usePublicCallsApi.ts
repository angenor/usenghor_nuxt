import type {
  ApplicationCallPublic,
  ApplicationCallPublicWithDetails,
  CallStatus,
  CallType,
  PaginatedResponse,
} from '~/types/api'

// Labels et couleurs UI (réutilisés depuis useApplicationCallsApi)
export const callTypeLabels: Record<CallType, string> = {
  application: 'Candidature',
  scholarship: 'Bourse',
  project: 'Projet',
  recruitment: 'Recrutement',
  training: 'Formation',
}

export const callTypeColors: Record<CallType, string> = {
  application: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  scholarship: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  project: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  recruitment: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  training: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
}

export const callStatusLabels: Record<CallStatus, string> = {
  upcoming: 'À venir',
  ongoing: 'En cours',
  closed: 'Fermé',
}

export const callStatusColors: Record<CallStatus, string> = {
  upcoming: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ongoing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export function usePublicCallsApi() {
  const apiBase = useApiBase()

  async function publicFetch<T>(
    endpoint: string,
    options: { query?: Record<string, unknown> } = {},
  ): Promise<T> {
    const cleanQuery: Record<string, string> = {}
    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== null && value !== undefined && value !== 'all' && value !== '') {
          cleanQuery[key] = String(value)
        }
      }
    }

    return await $fetch<T>(`${apiBase}${endpoint}`, {
      query: Object.keys(cleanQuery).length > 0 ? cleanQuery : undefined,
    })
  }

  /**
   * Liste les appels à candidature publiés avec pagination et filtres
   */
  async function listCalls(params: {
    page?: number
    limit?: number
    search?: string
    call_type?: CallType | 'all'
    call_status?: CallStatus | 'all'
    program_id?: string
  } = {}): Promise<PaginatedResponse<ApplicationCallPublic>> {
    return publicFetch<PaginatedResponse<ApplicationCallPublic>>('/api/public/application-calls', {
      query: {
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || undefined,
        call_type: params.call_type !== 'all' ? params.call_type : undefined,
        call_status: params.call_status !== 'all' ? params.call_status : undefined,
        program_id: params.program_id || undefined,
      },
    })
  }

  /**
   * Liste les appels en cours
   */
  async function listOngoingCalls(callType?: CallType): Promise<ApplicationCallPublic[]> {
    return publicFetch<ApplicationCallPublic[]>('/api/public/application-calls/ongoing', {
      query: { call_type: callType },
    })
  }

  /**
   * Liste les appels à venir
   */
  async function listUpcomingCalls(callType?: CallType): Promise<ApplicationCallPublic[]> {
    return publicFetch<ApplicationCallPublic[]>('/api/public/application-calls/upcoming', {
      query: { call_type: callType },
    })
  }

  /**
   * Liste les appels par type
   */
  async function listCallsByType(callType: CallType): Promise<ApplicationCallPublic[]> {
    return publicFetch<ApplicationCallPublic[]>(`/api/public/application-calls/by-type/${callType}`)
  }

  /**
   * Récupère un appel par son slug
   */
  async function getCallBySlug(slug: string): Promise<ApplicationCallPublicWithDetails> {
    return publicFetch<ApplicationCallPublicWithDetails>(`/api/public/application-calls/${slug}`)
  }

  /**
   * Récupère les actualités associées à un appel
   */
  async function getCallNews(slug: string): Promise<unknown[]> {
    return publicFetch<unknown[]>(`/api/public/application-calls/${slug}/news`)
  }

  /**
   * Récupère les IDs des albums de la médiathèque d'un appel
   */
  async function getCallAlbums(slug: string): Promise<string[]> {
    return publicFetch<string[]>(`/api/public/application-calls/${slug}/media-library`)
  }

  return {
    listCalls,
    listOngoingCalls,
    listUpcomingCalls,
    listCallsByType,
    getCallBySlug,
    getCallNews,
    getCallAlbums,
    // Labels / couleurs UI
    callTypeLabels,
    callTypeColors,
    callStatusLabels,
    callStatusColors,
  }
}
