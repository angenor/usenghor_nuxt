/**
 * Composable API - Secteurs Admin
 * ====================================
 *
 * Gestion des secteurs via l'API backend FastAPI.
 * Fallback sur les données mock si l'API n'est pas disponible.
 */

import type {
  SectorCreate,
  SectorRead,
  SectorReorder,
  SectorUpdate,
  SectorWithServices,
  IdResponse,
  MessageResponse,
  PaginatedResponse,
  ServiceRead,
} from '~/types/api'

// Import mock data pour fallback en développement
import {
  mockSectorsAdmin,
  getAllSectorsAdmin as getMockAllSectors,
  getSectorByIdAdmin as getMockSectorById,
  getSectorStats as getMockSectorStats,
  checkSectorUsage as getMockSectorUsage,
  getSectorsForSelect as getMockSectorsForSelect,
  getFilteredSectorsAdmin as getMockFilteredSectors,
  type SectorAdmin,
} from '@bank/mock-data/sectors-admin'

// ============================================================================
// Types Display (enrichis pour le frontend)
// ============================================================================

export interface SectorDisplay extends SectorRead {
  services_count: number
  // Infos du responsable résolues (optionnelles)
  head?: {
    id: string
    name: string
    title?: string | null
    photo?: string | null
  } | null
}

export interface SectorStats {
  total: number
  active: number
  totalServices: number
  withHead: number
}

export interface SectorFilters {
  search?: string
  active?: boolean
}

export interface SectorUsage {
  services_count: number
  programs_count: number
  projects_count: number
  can_delete: boolean
}

// ============================================================================
// Icônes disponibles pour les secteurs
// ============================================================================

export const sectorIcons = [
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
  { value: 'building', label: 'Secteur (bâtiment)' },
  { value: 'sitemap', label: 'Organisation (organigramme)' },
  { value: 'users', label: 'Équipe (utilisateurs)' },
  { value: 'cogs', label: 'Services (engrenages)' },
  { value: 'book', label: 'Ressources (livre)' },
]

// ============================================================================
// Composable
// ============================================================================

