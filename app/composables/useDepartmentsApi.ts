/**
 * Composable API - Départements Admin
 * ====================================
 *
 * Gestion des départements via l'API backend FastAPI.
 */

import type {
  DepartmentCreate,
  DepartmentRead,
  DepartmentReorder,
  DepartmentUpdate,
  DepartmentWithServices,
  IdResponse,
  MessageResponse,
  PaginatedResponse,
  ServiceRead,
} from '~/types/api'

// ============================================================================
// Types Display (enrichis pour le frontend)
// ============================================================================

export interface DepartmentDisplay extends DepartmentRead {
  services_count: number
  // Infos du responsable résolues (optionnelles)
  head?: {
    id: string
    name: string
    title?: string | null
    photo?: string | null
  } | null
}

export interface DepartmentStats {
  total: number
  active: number
  totalServices: number
  withHead: number
}

export interface DepartmentFilters {
  search?: string
  active?: boolean
}

export interface DepartmentUsage {
  services_count: number
  programs_count: number
  projects_count: number
  can_delete: boolean
}

// ============================================================================
// Icônes disponibles pour les départements
// ============================================================================

export const departmentIcons = [
  { value: 'palette', label: 'Culture (palette)' },
  { value: 'leaf', label: 'Environnement (feuille)' },
  { value: 'briefcase', label: 'Administration (mallette)' },
  { value: 'heart-pulse', label: 'Santé (coeur)' },
  { value: 'graduation-cap', label: 'Éducation (chapeau)' },
  { value: 'scale-balanced', label: 'Juridique (balance)' },
  { value: 'globe', label: 'International (globe)' },
  { value: 'landmark', label: 'Patrimoine (monument)' },
  { value: 'chart-line', label: 'Économie (graphique)' },
  { value: 'code', label: 'Numérique (code)' },
  { value: 'building', label: 'Département (bâtiment)' },
  { value: 'sitemap', label: 'Organisation (organigramme)' },
  { value: 'users', label: 'Équipe (utilisateurs)' },
  { value: 'cogs', label: 'Services (engrenages)' },
  { value: 'book', label: 'Ressources (livre)' },
]

// ============================================================================
// Composable
// ============================================================================

export function useDepartmentsApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // Transformations
  // =========================================================================

  /**
   * Transforme DepartmentRead (backend) vers DepartmentDisplay (frontend).
   */
  function transformToDisplay(department: DepartmentRead, servicesCount: number = 0): DepartmentDisplay {
    return {
      ...department,
      services_count: servicesCount,
      head: null, // Sera enrichi si besoin via un autre appel
    }
  }

  /**
   * Transforme DepartmentWithServices vers DepartmentDisplay.
   */
  function transformWithServicesToDisplay(department: DepartmentWithServices): DepartmentDisplay {
    return {
      ...department,
      services_count: department.services?.length || 0,
      head: null,
    }
  }

  // =========================================================================
  // CRUD Departments
  // =========================================================================

  /**
   * Liste les départements avec pagination et filtres.
   */
  async function listDepartments(params: DepartmentFilters & {
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<DepartmentDisplay>> {
    const response = await apiFetch<PaginatedResponse<DepartmentRead>>('/api/admin/departments', {
      query: {
        page: params.page || 1,
        limit: params.limit || 100,
        search: params.search,
        active: params.active,
      },
    })

    // On doit récupérer le nombre de services pour chaque département
    // Le backend ne renvoie pas services_count dans la liste paginée
    // donc on transforme avec 0 pour l'instant (on pourrait faire des appels séparés si nécessaire)
    return {
      ...response,
      items: response.items.map(d => transformToDisplay(d, 0)),
    }
  }

  /**
   * Récupère tous les départements avec leur nombre de services.
   */
  async function getAllDepartments(): Promise<DepartmentDisplay[]> {
    const response = await listDepartments({ limit: 100 })

    // Pour chaque département, récupérer le nombre de services
    const departmentsWithServices = await Promise.all(
      response.items.map(async (dept) => {
        try {
          const services = await getDepartmentServices(dept.id)
          return {
            ...dept,
            services_count: services.length,
          }
        }
        catch {
          return dept
        }
      }),
    )

    return departmentsWithServices
  }

  /**
   * Récupère un département par son ID avec ses services.
   */
  async function getDepartmentById(id: string): Promise<DepartmentDisplay> {
    const department = await apiFetch<DepartmentWithServices>(`/api/admin/departments/${id}`)
    return transformWithServicesToDisplay(department)
  }

  /**
   * Crée un nouveau département.
   */
  async function createDepartment(data: DepartmentCreate): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/departments', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un département.
   */
  async function updateDepartment(id: string, data: DepartmentUpdate): Promise<DepartmentRead> {
    return apiFetch<DepartmentRead>(`/api/admin/departments/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un département.
   */
  async function deleteDepartment(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/departments/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Bascule le statut actif d'un département.
   */
  async function toggleDepartmentActive(id: string): Promise<DepartmentRead> {
    return apiFetch<DepartmentRead>(`/api/admin/departments/${id}/toggle-active`, {
      method: 'POST',
    })
  }

  /**
   * Réordonne les départements.
   */
  async function reorderDepartments(departmentIds: string[]): Promise<DepartmentRead[]> {
    return apiFetch<DepartmentRead[]>('/api/admin/departments/reorder', {
      method: 'PUT',
      body: { department_ids: departmentIds } as DepartmentReorder,
    })
  }

  // =========================================================================
  // Services
  // =========================================================================

  /**
   * Récupère les services d'un département.
   */
  async function getDepartmentServices(departmentId: string): Promise<ServiceRead[]> {
    return apiFetch<ServiceRead[]>(`/api/admin/departments/${departmentId}/services`)
  }

  // =========================================================================
  // Statistics
  // =========================================================================

  /**
   * Calcule les statistiques des départements.
   */
  async function getDepartmentsStats(): Promise<DepartmentStats> {
    const departments = await getAllDepartments()

    return {
      total: departments.length,
      active: departments.filter(d => d.active).length,
      totalServices: departments.reduce((sum, d) => sum + d.services_count, 0),
      withHead: departments.filter(d => d.head_external_id).length,
    }
  }

  /**
   * Vérifie si un département peut être supprimé.
   */
  async function getDepartmentUsage(id: string): Promise<DepartmentUsage> {
    try {
      const department = await getDepartmentById(id)
      const servicesCount = department.services_count

      return {
        services_count: servicesCount,
        programs_count: 0, // TODO: implémenter si nécessaire
        projects_count: 0, // TODO: implémenter si nécessaire
        can_delete: servicesCount === 0,
      }
    }
    catch {
      return {
        services_count: 0,
        programs_count: 0,
        projects_count: 0,
        can_delete: true,
      }
    }
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Génère un code unique pour un département basé sur son nom.
   */
  function generateDepartmentCode(name: string): string {
    const prefix = 'DEP'
    const slug = name
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z]+/g, '')
      .slice(0, 3)
    return `${prefix}-${slug}`
  }

  /**
   * Génère un nouvel ID (côté client, pour le mock uniquement).
   * En réalité, l'ID est généré par le backend.
   */
  function generateDepartmentId(): string {
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

  return {
    // CRUD Departments
    listDepartments,
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    toggleDepartmentActive,
    reorderDepartments,

    // Services
    getDepartmentServices,

    // Statistics
    getDepartmentsStats,
    getDepartmentUsage,

    // Transformations
    transformToDisplay,
    transformWithServicesToDisplay,

    // Helpers
    generateDepartmentCode,
    generateDepartmentId,
    formatDate,

    // Icônes disponibles
    departmentIcons,
  }
}
