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
  } = {}): Promise<PaginatedResponse<MediaRead>> {
    return apiFetch<PaginatedResponse<MediaRead>>('/api/admin/media', {
      query: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        type: params.type,
        search: params.search,
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
   */
  function getMediaUrl(mediaOrId: MediaRead | MediaUploadResponse | string | null): string | null {
    if (!mediaOrId) return null

    const config = useRuntimeConfig()
    const baseUrl = config.public.apiBase || 'http://localhost:8000'

    // Si c'est un ID (string UUID), utiliser l'endpoint public de download
    if (typeof mediaOrId === 'string') {
      // Vérifier que c'est un UUID valide (éviter les chemins relatifs)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidRegex.test(mediaOrId)) {
        return `${baseUrl}/api/public/media/${mediaOrId}/download`
      }
      return null
    }

    // Si c'est déjà une URL complète
    if (mediaOrId.url.startsWith('http://') || mediaOrId.url.startsWith('https://')) {
      return mediaOrId.url
    }

    // Sinon, construire l'URL avec le backend (accès direct au fichier statique)
    return `${baseUrl}${mediaOrId.url}`
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
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 o'
    const k = 1024
    const sizes = ['o', 'Ko', 'Mo', 'Go']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
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
  }
}
