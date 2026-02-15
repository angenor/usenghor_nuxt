import type {
  PaginatedResponse,
  ProgramCareerOpportunityRead,
  ProgramSemesterWithCourses,
  ProgramSkillRead,
  ProgramType,
} from '~/types/api'

// ============================================================================
// Types pour l'API publique des programmes
// ============================================================================

export interface ProgramPublic {
  id: string
  code: string
  title: string
  subtitle: string | null
  slug: string
  description: string | null
  teaching_methods: string | null
  cover_image_external_id: string | null
  sector_external_id: string | null
  field_id: string | null
  field_name: string | null
  type: ProgramType
  duration_months: number | null
  credits: number | null
  degree_awarded: string | null
  required_degree: string | null
  is_featured: boolean
}

export interface ProgramFieldPublic {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
}

export interface ProgramPublicWithDetails extends ProgramPublic {
  semesters: ProgramSemesterWithCourses[]
  skills: ProgramSkillRead[]
  career_opportunities: ProgramCareerOpportunityRead[]
}

// ============================================================================
// Mapping entre types URL et types backend
// ============================================================================

// URL slug vers ProgramType backend
export const urlSlugToProgramType: Record<string, ProgramType> = {
  'masters': 'master',
  'doctorat': 'doctorate',
  'diplomes-universitaires': 'university_diploma',
  'certifiantes': 'certificate',
}

// ProgramType backend vers URL slug
export const programTypeToUrlSlug: Record<ProgramType, string> = {
  'master': 'masters',
  'doctorate': 'doctorat',
  'university_diploma': 'diplomes-universitaires',
  'certificate': 'certifiantes',
}

// ============================================================================
// Labels et couleurs
// ============================================================================

export const publicProgramTypeLabels: Record<ProgramType, string> = {
  master: 'Master',
  doctorate: 'Doctorat',
  university_diploma: 'DU',
  certificate: 'Certificat',
}

export const publicProgramTypeColors: Record<ProgramType, { icon: string; color: string; bgColor: string }> = {
  master: {
    icon: 'fa-solid fa-graduation-cap',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-500',
  },
  doctorate: {
    icon: 'fa-solid fa-book-open',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-600',
  },
  university_diploma: {
    icon: 'fa-solid fa-award',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-500',
  },
  certificate: {
    icon: 'fa-solid fa-certificate',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-500',
  },
}

// ============================================================================
// Composable
// ============================================================================

export function usePublicProgramsApi() {
  const baseUrl = useApiBase()

  /**
   * Fetch helper pour les endpoints publics (sans authentification)
   */
  async function publicFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await $fetch<T>(`${baseUrl}${endpoint}`, {
      ...options,
    })
    return response
  }

  /**
   * Liste les programmes publiés avec pagination et filtres
   */
  async function listPrograms(params: {
    page?: number
    limit?: number
    search?: string
    program_type?: ProgramType
    sector_id?: string
  } = {}): Promise<PaginatedResponse<ProgramPublic>> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.search) query.set('search', params.search)
    if (params.program_type) query.set('program_type', params.program_type)
    if (params.sector_id) query.set('sector_id', params.sector_id)

    const queryString = query.toString()
    const url = `/api/public/programs${queryString ? `?${queryString}` : ''}`

    return publicFetch<PaginatedResponse<ProgramPublic>>(url)
  }

  /**
   * Récupère un programme publié par son slug
   */
  async function getProgramBySlug(slug: string): Promise<ProgramPublicWithDetails> {
    return publicFetch<ProgramPublicWithDetails>(`/api/public/programs/${slug}`)
  }

  /**
   * Liste les programmes publiés par type
   */
  async function listProgramsByType(programType: ProgramType): Promise<ProgramPublic[]> {
    return publicFetch<ProgramPublic[]>(`/api/public/programs/by-type/${programType}`)
  }

  /**
   * Liste les programmes publiés par département
   */
  async function listProgramsByDepartment(departmentId: string): Promise<ProgramPublic[]> {
    return publicFetch<ProgramPublic[]>(`/api/public/programs/by-department/${departmentId}`)
  }

  /**
   * Liste les programmes publiés par service
   */
  async function listProgramsByService(serviceId: string): Promise<ProgramPublic[]> {
    return publicFetch<ProgramPublic[]>(`/api/public/programs/by-service/${serviceId}`)
  }

  /**
   * Liste les programmes mis à la une (featured)
   */
  async function listFeaturedPrograms(limit = 4): Promise<ProgramPublic[]> {
    return publicFetch<ProgramPublic[]>(`/api/public/programs/featured?limit=${limit}`)
  }

  /**
   * Récupère des programmes similaires (même type ou département)
   */
  async function getRelatedPrograms(
    program: ProgramPublicWithDetails,
    limit = 3,
  ): Promise<ProgramPublic[]> {
    try {
      // Récupérer les programmes du même type
      const sameType = await listProgramsByType(program.type)

      // Filtrer pour exclure le programme actuel et limiter
      return sameType
        .filter(p => p.id !== program.id)
        .slice(0, limit)
    }
    catch {
      return []
    }
  }

  /**
   * Liste les champs disciplinaires (pour filtrage des certificats)
   */
  async function listPublicFields(): Promise<ProgramFieldPublic[]> {
    return publicFetch<ProgramFieldPublic[]>('/api/public/program-fields')
  }

  /**
   * Récupère les actualités associées à un programme
   */
  async function getProgramNews(slug: string): Promise<unknown[]> {
    return publicFetch<unknown[]>(`/api/public/programs/${slug}/news`)
  }

  /**
   * Récupère les IDs des albums de la médiathèque d'un programme
   */
  async function getProgramAlbums(slug: string): Promise<string[]> {
    return publicFetch<string[]>(`/api/public/programs/${slug}/media-library`)
  }

  /**
   * Formatage de la durée en mois
   */
  function formatDuration(months: number | null, locale: string = 'fr'): string {
    if (!months) return '-'

    if (locale === 'en') {
      if (months < 12) return `${months} month${months > 1 ? 's' : ''}`
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`
      return `${years} year${years > 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
    }

    // Français par défaut
    if (months < 12) return `${months} mois`
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return `${years} an${years > 1 ? 's' : ''}`
    return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`
  }

  return {
    // API calls
    listPrograms,
    getProgramBySlug,
    listProgramsByType,
    listProgramsByDepartment,
    listProgramsByService,
    listFeaturedPrograms,
    getRelatedPrograms,
    listPublicFields,
    getProgramNews,
    getProgramAlbums,

    // Helpers
    formatDuration,

    // Mappings
    urlSlugToProgramType,
    programTypeToUrlSlug,

    // Labels & colors
    publicProgramTypeLabels,
    publicProgramTypeColors,
  }
}
