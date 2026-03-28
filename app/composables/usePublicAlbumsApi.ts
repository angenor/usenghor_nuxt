/**
 * Composable API - Albums Publics
 * ================================
 *
 * Récupère les albums publiés depuis l'API backend FastAPI.
 * Version publique (sans authentification).
 */

import type { AlbumWithMedia, PublicAlbumListResponse } from '~/types/api/media'

interface ListPublicAlbumsParams {
  page?: number
  limit?: number
  search?: string
  media_type?: string
}

export function usePublicAlbumsApi() {
  const baseURL = useApiBase()

  /**
   * Récupère un album publié par son ID avec ses médias.
   */
  async function getAlbumById(albumId: string): Promise<AlbumWithMedia | null> {
    try {
      return await $fetch<AlbumWithMedia>(`${baseURL}/api/public/albums/${albumId}`)
    }
    catch (error) {
      console.error('Erreur lors de la récupération de l\'album:', error)
      return null
    }
  }

  /**
   * Liste les albums publiés pour la médiathèque publique.
   */
  async function listPublicAlbums(params: ListPublicAlbumsParams = {}): Promise<PublicAlbumListResponse | null> {
    try {
      const query = new URLSearchParams()
      if (params.page) query.set('page', String(params.page))
      if (params.limit) query.set('limit', String(params.limit))
      if (params.search) query.set('search', params.search)
      if (params.media_type) query.set('media_type', params.media_type)
      const qs = query.toString()
      return await $fetch<PublicAlbumListResponse>(`${baseURL}/api/public/albums${qs ? `?${qs}` : ''}`)
    }
    catch (error) {
      console.error('Erreur lors de la récupération des albums:', error)
      return null
    }
  }

  /**
   * Récupère un album publié par son slug avec ses médias.
   */
  async function getAlbumBySlug(slug: string): Promise<AlbumWithMedia | null> {
    try {
      return await $fetch<AlbumWithMedia>(`${baseURL}/api/public/albums/by-slug/${slug}`)
    }
    catch (error) {
      console.error('Erreur lors de la récupération de l\'album:', error)
      return null
    }
  }

  return {
    getAlbumById,
    listPublicAlbums,
    getAlbumBySlug,
  }
}
