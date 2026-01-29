/**
 * Types pour les réseaux sociaux
 */

// ============================================================================
// Enums
// ============================================================================

export type SocialMediaPlatform =
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'whatsapp'
  | 'telegram'
  | 'other'

// ============================================================================
// Social Media Data
// ============================================================================

// Données JSON stockées dans editorial_contents.value
export interface SocialMediaData {
  platform: SocialMediaPlatform
  url: string
  active: boolean
  display_order: number
  custom_label?: string
}

// Structure complète d'un réseau social (avec métadonnées)
export interface SocialMediaLink extends SocialMediaData {
  id: string
  created_at: string
  updated_at: string
}

// ============================================================================
// Create / Update
// ============================================================================

export interface SocialMediaCreatePayload {
  platform: SocialMediaPlatform
  url: string
  active?: boolean
  display_order?: number
  custom_label?: string
}

export interface SocialMediaUpdatePayload {
  platform?: SocialMediaPlatform
  url?: string
  active?: boolean
  display_order?: number
  custom_label?: string
}

// ============================================================================
// Statistics
// ============================================================================

export interface SocialMediaStats {
  total_count: number
  active_count: number
  inactive_count: number
  platforms_used: SocialMediaPlatform[]
  last_updated: string | null
}
