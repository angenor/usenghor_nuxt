/**
 * Composable pour la gestion des médias (upload, CRUD)
 * Aligné sur le backend: app/routers/admin/media.py
 */

import type {
  MediaRead,
  MediaType,
  MediaUpdatePayload,
  MediaUploadResponse,
  MessageResponse,
  PaginatedResponse,
} from '~/types/api'

// Types pour les statistiques et utilisation
export interface MediaStatistics {
  total: number
  by_type: Record<string, number>
  total_size_bytes: number
}

export interface MediaUsageItem {
  type: string
  id: string
  title: string
}

export interface MediaUsage {
  is_used: boolean
  usage: MediaUsageItem[]
}

export function useMediaApi() {
  const { apiFetch } = useApi()

  /**
   * Upload un fichier
   */
  async function uploadMedia(
    file: File,
    options: {
      folder?: string
      alt_text?: string
      credits?: string
      description?: string
    } = {},
  ): Promise<MediaUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    if (options.folder) formData.append('folder', options.folder)
    if (options.alt_text) formData.append('alt_text', options.alt_text)
    if (options.credits) formData.append('credits', options.credits)
    if (options.description) formData.append('description', options.description)

    return apiFetch<MediaUploadResponse>('/api/admin/media/upload', {
      method: 'POST',
      body: formData,
    })
  }

  /**
   * Upload plusieurs fichiers
   */
  async function uploadMultipleMedia(
    files: File[],
    folder?: string,
  ): Promise<MediaUploadResponse[]> {
    const formData = new FormData()

    for (const file of files) {
      formData.append('files', file)
    }

    if (folder) formData.append('folder', folder)

    return apiFetch<MediaUploadResponse[]>('/api/admin/media/upload-multiple', {
      method: 'POST',
      body: formData,
    })
  }

  /**
   * Récupère un média par son ID
   */
  async function getMediaById(id: string): Promise<MediaRead> {
    return apiFetch<MediaRead>(`/api/admin/media/${id}`)
  }

  /**
   * Liste les médias avec pagination et filtres
   */
  async function listMedia(params: {
    page?: number
    limit?: number
    type?: MediaType | null
    search?: string | null
    date_from?: string | null
    date_to?: string | null
    sort_by?: 'created_at' | 'name' | 'size_bytes'
    sort_order?: 'asc' | 'desc'
  } = {}): Promise<PaginatedResponse<MediaRead>> {
    return apiFetch<PaginatedResponse<MediaRead>>('/api/admin/media', {
      query: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        type: params.type,
        search: params.search,
        date_from: params.date_from,
        date_to: params.date_to,
        sort_by: params.sort_by ?? 'created_at',
        sort_order: params.sort_order ?? 'desc',
      },
    })
  }

  /**
   * Met à jour les métadonnées d'un média
   */
  async function updateMedia(id: string, data: MediaUpdatePayload): Promise<MediaRead> {
    return apiFetch<MediaRead>(`/api/admin/media/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un média
   */
  async function deleteMedia(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/media/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Construit l'URL complète d'un média
   * Accepte soit un objet MediaRead/MediaUploadResponse, soit un ID string
   * Note: Utilise des URLs relatives pour que nginx puisse les proxier
   */
  function getMediaUrl(mediaOrId: MediaRead | MediaUploadResponse | string | null): string | null {
    if (!mediaOrId) return null

    // Si c'est un ID (string UUID), utiliser l'endpoint public de download
    if (typeof mediaOrId === 'string') {
      // Vérifier que c'est un UUID valide (éviter les chemins relatifs)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidRegex.test(mediaOrId)) {
        return `/api/public/media/${mediaOrId}/download`
      }
      return null
    }

    // Si c'est déjà une URL complète
    if (mediaOrId.url.startsWith('http://') || mediaOrId.url.startsWith('https://')) {
      return mediaOrId.url
    }

    // Sinon, retourner l'URL relative (nginx proxiera vers le backend)
    return mediaOrId.url
  }

  /**
   * Récupère l'URL d'un média depuis son ID (async)
   */
  async function getMediaUrlById(id: string | null): Promise<string | null> {
    if (!id) return null

    try {
      const media = await getMediaById(id)
      return getMediaUrl(media)
    } catch {
      return null
    }
  }

  /**
   * Valide un fichier avant upload
   */
  function validateFile(
    file: File,
    options: {
      maxSizeMB?: number
      allowedTypes?: string[]
    } = {},
  ): { valid: boolean; error?: string } {
    const maxSize = (options.maxSizeMB ?? 10) * 1024 * 1024

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Le fichier dépasse la taille maximale de ${options.maxSizeMB ?? 10} Mo`,
      }
    }

    if (options.allowedTypes && options.allowedTypes.length > 0) {
      const isAllowed = options.allowedTypes.some((type) => {
        if (type.endsWith('/*')) {
          // Type générique comme "image/*"
          const category = type.replace('/*', '')
          return file.type.startsWith(category)
        }
        return file.type === type
      })

      if (!isAllowed) {
        return {
          valid: false,
          error: `Type de fichier non autorisé. Types acceptés : ${options.allowedTypes.join(', ')}`,
        }
      }
    }

    return { valid: true }
  }

  /**
   * Détermine le type de média depuis le MIME type
   */
  function getMediaTypeFromMime(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    return 'document'
  }

  /**
   * Formate la taille d'un fichier en texte lisible
   */
  function formatFileSize(bytes: number | null | undefined): string {
    if (!bytes || bytes === 0) return '0 o'
    const k = 1024
    const sizes = ['o', 'Ko', 'Mo', 'Go']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  /**
   * Formate une durée en secondes en HH:MM:SS ou MM:SS
   */
  function formatDuration(seconds: number | null | undefined): string {
    if (!seconds || seconds === 0) return '0:00'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  /**
   * Récupère les statistiques des médias
   */
  async function getMediaStatistics(): Promise<MediaStatistics> {
    return apiFetch<MediaStatistics>('/api/admin/media/statistics')
  }

  /**
   * Vérifie où un média est utilisé
   */
  async function getMediaUsage(mediaId: string): Promise<MediaUsage> {
    return apiFetch<MediaUsage>(`/api/admin/media/${mediaId}/usage`)
  }

  /**
   * Supprime plusieurs médias en une fois
   */
  async function bulkDeleteMedia(mediaIds: string[]): Promise<MessageResponse> {
    return apiFetch<MessageResponse>('/api/admin/media/bulk-delete', {
      method: 'POST',
      body: { media_ids: mediaIds },
    })
  }

  /**
   * Télécharge plusieurs médias dans un fichier ZIP
   */
  async function downloadMediaZip(mediaIds: string[]): Promise<Blob> {
    const authStore = useAuthStore()

    const response = await fetch(`/api/admin/media/download-zip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`,
      },
      body: JSON.stringify({ ids: mediaIds }),
    })

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement')
    }
    return response.blob()
  }

  /**
   * Retourne l'URL de téléchargement direct d'un média
   */
  function getDownloadUrl(mediaId: string): string {
    return `/api/admin/media/${mediaId}/download`
  }

  return {
    uploadMedia,
    uploadMultipleMedia,
    getMediaById,
    listMedia,
    updateMedia,
    deleteMedia,
    getMediaUrl,
    getMediaUrlById,
    validateFile,
    getMediaTypeFromMime,
    formatFileSize,
    formatDuration,
    getMediaStatistics,
    getMediaUsage,
    bulkDeleteMedia,
    downloadMediaZip,
    getDownloadUrl,
  }
}
