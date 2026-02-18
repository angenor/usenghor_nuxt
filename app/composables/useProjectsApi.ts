/**
 * Composable API - Projets Admin
 * ==============================
 *
 * Gestion des projets institutionnels via l'API backend FastAPI.
 */

import type {
  IdResponse,
  MessageResponse,
  PaginatedResponse,
  ProjectCallCreate,
  ProjectCallRead,
  ProjectCallStatus,
  ProjectCallType,
  ProjectCallUpdate,
  ProjectCategoryCreate,
  ProjectCategoryRead,
  ProjectCategoryUpdate,
  ProjectCreatePayload,
  ProjectMediaRead,
  ProjectPartnerCreate,
  ProjectPartnerRead,
  ProjectPartnerUpdate,
  ProjectRead,
  ProjectReadWithRelations,
  ProjectStatistics,
  ProjectStatus,
  ProjectUpdatePayload,
  PublicationStatus,
} from '~/types/api'

// ============================================================================
// Types Display (enrichis pour le frontend)
// ============================================================================

export interface ProjectDisplay extends ProjectRead {
  cover_image: string | null
  categories: ProjectCategoryRead[]
  // Noms résolus (optionnels)
  department_name?: string | null
  manager_name?: string | null
}

export interface ProjectStats {
  total: number
  byStatus: Record<ProjectStatus, number>
  byPublicationStatus: Record<PublicationStatus, number>
  totalBudget: number
}

export interface ProjectFilters {
  search?: string
  status?: ProjectStatus | 'all'
  publication_status?: PublicationStatus | 'all'
  category_id?: string | 'all'
  sector_external_id?: string | 'all'
}

// ============================================================================
// Labels et couleurs UI (exportés pour utilisation directe)
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

export const publicationStatusLabels: Record<PublicationStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
}

export const publicationStatusColors: Record<PublicationStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

