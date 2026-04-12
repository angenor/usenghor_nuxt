/**
 * Composable API - Médias Publics (hors album)
 * ==============================================
 *
 * Récupère les fichiers téléversés directement dans la médiathèque (sans album)
 * depuis l'API backend FastAPI. Version publique (sans authentification).
 */

import type { PublicDirectMediaListResponse } from '~/types/api/media'

interface ListPublicDirectMediaParams {
  page?: number
  limit?: number
  search?: string
  media_type?: string
}

export function usePublicMediaApi() {
  const baseURL = useApiBase()

  /**
   * Liste les fichiers publics téléversés directement (hors album).
   */
  async function listPublicDirectMedia(
    params: ListPublicDirectMediaParams = {},
  ): Promise<PublicDirectMediaListResponse | null> {
    try {
      const query = new URLSearchParams()
      if (params.page) query.set('page', String(params.page))
      if (params.limit) query.set('limit', String(params.limit))
      if (params.search) query.set('search', params.search)
      if (params.media_type) query.set('media_type', params.media_type)
      const qs = query.toString()
      return await $fetch<PublicDirectMediaListResponse>(
        `${baseURL}/api/public/media${qs ? `?${qs}` : ''}`,
      )
    }
    catch (error) {
      console.error('Erreur lors de la récupération des fichiers publics:', error)
      return null
    }
  }

  return {
    listPublicDirectMedia,
  }
}
