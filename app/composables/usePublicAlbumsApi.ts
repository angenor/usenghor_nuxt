/**
 * Composable API - Albums Publics
 * ================================
 *
 * Récupère les albums publiés depuis l'API backend FastAPI.
 * Version publique (sans authentification).
 */

import type { AlbumWithMedia } from '~/types/api/media'

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

  return {
    getAlbumById,
  }
}
