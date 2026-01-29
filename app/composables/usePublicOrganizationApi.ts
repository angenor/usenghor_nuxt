// ============================================================================
// Types pour l'API publique de l'organisation
// ============================================================================

export interface ServiceObjectivePublic {
  id: string
  service_id: string
  title: string
  description: string | null
  display_order: number
}

export interface ServiceAchievementPublic {
  id: string
  service_id: string
  title: string
  description: string | null
  type: string | null
  cover_image_external_id: string | null
  achievement_date: string | null
  created_at: string
}

export interface ServiceProjectPublic {
  id: string
  service_id: string
  title: string
  description: string | null
  cover_image_external_id: string | null
  progress: number
  status: 'ongoing' | 'completed' | 'suspended' | 'planned'
  start_date: string | null
  expected_end_date: string | null
  created_at: string
  updated_at: string
}

export interface SectorPublic {
  id: string
  code: string
  name: string
  description: string | null
  mission: string | null
  icon_external_id: string | null
  cover_image_external_id: string | null
  display_order: number
}

export interface ServicePublic {
  id: string
  name: string
  description: string | null
  mission: string | null
  email: string | null
  phone: string | null
  sector_id: string | null
  head_external_id: string | null
  album_external_id: string | null
  display_order: number
}

export interface ServicePublicWithDetails extends ServicePublic {
  objectives: ServiceObjectivePublic[]
  achievements: ServiceAchievementPublic[]
  projects: ServiceProjectPublic[]
}

export interface SectorPublicWithServices extends SectorPublic {
  services: ServicePublic[]
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Génère un slug URL-friendly depuis un nom
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplace les caractères non alphanumériques par des tirets
    .replace(/^-|-$/g, '') // Supprime les tirets en début et fin
}

// ============================================================================
// Composable
// ============================================================================

export function usePublicOrganizationApi() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase || 'http://localhost:8000'

  /**
   * Fetch helper pour les endpoints publics (sans authentification)
   */
  async function publicFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await $fetch<T>(`${baseUrl}${endpoint}`, {
      ...options,
    })
    return response
  }

  // ==========================================================================
  // SECTORS
  // ==========================================================================

  /**
   * Liste les secteurs actifs
   */
  async function listSectors(): Promise<SectorPublic[]> {
    return publicFetch<SectorPublic[]>('/api/public/sectors')
  }

  /**
   * Liste les secteurs actifs avec leurs services actifs
   */
  async function listSectorsWithServices(): Promise<SectorPublicWithServices[]> {
    return publicFetch<SectorPublicWithServices[]>('/api/public/sectors/with-services')
  }

  /**
   * Récupère un secteur par son code avec ses services
   */
  async function getSectorByCode(code: string): Promise<SectorPublicWithServices> {
    return publicFetch<SectorPublicWithServices>(`/api/public/sectors/${code}`)
  }

  // ==========================================================================
  // SERVICES
  // ==========================================================================

  /**
   * Liste les services actifs, optionnellement filtrés par secteur
   */
  async function listServices(sectorId?: string): Promise<ServicePublic[]> {
    const query = sectorId ? `?sector_id=${sectorId}` : ''
    return publicFetch<ServicePublic[]>(`/api/public/services${query}`)
  }

  /**
   * Récupère un service par son ID avec ses détails
   */
  async function getServiceById(serviceId: string): Promise<ServicePublicWithDetails> {
    return publicFetch<ServicePublicWithDetails>(`/api/public/services/${serviceId}`)
  }

  /**
   * Recherche un service par slug généré depuis le nom
   * Retourne null si non trouvé
   */
  async function findServiceBySlug(slug: string): Promise<ServicePublicWithDetails | null> {
    try {
      // Récupérer tous les services
      const services = await listServices()

      // Chercher le service dont le slug correspond
      const matchingService = services.find(s => slugify(s.name) === slug)

      if (!matchingService) {
        return null
      }

      // Récupérer les détails complets
      return await getServiceById(matchingService.id)
    }
    catch {
      return null
    }
  }

  /**
   * Génère l'URL d'un service
   */
  function getServiceUrl(service: ServicePublic): string {
    return `/a-propos/organisation/service/${slugify(service.name)}`
  }

  /**
   * Génère l'URL d'un secteur
   */
  function getSectorUrl(sector: SectorPublic): string {
    return `/a-propos/organisation/secteur/${sector.code.toLowerCase()}`
  }

  /**
   * Retourne l'URL de l'image de couverture ou un placeholder
   */
  function getCoverImageUrl(externalId: string | null, seed?: string): string {
    if (externalId) {
      return `/api/media/${externalId}`
    }
    return `https://picsum.photos/seed/${seed || 'default'}/800/400`
  }

  /**
   * Retourne l'URL de l'icône ou un placeholder
   */
  function getIconUrl(externalId: string | null): string | null {
    if (externalId) {
      return `/api/media/${externalId}`
    }
    return null
  }

  return {
    // API calls - Sectors
    listSectors,
    listSectorsWithServices,
    getSectorByCode,

    // API calls - Services
    listServices,
    getServiceById,
    findServiceBySlug,

    // Helpers
    slugify,
    getServiceUrl,
    getSectorUrl,
    getCoverImageUrl,
    getIconUrl,
  }
}
