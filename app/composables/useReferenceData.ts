/**
 * Composable pour les données de référence
 * =========================================
 *
 * Récupère les données de référence (campus, départements, services, etc.)
 * depuis le backend pour les formulaires.
 */

import type { PaginatedResponse } from '~/types/api'

// ============================================================================
// Types
// ============================================================================

export interface CampusRef {
  id: string
  code: string
  name: string
  city: string | null
  is_headquarters: boolean
  active: boolean
}

export interface DepartmentRef {
  id: string
  code: string
  name: string
  active: boolean
}

export interface ServiceRef {
  id: string
  code: string
  name: string
  department_id: string
  active: boolean
}

export interface UserRef {
  id: string
  email: string
  last_name: string
  first_name: string
  full_name: string
}

export interface ProjectRef {
  id: string
  title: string
  status: string
}

export interface EventRef {
  id: string
  title: string
  start_date: string
}

// ============================================================================
// Composable
// ============================================================================

export function useReferenceData() {
  const { apiFetch } = useApi()

  // Cache pour éviter des appels répétés
  const campusesCache = ref<CampusRef[]>([])
  const departmentsCache = ref<DepartmentRef[]>([])
  const servicesCache = ref<ServiceRef[]>([])
  const usersCache = ref<UserRef[]>([])
  const projectsCache = ref<ProjectRef[]>([])
  const eventsCache = ref<EventRef[]>([])

  /**
   * Récupère la liste des campus.
   */
  async function getCampuses(forceRefresh = false): Promise<CampusRef[]> {
    if (campusesCache.value.length > 0 && !forceRefresh) {
      return campusesCache.value
    }

    try {
      const response = await apiFetch<PaginatedResponse<{
        id: string
        code: string
        name: string
        city: string | null
        is_headquarters: boolean
        active: boolean
      }>>('/api/admin/campuses', {
        query: { limit: 100, active: true },
      })

      campusesCache.value = response.items.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        city: c.city,
        is_headquarters: c.is_headquarters,
        active: c.active,
      }))

      return campusesCache.value
    } catch (e) {
      console.error('Erreur chargement campus:', e)
      return []
    }
  }

  /**
   * Récupère la liste des départements.
   */
  async function getDepartments(forceRefresh = false): Promise<DepartmentRef[]> {
    if (departmentsCache.value.length > 0 && !forceRefresh) {
      return departmentsCache.value
    }

    try {
      const response = await apiFetch<PaginatedResponse<{
        id: string
        code: string
        name: string
        active: boolean
      }>>('/api/admin/departments', {
        query: { limit: 100, active: true },
      })

      departmentsCache.value = response.items.map(d => ({
        id: d.id,
        code: d.code,
        name: d.name,
        active: d.active,
      }))

      return departmentsCache.value
    } catch (e) {
      console.error('Erreur chargement départements:', e)
      return []
    }
  }

  /**
   * Récupère la liste des services.
   */
  async function getServices(forceRefresh = false): Promise<ServiceRef[]> {
    if (servicesCache.value.length > 0 && !forceRefresh) {
      return servicesCache.value
    }

    try {
      const response = await apiFetch<PaginatedResponse<{
        id: string
        code: string
        name: string
        department_id: string
        active: boolean
      }>>('/api/admin/services', {
        query: { limit: 100, active: true },
      })

      servicesCache.value = response.items.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        department_id: s.department_id,
        active: s.active,
      }))

      return servicesCache.value
    } catch (e) {
      console.error('Erreur chargement services:', e)
      return []
    }
  }

  /**
   * Récupère la liste des utilisateurs (pour auteur).
   */
  async function getUsers(forceRefresh = false): Promise<UserRef[]> {
    if (usersCache.value.length > 0 && !forceRefresh) {
      return usersCache.value
    }

    try {
      const response = await apiFetch<PaginatedResponse<{
        id: string
        email: string
        last_name: string
        first_name: string
      }>>('/api/admin/users', {
        query: { limit: 100, active: true },
      })

      usersCache.value = response.items.map(u => ({
        id: u.id,
        email: u.email,
        last_name: u.last_name,
        first_name: u.first_name,
        full_name: `${u.first_name} ${u.last_name}`,
      }))

      return usersCache.value
    } catch (e) {
      console.error('Erreur chargement utilisateurs:', e)
      return []
    }
  }

  /**
   * Récupère la liste des projets institutionnels.
   */
  async function getProjects(forceRefresh = false): Promise<ProjectRef[]> {
    if (projectsCache.value.length > 0 && !forceRefresh) {
      return projectsCache.value
    }

    try {
      const response = await apiFetch<PaginatedResponse<{
        id: string
        title: string
        status: string
      }>>('/api/admin/projects', {
        query: { limit: 100 },
      })

      projectsCache.value = response.items.map(p => ({
        id: p.id,
        title: p.title,
        status: p.status,
      }))

      return projectsCache.value
    } catch (e) {
      console.error('Erreur chargement projets:', e)
      return []
    }
  }

  /**
   * Récupère la liste des événements.
   */
  async function getEvents(forceRefresh = false): Promise<EventRef[]> {
    if (eventsCache.value.length > 0 && !forceRefresh) {
      return eventsCache.value
    }

    try {
      const response = await apiFetch<PaginatedResponse<{
        id: string
        title: string
        start_date: string
      }>>('/api/admin/events', {
        query: { limit: 100 },
      })

      eventsCache.value = response.items.map(e => ({
        id: e.id,
        title: e.title,
        start_date: e.start_date,
      }))

      return eventsCache.value
    } catch (e) {
      console.error('Erreur chargement événements:', e)
      return []
    }
  }

  /**
   * Récupère les services filtrés par département.
   */
  function getServicesByDepartment(departmentId: string): ServiceRef[] {
    return servicesCache.value.filter(s => s.department_id === departmentId)
  }

  /**
   * Charge toutes les données de référence en parallèle.
   */
  async function loadAllReferenceData(): Promise<void> {
    await Promise.all([
      getCampuses(),
      getDepartments(),
      getServices(),
      getUsers(),
    ])
  }

  /**
   * Vide le cache pour forcer un rechargement.
   */
  function clearCache(): void {
    campusesCache.value = []
    departmentsCache.value = []
    servicesCache.value = []
    usersCache.value = []
    projectsCache.value = []
    eventsCache.value = []
  }

  return {
    // Getters
    getCampuses,
    getDepartments,
    getServices,
    getUsers,
    getProjects,
    getEvents,
    getServicesByDepartment,

    // Utilitaires
    loadAllReferenceData,
    clearCache,

    // Cache (pour accès direct si déjà chargé)
    campuses: campusesCache,
    departments: departmentsCache,
    services: servicesCache,
    users: usersCache,
    projects: projectsCache,
    events: eventsCache,
  }
}
