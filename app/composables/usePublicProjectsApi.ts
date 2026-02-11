/**
 * Composable API - Projets Publics
 * =================================
 *
 * Accès aux données de projets pour le front-office (endpoints publics).
 */

import type {
  PaginatedResponse,
  ProjectCallRead,
  ProjectCallStatus,
  ProjectCategoryRead,
  ProjectFundraisingPublic,
  ProjectReadWithRelations,
  ProjectStatus,
} from '~/types/api'

// ============================================================================
// Types Display (enrichis pour le frontend)
// ============================================================================

export interface ProjectPublicDisplay extends ProjectReadWithRelations {
  cover_image: string | null
}

export interface ProjectCallPublicDisplay extends ProjectCallRead {
  cover_image: string | null
}

export interface ProjectFundraisingDisplay extends ProjectFundraisingPublic {
  cover_image: string | null
  formatted_budget: string
}

// ============================================================================
// Labels et couleurs UI
// ============================================================================

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planned: 'Planifié',
  ongoing: 'En cours',
  completed: 'Terminé',
  suspended: 'Suspendu',
}

export const projectStatusColors: Record<ProjectStatus, string> = {
  planned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ongoing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export const projectCallStatusLabels: Record<ProjectCallStatus, string> = {
  ongoing: 'En cours',
  closed: 'Clôturé',
  upcoming: 'À venir',
}

export const projectCallStatusColors: Record<ProjectCallStatus, string> = {
  ongoing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
}

// ============================================================================
// Composable
// ============================================================================

export function usePublicProjectsApi() {
  // =========================================================================
  // Transformations
  // =========================================================================

  /**
   * Transforme ProjectReadWithRelations (backend) vers ProjectPublicDisplay (frontend).
   */
  function transformToDisplay(project: ProjectReadWithRelations): ProjectPublicDisplay {
    return {
      ...project,
      cover_image: project.cover_image_external_id
        ? `https://picsum.photos/seed/${project.cover_image_external_id}/1200/600`
        : null,
    }
  }

  /**
   * Transforme ProjectCallRead vers ProjectCallPublicDisplay.
   */
  function transformCallToDisplay(call: ProjectCallRead): ProjectCallPublicDisplay {
    return {
      ...call,
      cover_image: call.cover_image_external_id
        ? `https://picsum.photos/seed/${call.cover_image_external_id}/1200/600`
        : null,
    }
  }

  // =========================================================================
  // Catégories
  // =========================================================================

  /**
   * Liste toutes les catégories de projets.
   */
  async function getCategories(): Promise<ProjectCategoryRead[]> {
    return await $fetch<ProjectCategoryRead[]>('/api/public/projects/categories')
  }

  // =========================================================================
  // Projets
  // =========================================================================

  /**
   * Liste les projets publiés avec pagination et filtres.
   */
  async function listProjects(params: {
    page?: number
    limit?: number
    search?: string
    status?: ProjectStatus | 'all'
    category?: string | 'all'
  } = {}): Promise<PaginatedResponse<ProjectPublicDisplay>> {
    // Nettoyer les query params
    const query: Record<string, string | number> = {
      page: params.page || 1,
      limit: params.limit || 20,
    }

    if (params.search) {
      query.search = params.search
    }
    if (params.status && params.status !== 'all') {
      query.status = params.status
    }
    if (params.category && params.category !== 'all') {
      query.category = params.category
    }

    const response = await $fetch<PaginatedResponse<ProjectReadWithRelations>>('/api/public/projects', { query })

    return {
      ...response,
      items: response.items.map(transformToDisplay),
    }
  }

  /**
   * Récupère un projet publié par son slug.
   */
  async function getProjectBySlug(slug: string): Promise<ProjectPublicDisplay | null> {
    try {
      const project = await $fetch<ProjectReadWithRelations>(`/api/public/projects/by-slug/${slug}`)
      return transformToDisplay(project)
    }
    catch (error: unknown) {
      const fetchError = error as { status?: number }
      if (fetchError.status === 404) {
        return null
      }
      throw error
    }
  }

  /**
   * Récupère un projet publié par son ID.
   */
  async function getProjectById(id: string): Promise<ProjectPublicDisplay | null> {
    try {
      const project = await $fetch<ProjectReadWithRelations>(`/api/public/projects/${id}`)
      return transformToDisplay(project)
    }
    catch (error: unknown) {
      const fetchError = error as { status?: number }
      if (fetchError.status === 404) {
        return null
      }
      throw error
    }
  }

  // =========================================================================
  // Levée de fonds
  // =========================================================================

  /**
   * Liste les projets mis en avant pour la section levée de fonds.
   */
  async function listFundraisingFeaturedProjects(limit = 4): Promise<ProjectFundraisingDisplay[]> {
    const projects = await $fetch<ProjectFundraisingPublic[]>(
      '/api/public/projects/fundraising-featured',
      { query: { limit } },
    )
    return projects.map(project => ({
      ...project,
      cover_image: project.cover_image_external_id
        ? `https://picsum.photos/seed/${project.cover_image_external_id}/800/500`
        : null,
      formatted_budget: formatBudget(
        project.budget != null ? Number(project.budget) : null,
        project.currency,
      ),
    }))
  }

  // =========================================================================
  // Appels de projets
  // =========================================================================

  /**
   * Liste les appels en cours.
   */
  async function getOngoingCalls(): Promise<ProjectCallPublicDisplay[]> {
    const calls = await $fetch<ProjectCallRead[]>('/api/public/projects/calls/ongoing')
    return calls.map(transformCallToDisplay)
  }

  /**
   * Liste les appels à venir.
   */
  async function getUpcomingCalls(): Promise<ProjectCallPublicDisplay[]> {
    const calls = await $fetch<ProjectCallRead[]>('/api/public/projects/calls/upcoming')
    return calls.map(transformCallToDisplay)
  }

  /**
   * Liste tous les appels actifs (en cours + à venir).
   */
  async function getAllActiveCalls(): Promise<ProjectCallPublicDisplay[]> {
    const [ongoing, upcoming] = await Promise.all([
      getOngoingCalls(),
      getUpcomingCalls(),
    ])
    return [...ongoing, ...upcoming]
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Formate une date pour l'affichage.
   */
  function formatDate(isoDate: string | null | undefined, locale: string = 'fr'): string {
    if (!isoDate) return '-'
    const localeMap: Record<string, string> = {
      fr: 'fr-FR',
      en: 'en-US',
      ar: 'ar-EG',
    }
    return new Date(isoDate).toLocaleDateString(localeMap[locale] || 'fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  /**
   * Formate une date courte pour l'affichage.
   */
  function formatDateShort(isoDate: string | null | undefined, locale: string = 'fr'): string {
    if (!isoDate) return '-'
    const localeMap: Record<string, string> = {
      fr: 'fr-FR',
      en: 'en-US',
      ar: 'ar-EG',
    }
    return new Date(isoDate).toLocaleDateString(localeMap[locale] || 'fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  /**
   * Formate une date pour afficher seulement l'année.
   */
  function formatYear(isoDate: string | null | undefined, locale: string = 'fr'): string {
    if (!isoDate) return '-'
    const localeMap: Record<string, string> = {
      fr: 'fr-FR',
      en: 'en-US',
      ar: 'ar-EG',
    }
    return new Date(isoDate).toLocaleDateString(localeMap[locale] || 'fr-FR', {
      year: 'numeric',
    })
  }

  /**
   * Formate un montant en devise.
   */
  function formatBudget(amount: number | null | undefined, currency: string = 'EUR'): string {
    if (amount == null) return '-'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return {
    // Catégories
    getCategories,

    // Projets
    listProjects,
    getProjectBySlug,
    getProjectById,

    // Levée de fonds
    listFundraisingFeaturedProjects,

    // Appels
    getOngoingCalls,
    getUpcomingCalls,
    getAllActiveCalls,

    // Transformations
    transformToDisplay,
    transformCallToDisplay,

    // Helpers
    formatDate,
    formatDateShort,
    formatYear,
    formatBudget,

    // Labels & Colors
    projectStatusLabels,
    projectStatusColors,
    projectCallStatusLabels,
    projectCallStatusColors,
  }
}
