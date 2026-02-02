/**
 * Types pour les médias
 */

// ============================================================================
// Enums
// ============================================================================

export type MediaType = 'image' | 'video' | 'audio' | 'document'

// ============================================================================
// Media Read
// ============================================================================

export interface MediaRead {
  id: string
  name: string
  description: string | null
  type: MediaType
  url: string
  thumbnail_url: string | null
  size_bytes: number | null
  mime_type: string | null
  width: number | null
  height: number | null
  duration_seconds: number | null
  alt_text: string | null
  credits: string | null
  is_external_url: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// Media Upload / Update
// ============================================================================

export interface MediaUploadResponse {
  id: string
  url: string
  name: string
  type: MediaType
  size_bytes: number
  mime_type: string
  width: number | null
  height: number | null
}

export interface MediaUpdatePayload {
  name?: string
  description?: string | null
  alt_text?: string | null
  credits?: string | null
}

// ============================================================================
// Image Variants (multi-resolution)
// ============================================================================

export interface ImageDimensions {
  width: number
  height: number
}

export interface ImageVariants {
  low: Blob
  medium: Blob
  original: Blob
  dimensions: {
    low: ImageDimensions
    medium: ImageDimensions
    original: ImageDimensions
  }
}

export interface MediaUploadVariantsResponse {
  low: MediaUploadResponse
  medium: MediaUploadResponse
  original: MediaUploadResponse
}

// ============================================================================
// Albums
// ============================================================================

export type AlbumStatus = 'draft' | 'published' | 'archived'

export interface AlbumRead {
  id: string
  title: string
  description: string | null
  status: AlbumStatus
  created_at: string
  updated_at: string
}

export interface AlbumWithMedia extends AlbumRead {
  media_items: MediaRead[]
}
