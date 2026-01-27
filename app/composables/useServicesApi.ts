/**
 * Composable API - Services Admin
 * ================================
 *
 * Gestion des services via l'API backend FastAPI.
 * Aligné sur le schéma SQL: services (04_organization.sql)
 */

import type {
  DepartmentRead,
  IdResponse,
  MessageResponse,
  PaginatedResponse,
  ServiceRead,
} from '~/types/api'

// ============================================================================
// Types Backend (alignés sur les schemas Pydantic)
// ============================================================================

export type ProjectStatus = 'planned' | 'ongoing' | 'completed' | 'suspended'

export interface ServiceObjectiveRead {
  id: string
  service_id: string
  title: string
  description: string | null
  display_order: number
}

export interface ServiceAchievementRead {
  id: string
  service_id: string
  title: string
  description: string | null
  type: string | null
  cover_image_external_id: string | null
  achievement_date: string | null
  created_at: string
}

export interface ServiceProjectRead {
  id: string
  service_id: string
  title: string
  description: string | null
  cover_image_external_id: string | null
  progress: number
  status: ProjectStatus
  start_date: string | null
  expected_end_date: string | null
  created_at: string
  updated_at: string
}

export interface ServiceWithDetails extends ServiceRead {
  objectives: ServiceObjectiveRead[]
  achievements: ServiceAchievementRead[]
  projects: ServiceProjectRead[]
}

export interface ServiceCreate {
  name: string
  description?: string | null
  mission?: string | null
  email?: string | null
  phone?: string | null
  head_external_id?: string | null
  album_external_id?: string | null
  department_id?: string | null
  display_order?: number
  active?: boolean
}

export interface ServiceUpdate {
  name?: string
  description?: string | null
  mission?: string | null
  email?: string | null
  phone?: string | null
  head_external_id?: string | null
  album_external_id?: string | null
  department_id?: string | null
  display_order?: number
  active?: boolean
}

export interface ServiceObjectiveCreate {
  title: string
  description?: string | null
  display_order?: number
}

export interface ServiceObjectiveUpdate {
  title?: string
  description?: string | null
  display_order?: number
}

export interface ServiceAchievementCreate {
  title: string
  description?: string | null
  type?: string | null
  cover_image_external_id?: string | null
  achievement_date?: string | null
}

export interface ServiceAchievementUpdate {
  title?: string
  description?: string | null
  type?: string | null
  cover_image_external_id?: string | null
  achievement_date?: string | null
}

export interface ServiceProjectCreate {
  title: string
  description?: string | null
  cover_image_external_id?: string | null
  progress?: number
  status?: ProjectStatus
  start_date?: string | null
  expected_end_date?: string | null
}

export interface ServiceProjectUpdate {
  title?: string
  description?: string | null
  cover_image_external_id?: string | null
  progress?: number
  status?: ProjectStatus
  start_date?: string | null
  expected_end_date?: string | null
}

export interface ServiceReorder {
  service_ids: string[]
}

// ============================================================================
// Types Display (enrichis pour le frontend)
// ============================================================================

export interface ServiceDisplay extends ServiceRead {
  department?: {
    id: string
    name: string
    code: string
  } | null
  head?: {
    id: string
    name: string
    title?: string | null
    photo?: string | null
  } | null
  objectives_count: number
  achievements_count: number
  projects_count: number
}

export interface ServiceStats {
  total: number
  active: number
  inactive: number
  withHead: number
  withoutHead: number
  byDepartment: Array<{
    department_id: string
    department_name: string
    count: number
  }>
  totalObjectives: number
  totalAchievements: number
  totalProjects: number
}

export interface ServiceFilters {
  search?: string
  department_id?: string
  active?: boolean
  sort_by?: 'name' | 'display_order' | 'department' | 'objectives_count'
  sort_order?: 'asc' | 'desc'
}