export function useSectorsApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // Transformations
  // =========================================================================

  /**
   * Transforme SectorRead (backend) vers SectorDisplay (frontend).
   */
  function transformToDisplay(sector: SectorRead, servicesCount: number = 0): SectorDisplay {
    return {
      ...sector,
      services_count: servicesCount,
      head: null, // Sera enrichi si besoin via un autre appel
    }
  }

  /**
   * Transforme SectorWithServices vers SectorDisplay.
   */
  function transformWithServicesToDisplay(sector: SectorWithServices): SectorDisplay {
    return {
      ...sector,
      services_count: sector.services?.length || 0,
      head: null,
    }
  }

  // =========================================================================
  // CRUD Sectors
  // =========================================================================

  /**
   * Transforme un SectorAdmin (mock) vers SectorDisplay.
   */
  function transformMockToDisplay(sector: SectorAdmin): SectorDisplay {
    return {
      id: sector.id,
      code: sector.code,
      name: sector.name,
      description: sector.description || null,
      mission: sector.mission || null,
      icon_external_id: null,
      cover_image_external_id: null,
      head_external_id: sector.head_id || null,
      display_order: sector.display_order,
      active: sector.active,
      created_at: sector.created_at,
      updated_at: sector.updated_at,
      services_count: sector.services_count,
      head: sector.head
        ? {
            id: sector.head.id,
            name: sector.head.name,
            title: sector.head.title || null,
            photo: sector.head.photo || null,
          }
        : null,
    }
  }

  /**
   * Liste les secteurs avec pagination et filtres.
   */
  async function listSectors(params: SectorFilters & {
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<SectorDisplay>> {
    try {
      const response = await apiFetch<PaginatedResponse<SectorRead>>('/api/admin/sectors', {
        query: {
          page: params.page || 1,
          limit: params.limit || 100,
          search: params.search,
          active: params.active,
        },
      })

      return {
        ...response,
        items: response.items.map(s => transformToDisplay(s, 0)),
      }
    }
    catch {
      // Fallback sur mock data
      console.warn('[useSectorsApi] API unavailable, using mock data')
      const mockSectors = getMockFilteredSectors({
        search: params.search,
        active: params.active,
      })
      return {
        items: mockSectors.map(transformMockToDisplay),
        total: mockSectors.length,
        page: params.page || 1,
        limit: params.limit || 100,
        pages: 1,
      }
    }
  }

  /**
   * Récupère tous les secteurs avec leur nombre de services.
   */
  async function getAllSectors(): Promise<SectorDisplay[]> {
    try {
      const response = await listSectors({ limit: 100 })

      // Pour chaque secteur, récupérer le nombre de services
      const sectorsWithServices = await Promise.all(
        response.items.map(async (sector) => {
          try {
            const services = await getSectorServices(sector.id)
            return {
              ...sector,
              services_count: services.length,
            }
          }
          catch {
            return sector
          }
        }),
      )

      return sectorsWithServices
    }
    catch {
      // Fallback sur mock data
      console.warn('[useSectorsApi] API unavailable, using mock data')
      return getMockAllSectors().map(transformMockToDisplay)
    }
  }

  /**
   * Récupère un secteur par son ID avec ses services.
   */
  async function getSectorById(id: string): Promise<SectorDisplay> {
    try {
      const sector = await apiFetch<SectorWithServices>(`/api/admin/sectors/${id}`)
      return transformWithServicesToDisplay(sector)
    }
    catch {
      // Fallback sur mock data
      const mockSector = getMockSectorById(id)
      if (!mockSector) {
        throw new Error(`Sector with id ${id} not found`)
      }
      return transformMockToDisplay(mockSector)
    }
  }

  /**
   * Crée un nouveau secteur.
   */
  async function createSector(data: SectorCreate): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/sectors', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un secteur.
   */
  async function updateSector(id: string, data: SectorUpdate): Promise<SectorRead> {
    return apiFetch<SectorRead>(`/api/admin/sectors/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un secteur.
   */
  async function deleteSector(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/sectors/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Bascule le statut actif d'un secteur.
   */
  async function toggleSectorActive(id: string): Promise<SectorRead> {
    return apiFetch<SectorRead>(`/api/admin/sectors/${id}/toggle-active`, {
      method: 'POST',
    })
  }

  /**
   * Réordonne les secteurs.
   */
  async function reorderSectors(sectorIds: string[]): Promise<SectorRead[]> {
    return apiFetch<SectorRead[]>('/api/admin/sectors/reorder', {
      method: 'PUT',
      body: { sector_ids: sectorIds } as SectorReorder,
    })
  }

  // =========================================================================
  // Services
  // =========================================================================

  /**
   * Récupère les services d'un secteur.
   */
  async function getSectorServices(sectorId: string): Promise<ServiceRead[]> {
    return apiFetch<ServiceRead[]>(`/api/admin/sectors/${sectorId}/services`)
  }

  // =========================================================================
  // Statistics
  // =========================================================================

  /**
   * Calcule les statistiques des secteurs.
   */
  async function getSectorsStats(): Promise<SectorStats> {
    try {
      const sectors = await getAllSectors()
      return {
        total: sectors.length,
        active: sectors.filter(s => s.active).length,
        totalServices: sectors.reduce((sum, s) => sum + s.services_count, 0),
        withHead: sectors.filter(s => s.head_external_id).length,
      }
    }
    catch {
      // Fallback sur mock data
      const mockStats = getMockSectorStats()
      return {
        total: mockStats.total,
        active: mockStats.active,
        totalServices: mockStats.totalServices,
        withHead: mockStats.withHead,
      }
    }
  }

  /**
   * Vérifie si un secteur peut être supprimé.
   */
  async function getSectorUsage(id: string): Promise<SectorUsage> {
    try {
      const sector = await getSectorById(id)
      const servicesCount = sector.services_count

      return {
        services_count: servicesCount,
        programs_count: 0, // TODO: implémenter si nécessaire
        projects_count: 0, // TODO: implémenter si nécessaire
        can_delete: servicesCount === 0,
      }
    }
    catch {
      // Fallback sur mock data
      const mockUsage = getMockSectorUsage(id)
      return {
        services_count: mockUsage.services_count,
        programs_count: mockUsage.programs_count || 0,
        projects_count: mockUsage.projects_count || 0,
        can_delete: mockUsage.can_delete,
      }
    }
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Génère un code unique pour un secteur basé sur son nom.
   */
  function generateSectorCode(name: string): string {
    const prefix = 'SEC'
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
  function generateSectorId(): string {
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
   * Récupère les secteurs pour un select (formulaires).
   */
  async function getSectorsForSelect(): Promise<Array<{ id: string, name: string, code: string }>> {
    try {
      const sectors = await getAllSectors()
      return sectors
        .filter(s => s.active)
        .map(s => ({
          id: s.id,
          name: s.name,
          code: s.code,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    }
    catch {
      // Fallback sur mock data
      return getMockSectorsForSelect()
    }
  }

  return {
    // CRUD Sectors
    listSectors,
    getAllSectors,
    getSectorById,
    createSector,
    updateSector,
    deleteSector,
    toggleSectorActive,
    reorderSectors,

    // Services
    getSectorServices,
    getSectorsForSelect,

    // Statistics
    getSectorsStats,
    getSectorUsage,

    // Transformations
    transformToDisplay,
    transformWithServicesToDisplay,

    // Helpers
    generateSectorCode,
    generateSectorId,
    formatDate,

    // Icônes disponibles
    sectorIcons,
  }
}