export const projectCallTypeLabels: Record<ProjectCallType, string> = {
  application: 'Candidature',
  scholarship: 'Bourse',
  project: 'Projet',
  recruitment: 'Recrutement',
  training: 'Formation',
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

export function useProjectsApi() {
  const { apiFetch } = useApi()
  const { getMediaUrl } = useMediaApi()

  // =========================================================================
  // Transformations
  // =========================================================================

  /**
   * Transforme ProjectReadWithRelations (backend) vers ProjectDisplay (frontend).
   */
  function transformToDisplay(project: ProjectReadWithRelations): ProjectDisplay {
    return {
      ...project,
      cover_image: project.cover_image_external_id
        ? getMediaUrl(project.cover_image_external_id, 'medium')
        : null,
    }
  }

  /**
   * Transforme ProjectRead simple vers ProjectDisplay.
   */
  function transformSimpleToDisplay(project: ProjectRead): ProjectDisplay {
    return {
      ...project,
      cover_image: project.cover_image_external_id
        ? getMediaUrl(project.cover_image_external_id, 'medium')
        : null,
      categories: [],
    }
  }

  // =========================================================================
  // CRUD Categories
  // =========================================================================

  /**
   * Liste les catégories avec pagination.
   */
  async function listCategories(params: {
    page?: number
    limit?: number
    search?: string
  } = {}): Promise<PaginatedResponse<ProjectCategoryRead>> {
    return apiFetch<PaginatedResponse<ProjectCategoryRead>>('/api/admin/projects/categories', {
      query: {
        page: params.page || 1,
        limit: params.limit || 100,
        search: params.search,
      },
    })
  }

  /**
   * Récupère toutes les catégories (sans pagination).
   */
  async function getAllCategories(): Promise<ProjectCategoryRead[]> {
    const response = await listCategories({ limit: 100 })
    return response.items
  }

  /**
   * Récupère une catégorie par son ID.
   */
  async function getCategoryById(id: string): Promise<ProjectCategoryRead> {
    return apiFetch<ProjectCategoryRead>(`/api/admin/projects/categories/${id}`)
  }

  /**
   * Crée une nouvelle catégorie.
   */
  async function createCategory(data: ProjectCategoryCreate): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/projects/categories', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour une catégorie.
   */
  async function updateCategory(id: string, data: ProjectCategoryUpdate): Promise<ProjectCategoryRead> {
    return apiFetch<ProjectCategoryRead>(`/api/admin/projects/categories/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime une catégorie.
   */
  async function deleteCategory(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/projects/categories/${id}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // CRUD Projects
  // =========================================================================

  /**
   * Liste les projets avec pagination et filtres.
   */
  async function listProjects(params: ProjectFilters & {
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<ProjectDisplay>> {
    const response = await apiFetch<PaginatedResponse<ProjectReadWithRelations>>('/api/admin/projects', {
      query: {
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search,
        status: params.status !== 'all' ? params.status : undefined,
        publication_status: params.publication_status !== 'all' ? params.publication_status : undefined,
        category_id: params.category_id !== 'all' ? params.category_id : undefined,
        sector_external_id: params.sector_external_id !== 'all' ? params.sector_external_id : undefined,
      },
    })

    return {
      ...response,
      items: response.items.map(transformToDisplay),
    }
  }

  /**
   * Récupère un projet par son ID.
   */
  async function getProjectById(id: string): Promise<ProjectDisplay> {
    const project = await apiFetch<ProjectReadWithRelations>(`/api/admin/projects/${id}`)
    return transformToDisplay(project)
  }

  /**
   * Crée un nouveau projet.
   */
  async function createProject(data: ProjectCreatePayload): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/projects', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un projet.
   */
  async function updateProject(id: string, data: ProjectUpdatePayload): Promise<ProjectDisplay> {
    const project = await apiFetch<ProjectRead>(`/api/admin/projects/${id}`, {
      method: 'PUT',
      body: data,
    })
    return transformSimpleToDisplay(project)
  }

  /**
   * Supprime un projet.
   */
  async function deleteProject(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/projects/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Publie un projet.
   */
  async function publishProject(id: string): Promise<ProjectDisplay> {
    const project = await apiFetch<ProjectRead>(`/api/admin/projects/${id}/publish`, {
      method: 'POST',
    })
    return transformSimpleToDisplay(project)
  }

  /**
   * Dépublie un projet.
   */
  async function unpublishProject(id: string): Promise<ProjectDisplay> {
    const project = await apiFetch<ProjectRead>(`/api/admin/projects/${id}/unpublish`, {
      method: 'POST',
    })
    return transformSimpleToDisplay(project)
  }

  // =========================================================================
  // Statistics
  // =========================================================================

  /**
   * Récupère les statistiques des projets depuis le backend.
   */
  async function getProjectStatistics(): Promise<ProjectStatistics> {
    return apiFetch<ProjectStatistics>('/api/admin/projects/statistics')
  }

  /**
   * Calcule les statistiques pour l'affichage frontend.
   */
  async function getProjectStats(): Promise<ProjectStats> {
    const stats = await getProjectStatistics()
    return {
      total: stats.total_projects,
      byStatus: {
        planned: stats.planned_projects,
        ongoing: stats.ongoing_projects,
        completed: stats.completed_projects,
        suspended: stats.suspended_projects,
      },
      byPublicationStatus: {
        draft: 0, // Non fourni par le backend, à calculer si besoin
        published: 0,
        archived: 0,
      },
      totalBudget: stats.total_budget,
    }
  }

  // =========================================================================
  // Partners
  // =========================================================================

  /**
   * Liste les partenaires d'un projet.
   */
  async function listProjectPartners(projectId: string): Promise<ProjectPartnerRead[]> {
    return apiFetch<ProjectPartnerRead[]>(`/api/admin/projects/${projectId}/partners`)
  }

  /**
   * Ajoute un partenaire à un projet.
   */
  async function addProjectPartner(projectId: string, data: ProjectPartnerCreate): Promise<ProjectPartnerRead> {
    return apiFetch<ProjectPartnerRead>(`/api/admin/projects/${projectId}/partners`, {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un partenaire de projet.
   */
  async function updateProjectPartner(
    projectId: string,
    partnerExternalId: string,
    data: ProjectPartnerUpdate,
  ): Promise<ProjectPartnerRead> {
    return apiFetch<ProjectPartnerRead>(`/api/admin/projects/${projectId}/partners/${partnerExternalId}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Retire un partenaire d'un projet.
   */
  async function removeProjectPartner(projectId: string, partnerExternalId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/projects/${projectId}/partners/${partnerExternalId}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Project Calls
  // =========================================================================

  /**
   * Liste tous les appels de projets.
   */
  async function listAllCalls(params: {
    page?: number
    limit?: number
    status?: ProjectCallStatus
  } = {}): Promise<PaginatedResponse<ProjectCallRead>> {
    return apiFetch<PaginatedResponse<ProjectCallRead>>('/api/admin/projects/calls/all', {
      query: {
        page: params.page || 1,
        limit: params.limit || 20,
        status: params.status,
      },
    })
  }

  /**
   * Liste les appels d'un projet.
   */
  async function listProjectCalls(projectId: string): Promise<ProjectCallRead[]> {
    return apiFetch<ProjectCallRead[]>(`/api/admin/projects/${projectId}/calls`)
  }

  /**
   * Récupère un appel par son ID.
   */
  async function getCallById(callId: string): Promise<ProjectCallRead> {
    return apiFetch<ProjectCallRead>(`/api/admin/projects/calls/${callId}`)
  }

  /**
   * Crée un appel pour un projet.
   */
  async function createProjectCall(projectId: string, data: ProjectCallCreate): Promise<IdResponse> {
    return apiFetch<IdResponse>(`/api/admin/projects/${projectId}/calls`, {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un appel.
   */
  async function updateCall(callId: string, data: ProjectCallUpdate): Promise<ProjectCallRead> {
    return apiFetch<ProjectCallRead>(`/api/admin/projects/calls/${callId}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un appel.
   */
  async function deleteCall(callId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/projects/calls/${callId}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Countries
  // =========================================================================

  /**
   * Liste les pays d'un projet.
   */
  async function listProjectCountries(projectId: string): Promise<Array<{ project_id: string; country_external_id: string }>> {
    return apiFetch<Array<{ project_id: string; country_external_id: string }>>(`/api/admin/projects/${projectId}/countries`)
  }

  /**
   * Ajoute un pays à un projet.
   */
  async function addProjectCountry(projectId: string, countryExternalId: string): Promise<{ project_id: string; country_external_id: string }> {
    return apiFetch<{ project_id: string; country_external_id: string }>(`/api/admin/projects/${projectId}/countries`, {
      method: 'POST',
      body: { country_external_id: countryExternalId },
    })
  }

  /**
   * Retire un pays d'un projet.
   */
  async function removeProjectCountry(projectId: string, countryExternalId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/projects/${projectId}/countries/${countryExternalId}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Media Library
  // =========================================================================

  /**
   * Liste les albums d'un projet.
   */
  async function listProjectMedia(projectId: string): Promise<ProjectMediaRead[]> {
    return apiFetch<ProjectMediaRead[]>(`/api/admin/projects/${projectId}/media`)
  }

  /**
   * Ajoute un album à un projet.
   */
  async function addProjectAlbum(projectId: string, albumExternalId: string): Promise<ProjectMediaRead> {
    return apiFetch<ProjectMediaRead>(`/api/admin/projects/${projectId}/media`, {
      method: 'POST',
      body: { album_external_id: albumExternalId },
    })
  }

  /**
   * Retire un album d'un projet.
   */
  async function removeProjectAlbum(projectId: string, albumExternalId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/projects/${projectId}/media/${albumExternalId}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Génère un slug à partir du titre.
   */
  function slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  /**
   * Formate une date pour les inputs de type date.
   */
  function toDateInput(isoDate: string | null | undefined): string {
    if (!isoDate) return ''
    return isoDate.slice(0, 10)
  }

  /**
   * Formate une date pour l'affichage.
   */
  function formatDate(isoDate: string | null | undefined): string {
    if (!isoDate) return '-'
    return new Date(isoDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  /**
   * Formate une date courte pour l'affichage.
   */
  function formatDateShort(isoDate: string | null | undefined): string {
    if (!isoDate) return '-'
    return new Date(isoDate).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
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

  /**
   * Obtient l'emoji drapeau à partir du code pays ISO.
   */
  function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  return {
    // CRUD Categories
    listCategories,
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,

    // CRUD Projects
    listProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    publishProject,
    unpublishProject,

    // Statistics
    getProjectStatistics,
    getProjectStats,

    // Partners
    listProjectPartners,
    addProjectPartner,
    updateProjectPartner,
    removeProjectPartner,

    // Project Calls
    listAllCalls,
    listProjectCalls,
    getCallById,
    createProjectCall,
    updateCall,
    deleteCall,

    // Countries
    listProjectCountries,
    addProjectCountry,
    removeProjectCountry,

    // Media Library
    listProjectMedia,
    addProjectAlbum,
    removeProjectAlbum,

    // Transformations
    transformToDisplay,

    // Helpers
    slugify,
    toDateInput,
    formatDate,
    formatDateShort,
    formatBudget,
    getFlagEmoji,

    // Labels & Colors
    projectStatusLabels,
    projectStatusColors,
    publicationStatusLabels,
    publicationStatusColors,
    projectCallTypeLabels,
    projectCallStatusLabels,
    projectCallStatusColors,
  }
}
