/**
 * Composable pour la gestion des albums
 * Aligné sur le backend: app/routers/admin/albums.py
 */

import type { MediaRead, MessageResponse, PaginatedResponse, PublicationStatus } from '~/types/api'

// === TYPES ===

export interface AlbumRead {
  id: string
  title: string
  description: string | null
  status: PublicationStatus
  created_at: string
  updated_at: string
}

export interface AlbumWithMedia extends AlbumRead {
  media_items: MediaRead[]
}

export interface AlbumCreatePayload {
  title: string
  description?: string | null
  status?: PublicationStatus
}

export interface AlbumUpdatePayload {
  title?: string
  description?: string | null
  status?: PublicationStatus
}

// === COMPOSABLE ===

export function useAlbumsApi() {
  const { apiFetch } = useApi()

  /**
   * Liste les albums avec pagination et filtres
   */
  async function listAlbums(params: {
    page?: number
    limit?: number
    search?: string | null
    status?: PublicationStatus | null
  } = {}): Promise<PaginatedResponse<AlbumRead>> {
    return apiFetch<PaginatedResponse<AlbumRead>>('/api/admin/albums', {
      query: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        search: params.search,
        status: params.status,
      },
    })
  }

  /**
   * Récupère un album par son ID (avec ses médias)
   */
  async function getAlbumById(id: string): Promise<AlbumWithMedia> {
    return apiFetch<AlbumWithMedia>(`/api/admin/albums/${id}`)
  }

  /**
   * Crée un nouvel album
   */
  async function createAlbum(data: AlbumCreatePayload): Promise<{ id: string; message: string }> {
    return apiFetch<{ id: string; message: string }>('/api/admin/albums', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un album
   */
  async function updateAlbum(id: string, data: AlbumUpdatePayload): Promise<AlbumRead> {
    return apiFetch<AlbumRead>(`/api/admin/albums/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un album
   */
  async function deleteAlbum(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/albums/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Ajoute des médias à un album
   */
  async function addMediaToAlbum(albumId: string, mediaIds: string[]): Promise<AlbumWithMedia> {
    return apiFetch<AlbumWithMedia>(`/api/admin/albums/${albumId}/media`, {
      method: 'POST',
      body: { media_ids: mediaIds },
    })
  }

  /**
   * Retire un média d'un album
   */
  async function removeMediaFromAlbum(albumId: string, mediaId: string): Promise<AlbumWithMedia> {
    return apiFetch<AlbumWithMedia>(`/api/admin/albums/${albumId}/media/${mediaId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Réordonne les médias d'un album
   */
  async function reorderAlbumMedia(albumId: string, mediaOrder: string[]): Promise<AlbumWithMedia> {
    return apiFetch<AlbumWithMedia>(`/api/admin/albums/${albumId}/media/reorder`, {
      method: 'PUT',
      body: { media_order: mediaOrder },
    })
  }

  return {
    listAlbums,
    getAlbumById,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    addMediaToAlbum,
    removeMediaFromAlbum,
    reorderAlbumMedia,
  }
}