export interface ServiceUsage {
  objectives_count: number
  achievements_count: number
  projects_count: number
  can_delete: boolean
  items_sample: Array<{ type: string; title: string }>
}

export interface ServicesByDepartment {
  department: {
    id: string
    name: string
    code: string
    icon?: string
  }
  services: ServiceDisplay[]
}

// ============================================================================
// Labels et couleurs pour le statut des projets
// ============================================================================

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planned: 'Planifié',
  ongoing: 'En cours',
  completed: 'Terminé',
  suspended: 'Suspendu',
}

export const projectStatusColors: Record<ProjectStatus, string> = {
  planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  ongoing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  suspended: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

// ============================================================================
// Composable
// ============================================================================

export function useServicesApi() {
  const { apiFetch } = useApi()

  // Cache pour les départements (éviter les appels multiples)
  const departmentsCache = ref<Map<string, DepartmentRead>>(new Map())

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Charge et cache les départements.
   */
  async function loadDepartments(): Promise<Map<string, DepartmentRead>> {
    if (departmentsCache.value.size > 0) {
      return departmentsCache.value
    }

    try {
      const response = await apiFetch<PaginatedResponse<DepartmentRead>>('/api/admin/departments', {
        query: { limit: 100 },
      })
      if (response?.items) {
        for (const dept of response.items) {
          departmentsCache.value.set(dept.id, dept)
        }
      }
    }
    catch (error) {
      console.error('Erreur lors du chargement des départements:', error)
    }

    return departmentsCache.value
  }

  /**
   * Transforme ServiceRead (backend) vers ServiceDisplay (frontend).
   */
  function transformToDisplay(
    service: ServiceRead,
    details?: { objectives: number; achievements: number; projects: number },
    departments?: Map<string, DepartmentRead>,
  ): ServiceDisplay {
    const dept = service.department_id && departments?.get(service.department_id)

    return {
      ...service,
      department: dept
        ? {
            id: dept.id,
            name: dept.name,
            code: dept.code,
          }
        : null,
      head: null, // Sera enrichi si besoin via un autre appel
      objectives_count: details?.objectives ?? 0,
      achievements_count: details?.achievements ?? 0,
      projects_count: details?.projects ?? 0,
    }
  }

  /**
   * Transforme ServiceWithDetails vers ServiceDisplay.
   */
  function transformWithDetailsToDisplay(
    service: ServiceWithDetails,
    departments?: Map<string, DepartmentRead>,
  ): ServiceDisplay {
    const dept = service.department_id && departments?.get(service.department_id)

    return {
      ...service,
      department: dept
        ? {
            id: dept.id,
            name: dept.name,
            code: dept.code,
          }
        : null,
      head: null, // Sera enrichi si besoin
      objectives_count: service.objectives?.length ?? 0,
      achievements_count: service.achievements?.length ?? 0,
      projects_count: service.projects?.length ?? 0,
    }
  }

  // =========================================================================
  // CRUD Services
  // =========================================================================

  /**
   * Liste les services avec pagination et filtres.
   */
  async function listServices(params: ServiceFilters & {
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<ServiceDisplay>> {
    const departments = await loadDepartments()

    const response = await apiFetch<PaginatedResponse<ServiceRead>>('/api/admin/services', {
      query: {
        page: params.page || 1,
        limit: params.limit || 100,
        search: params.search,
        department_id: params.department_id,
        active: params.active,
      },
    })

    // Pour chaque service, récupérer les compteurs
    const servicesWithDetails = await Promise.all(
      response.items.map(async (service) => {
        try {
          const details = await getServiceById(service.id)
          return transformWithDetailsToDisplay(details, departments)
        }
        catch {
          return transformToDisplay(service, undefined, departments)
        }
      }),
    )

    return {
      ...response,
      items: servicesWithDetails,
    }
  }

  /**
   * Récupère tous les services avec détails.
   */
  async function getAllServices(): Promise<ServiceDisplay[]> {
    const response = await listServices({ limit: 100 })
    return response.items
  }

  /**
   * Récupère un service par son ID avec ses détails.
   */
  async function getServiceById(id: string): Promise<ServiceWithDetails> {
    return apiFetch<ServiceWithDetails>(`/api/admin/services/${id}`)
  }

  /**
   * Crée un nouveau service.
   */
  async function createService(data: ServiceCreate): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/services', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un service.
   */
  async function updateService(id: string, data: ServiceUpdate): Promise<ServiceRead> {
    return apiFetch<ServiceRead>(`/api/admin/services/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un service.
   */
  async function deleteService(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/services/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Bascule le statut actif d'un service.
   */
  async function toggleServiceActive(id: string): Promise<ServiceRead> {
    return apiFetch<ServiceRead>(`/api/admin/services/${id}/toggle-active`, {
      method: 'POST',
    })
  }

  /**
   * Réordonne les services.
   */
  async function reorderServices(serviceIds: string[]): Promise<ServiceRead[]> {
    return apiFetch<ServiceRead[]>('/api/admin/services/reorder', {
      method: 'PUT',
      body: { service_ids: serviceIds } as ServiceReorder,
    })
  }

  // =========================================================================
  // Objectives
  // =========================================================================

  /**
   * Récupère les objectifs d'un service.
   */
  async function getServiceObjectives(serviceId: string): Promise<ServiceObjectiveRead[]> {
    return apiFetch<ServiceObjectiveRead[]>(`/api/admin/services/${serviceId}/objectives`)
  }

  /**
   * Crée un objectif pour un service.
   */
  async function createServiceObjective(
    serviceId: string,
    data: ServiceObjectiveCreate,
  ): Promise<ServiceObjectiveRead> {
    return apiFetch<ServiceObjectiveRead>(`/api/admin/services/${serviceId}/objectives`, {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un objectif.
   */
  async function updateServiceObjective(
    serviceId: string,
    objectiveId: string,
    data: ServiceObjectiveUpdate,
  ): Promise<ServiceObjectiveRead> {
    return apiFetch<ServiceObjectiveRead>(
      `/api/admin/services/${serviceId}/objectives/${objectiveId}`,
      {
        method: 'PUT',
        body: data,
      },
    )
  }

  /**
   * Supprime un objectif.
   */
  async function deleteServiceObjective(
    serviceId: string,
    objectiveId: string,
  ): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(
      `/api/admin/services/${serviceId}/objectives/${objectiveId}`,
      {
        method: 'DELETE',
      },
    )
  }

  // =========================================================================
  // Achievements
  // =========================================================================

  /**
   * Récupère les réalisations d'un service.
   */
  async function getServiceAchievements(serviceId: string): Promise<ServiceAchievementRead[]> {
    return apiFetch<ServiceAchievementRead[]>(`/api/admin/services/${serviceId}/achievements`)
  }

  /**
   * Crée une réalisation pour un service.
   */
  async function createServiceAchievement(
    serviceId: string,
    data: ServiceAchievementCreate,
  ): Promise<ServiceAchievementRead> {
    return apiFetch<ServiceAchievementRead>(`/api/admin/services/${serviceId}/achievements`, {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour une réalisation.
   */
  async function updateServiceAchievement(
    serviceId: string,
    achievementId: string,
    data: ServiceAchievementUpdate,
  ): Promise<ServiceAchievementRead> {
    return apiFetch<ServiceAchievementRead>(
      `/api/admin/services/${serviceId}/achievements/${achievementId}`,
      {
        method: 'PUT',
        body: data,
      },
    )
  }

  /**
   * Supprime une réalisation.
   */
  async function deleteServiceAchievement(
    serviceId: string,
    achievementId: string,
  ): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(
      `/api/admin/services/${serviceId}/achievements/${achievementId}`,
      {
        method: 'DELETE',
      },
    )
  }

  // =========================================================================
  // Projects
  // =========================================================================

  /**
   * Récupère les projets d'un service.
   */
  async function getServiceProjects(serviceId: string): Promise<ServiceProjectRead[]> {
    return apiFetch<ServiceProjectRead[]>(`/api/admin/services/${serviceId}/projects`)
  }

  /**
   * Crée un projet pour un service.
   */
  async function createServiceProject(
    serviceId: string,
    data: ServiceProjectCreate,
  ): Promise<ServiceProjectRead> {
    return apiFetch<ServiceProjectRead>(`/api/admin/services/${serviceId}/projects`, {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un projet.
   */
  async function updateServiceProject(
    serviceId: string,
    projectId: string,
    data: ServiceProjectUpdate,
  ): Promise<ServiceProjectRead> {
    return apiFetch<ServiceProjectRead>(
      `/api/admin/services/${serviceId}/projects/${projectId}`,
      {
        method: 'PUT',
        body: data,
      },
    )
  }

  /**
   * Supprime un projet.
   */
  async function deleteServiceProject(
    serviceId: string,
    projectId: string,
  ): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(
      `/api/admin/services/${serviceId}/projects/${projectId}`,
      {
        method: 'DELETE',
      },
    )
  }

  // =========================================================================
  // Albums
  // =========================================================================

  /**
   * Récupère les IDs d'albums associés à un service.
   */
  async function getServiceAlbums(serviceId: string): Promise<string[]> {
    return apiFetch<string[]>(`/api/admin/services/${serviceId}/albums`)
  }

  /**
   * Ajoute un album à la médiathèque d'un service.
   */
  async function addAlbumToService(
    serviceId: string,
    albumId: string,
  ): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/services/${serviceId}/albums/${albumId}`, {
      method: 'POST',
    })
  }

  /**
   * Retire un album de la médiathèque d'un service.
   */
  async function removeAlbumFromService(
    serviceId: string,
    albumId: string,
  ): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/services/${serviceId}/albums/${albumId}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Statistics & Utilities
  // =========================================================================

  /**
   * Calcule les statistiques des services.
   */
  async function getServicesStats(): Promise<ServiceStats> {
    const services = await getAllServices()
    const departments = await loadDepartments()

    // Compter par département
    const byDeptMap = new Map<string, number>()
    let totalObjectives = 0
    let totalAchievements = 0
    let totalProjects = 0

    for (const service of services) {
      const deptId = service.department_id || 'none'
      byDeptMap.set(deptId, (byDeptMap.get(deptId) || 0) + 1)
      totalObjectives += service.objectives_count
      totalAchievements += service.achievements_count
      totalProjects += service.projects_count
    }

    const byDepartment: ServiceStats['byDepartment'] = []
    for (const [deptId, count] of byDeptMap) {
      const dept = departments.get(deptId)
      byDepartment.push({
        department_id: deptId,
        department_name: dept?.name || 'Sans département',
        count,
      })
    }

    return {
      total: services.length,
      active: services.filter(s => s.active).length,
      inactive: services.filter(s => !s.active).length,
      withHead: services.filter(s => s.head_external_id).length,
      withoutHead: services.filter(s => !s.head_external_id).length,
      byDepartment: byDepartment.sort((a, b) => b.count - a.count),
      totalObjectives,
      totalAchievements,
      totalProjects,
    }
  }

  /**
   * Récupère les services groupés par département.
   */
  async function getServicesGroupedByDepartment(): Promise<ServicesByDepartment[]> {
    const services = await getAllServices()
    const departments = await loadDepartments()
    const grouped = new Map<string, ServiceDisplay[]>()

    for (const service of services) {
      const deptId = service.department_id || 'none'
      if (!grouped.has(deptId)) {
        grouped.set(deptId, [])
      }
      grouped.get(deptId)!.push(service)
    }

    const result: ServicesByDepartment[] = []
    for (const [deptId, deptServices] of grouped) {
      const dept = departments.get(deptId)
      result.push({
        department: dept
          ? {
              id: dept.id,
              name: dept.name,
              code: dept.code,
              icon: dept.icon_external_id || undefined,
            }
          : {
              id: 'none',
              name: 'Sans département',
              code: 'N/A',
            },
        services: deptServices.sort((a, b) => a.display_order - b.display_order),
      })
    }

    return result.sort((a, b) => a.department.name.localeCompare(b.department.name))
  }

  /**
   * Vérifie si un service peut être supprimé.
   */
  async function getServiceUsage(id: string): Promise<ServiceUsage> {
    try {
      const service = await getServiceById(id)
      const objectives = service.objectives || []
      const achievements = service.achievements || []
      const projects = service.projects || []

      const itemsSample: ServiceUsage['items_sample'] = []
      objectives.slice(0, 2).forEach(o => itemsSample.push({ type: 'Objectif', title: o.title }))
      achievements.slice(0, 2).forEach(a => itemsSample.push({ type: 'Réalisation', title: a.title }))
      projects.slice(0, 1).forEach(p => itemsSample.push({ type: 'Projet', title: p.title }))

      const totalItems = objectives.length + achievements.length + projects.length

      return {
        objectives_count: objectives.length,
        achievements_count: achievements.length,
        projects_count: projects.length,
        can_delete: totalItems === 0,
        items_sample: itemsSample.slice(0, 5),
      }
    }
    catch {
      return {
        objectives_count: 0,
        achievements_count: 0,
        projects_count: 0,
        can_delete: true,
        items_sample: [],
      }
    }
  }

  /**
   * Récupère les départements pour le select.
   */
  async function getDepartmentsForSelect(): Promise<Array<{ id: string; name: string; code: string }>> {
    // Forcer le rechargement si le cache est vide
    if (departmentsCache.value.size === 0) {
      await loadDepartments()
    }

    const departments = departmentsCache.value

    // Si toujours vide, essayer un appel direct
    if (departments.size === 0) {
      try {
        const response = await apiFetch<PaginatedResponse<DepartmentRead>>('/api/admin/departments', {
          query: { limit: 100 },
        })
        if (response?.items) {
          return response.items
            .map(d => ({
              id: d.id,
              name: d.name,
              code: d.code,
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
        }
      }
      catch (error) {
        console.error('Erreur lors du chargement direct des départements:', error)
      }
      return []
    }

    return Array.from(departments.values())
      .map(d => ({
        id: d.id,
        name: d.name,
        code: d.code,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  /**
   * Génère un ID de service (côté client, pour preview).
   */
  function generateServiceId(): string {
    return crypto.randomUUID()
  }

  /**
   * Formate une date pour l'affichage.
   */
  function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  /**
   * Invalide le cache des départements.
   */
  function invalidateDepartmentsCache(): void {
    departmentsCache.value.clear()
  }

  return {
    // CRUD Services
    listServices,
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    toggleServiceActive,
    reorderServices,

    // Objectives
    getServiceObjectives,
    createServiceObjective,
    updateServiceObjective,
    deleteServiceObjective,

    // Achievements
    getServiceAchievements,
    createServiceAchievement,
    updateServiceAchievement,
    deleteServiceAchievement,

    // Projects
    getServiceProjects,
    createServiceProject,
    updateServiceProject,
    deleteServiceProject,

    // Albums
    getServiceAlbums,
    addAlbumToService,
    removeAlbumFromService,

    // Statistics & Utilities
    getServicesStats,
    getServicesGroupedByDepartment,
    getServiceUsage,
    getDepartmentsForSelect,

    // Helpers
    generateServiceId,
    formatDate,
    transformToDisplay,
    transformWithDetailsToDisplay,
    invalidateDepartmentsCache,

    // Labels
    projectStatusLabels,
    projectStatusColors,
  }
}
