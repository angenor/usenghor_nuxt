/**
 * Types API pour les Actualités
 * Alignés sur les schemas Pydantic du backend (app/schemas/content.py)
 */

import type { PaginatedResponse, PublicationStatus } from './api'

// ============================================================================
// Enums News
// ============================================================================

export type NewsStatus = PublicationStatus
export type NewsHighlightStatus = 'standard' | 'featured' | 'headline'

// ============================================================================
// EditorJS Types
// ============================================================================

export interface EditorJSBlock {
  id?: string
  type: string
  data: Record<string, unknown>
}

export interface EditorJSContent {
  time?: number
  blocks: EditorJSBlock[]
  version?: string
}

/**
 * Contenu multilingue stocké en JSON dans le champ `content`
 */
export interface MultilingualContent {
  fr?: EditorJSContent | null
  en?: EditorJSContent | null
  ar?: EditorJSContent | null
}

// ============================================================================
// Tags
// ============================================================================

export interface TagRead {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  created_at: string
}

export interface TagCreatePayload {
  name: string
  slug: string
  icon?: string | null
  description?: string | null
}

export interface TagUpdatePayload {
  name?: string
  slug?: string
  icon?: string | null
  description?: string | null
}

// ============================================================================
// News Read (format backend)
// ============================================================================

export interface NewsRead {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string | null // JSON stringifié contenant MultilingualContent
  video_url: string | null
  cover_image_external_id: string | null
  sector_external_id: string | null
  event_external_id: string | null
  project_external_id: string | null
  call_external_id: string | null
  program_external_id: string | null
  author_external_id: string | null
  campus_external_ids: string[]
  service_external_ids: string[]
  highlight_status: NewsHighlightStatus
  status: NewsStatus
  published_at: string | null
  visible_from: string | null
  created_at: string
  updated_at: string
}

export interface NewsWithTags extends NewsRead {
  tags: TagRead[]
}

/**
 * Format enrichi du backend avec les noms des entités associées résolus
 * Correspond au schéma Pydantic NewsPublicEnriched
 */
export interface NewsPublicEnriched extends NewsWithTags {
  campus_names: string[]
  sector_name: string | null
  service_names: string[]
  project_name: string | null
  call_name: string | null
  program_name: string | null
  event_name: string | null
  author_name: string | null
}

// ============================================================================
// News Display (format frontend enrichi)
// ============================================================================

/**
 * Format enrichi pour l'affichage dans les pages admin
 * Le contenu multilingue est déjà parsé depuis le JSON
 */
export interface NewsDisplay {
  id: string
  slug: string
  title: string
  summary: string | null
  // Contenu EditorJS parsé
  content: EditorJSContent | null
  content_en: EditorJSContent | null
  content_ar: EditorJSContent | null
  // Médias
  video_url: string | null
  cover_image: string | null // URL résolue ou placeholder
  cover_image_alt: string | null
  cover_image_external_id: string | null
  // Auteur (résolu si possible)
  author: NewsAuthor | null
  author_external_id: string | null
  // Tags
  tags: NewsTag[]
  // Médias additionnels
  media: NewsMedia[]
  // Associations (IDs)
  campus_ids: string[]
  campus_names: string[]
  sector_id: string | null
  sector_name: string | null
  service_ids: string[]
  service_names: string[]
  event_id: string | null
  event_name: string | null
  project_id: string | null
  project_name: string | null
  call_id: string | null
  call_name: string | null
  program_id: string | null
  program_name: string | null
  // Statuts
  status: NewsStatus
  highlight_status: NewsHighlightStatus
  // Dates
  created_at: string
  updated_at: string
  published_at: string | null
  visible_from: string | null
}

// ============================================================================
// Sub-entities pour l'affichage
// ============================================================================

export interface NewsTag {
  id: string
  name: string
  slug: string
  color?: string
}

export interface NewsMedia {
  id: string
  url: string
  alt?: string
  caption?: string
  order: number
}

export interface NewsAuthor {
  id: string
  name: string
  avatar?: string
  role?: string
}

// ============================================================================
// News Create / Update
// ============================================================================

export interface NewsCreatePayload {
  title: string
  slug: string
  summary?: string | null
  content?: string | null // JSON stringifié
  video_url?: string | null
  highlight_status?: NewsHighlightStatus
  cover_image_external_id?: string | null
  sector_external_id?: string | null
  event_external_id?: string | null
  project_external_id?: string | null
  call_external_id?: string | null
  program_external_id?: string | null
  author_external_id?: string | null
  status?: NewsStatus
  published_at?: string | null
  visible_from?: string | null
  tag_ids?: string[]
  campus_external_ids?: string[]
  service_external_ids?: string[]
}

export interface NewsUpdatePayload {
  title?: string
  slug?: string
  summary?: string | null
  content?: string | null
  video_url?: string | null
  highlight_status?: NewsHighlightStatus
  cover_image_external_id?: string | null
  sector_external_id?: string | null
  event_external_id?: string | null
  project_external_id?: string | null
  call_external_id?: string | null
  program_external_id?: string | null
  author_external_id?: string | null
  status?: NewsStatus
  published_at?: string | null
  visible_from?: string | null
  tag_ids?: string[]
  campus_external_ids?: string[]
  service_external_ids?: string[]
}

export interface NewsPublishPayload {
  published_at?: string | null
}

export interface NewsDuplicatePayload {
  new_slug: string
}

// ============================================================================
// Statistics
// ============================================================================

export interface NewsTimelineDataPoint {
  period: string
  count: number
}

export interface NewsStats {
  total: number
  published: number
  draft: number
  archived: number
  headline: number
  featured: number
  timeline?: NewsTimelineDataPoint[]
}

// ============================================================================
// Filters
// ============================================================================

export interface NewsFilters {
  search?: string
  status?: NewsStatus | 'all'
  highlight_status?: NewsHighlightStatus | 'all'
  tag_id?: string
  author_id?: string
  campus_id?: string
  sector_id?: string
  service_id?: string
  project_id?: string
  event_id?: string
  call_id?: string
  program_id?: string
  from_date?: string
  to_date?: string
}

// ============================================================================
// Labels et Couleurs pour l'UI
// ============================================================================

export const newsStatusLabels: Record<NewsStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé'
}

export const newsStatusColors: Record<NewsStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

export const highlightStatusLabels: Record<NewsHighlightStatus, string> = {
  standard: 'Standard',
  featured: 'Mise en avant',
  headline: 'À la une'
}

export const highlightStatusColors: Record<NewsHighlightStatus, string> = {
  standard: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  featured: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  headline: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
}

// ============================================================================
// Type exports for pagination
// ============================================================================

export type PaginatedNewsResponse = PaginatedResponse<NewsWithTags>
export type PaginatedNewsEnrichedResponse = PaginatedResponse<NewsPublicEnriched>
export type PaginatedTagsResponse = PaginatedResponse<TagRead>
