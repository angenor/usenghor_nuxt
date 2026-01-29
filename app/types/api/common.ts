/**
 * Types communs et génériques pour l'API
 */

// ============================================================================
// Pagination
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

// ============================================================================
// Réponses génériques
// ============================================================================

export interface IdResponse {
  id: string
}

export interface MessageResponse {
  message: string
}

// ============================================================================
// Enums communs
// ============================================================================

export type PublicationStatus = 'draft' | 'published' | 'archived'
