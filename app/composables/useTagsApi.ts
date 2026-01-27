/**
 * Composable pour la gestion des tags/étiquettes
 * Aligné sur le backend: app/routers/admin/tags.py
 */

import type {
  IdResponse,
  MessageResponse,
  PaginatedResponse,
  TagCreate,
  TagMerge,
  TagRead,
  TagUpdate,
  TagUsage,
} from '~/types/api'

export function useTagsApi() {
  const { apiFetch } = useApi()

  /**
   * Liste les tags avec pagination et recherche
   */
  async function listTags(params: {
    page?: number
    limit?: number
    search?: string | null
  } = {}): Promise<PaginatedResponse<TagRead>> {
    return apiFetch<PaginatedResponse<TagRead>>('/api/admin/tags', {
      query: {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        search: params.search,
      },
    })
  }

  /**
   * Récupère un tag par son ID
   */
  async function getTagById(id: string): Promise<TagRead> {
    return apiFetch<TagRead>(`/api/admin/tags/${id}`)
  }

  /**
   * Crée un nouveau tag
   */
  async function createTag(data: TagCreate): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/tags', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un tag
   */
  async function updateTag(id: string, data: TagUpdate): Promise<TagRead> {
    return apiFetch<TagRead>(`/api/admin/tags/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un tag
   */
  async function deleteTag(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/tags/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Fusionne plusieurs tags vers un tag cible
   */
  async function mergeTags(data: TagMerge): Promise<TagRead> {
    return apiFetch<TagRead>('/api/admin/tags/merge', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Récupère les statistiques d'utilisation d'un tag
   */
  async function getTagUsage(id: string): Promise<TagUsage> {
    return apiFetch<TagUsage>(`/api/admin/tags/${id}/usage`)
  }

  /**
   * Génère un slug depuis un nom
   */
  function slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9\s-]/g, '') // Supprime les caractères spéciaux
      .replace(/\s+/g, '-') // Remplace les espaces par des tirets
      .replace(/-+/g, '-') // Évite les tirets multiples
      .replace(/^-|-$/g, '') // Supprime les tirets en début/fin
  }

  /**
   * Liste d'icônes disponibles pour les tags
   */
  const availableIcons = [
    { value: 'graduation-cap', label: 'Académique' },
    { value: 'flask', label: 'Recherche' },
    { value: 'handshake', label: 'Partenariat' },
    { value: 'calendar', label: 'Événement' },
    { value: 'globe-africa', label: 'International' },
    { value: 'building-columns', label: 'Institutionnel' },
    { value: 'users', label: 'Communauté' },
    { value: 'book', label: 'Publication' },
    { value: 'trophy', label: 'Distinction' },
    { value: 'briefcase', label: 'Emploi' },
    { value: 'heart', label: 'Social' },
    { value: 'leaf', label: 'Environnement' },
  ]

  /**
   * Couleurs prédéfinies pour les tags (basées sur le slug)
   */
  const tagColors: Record<string, string> = {
    'recherche': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'partenariat': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'evenement': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'academique': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'international': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    'communaute': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    'publication': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  }

  /**
   * Obtient la couleur d'un tag basée sur son slug
   */
  function getTagColor(slug: string): string {
    return tagColors[slug] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }

  return {
    listTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
    mergeTags,
    getTagUsage,
    slugify,
    availableIcons,
    tagColors,
    getTagColor,
  }
}
