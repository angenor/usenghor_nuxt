/**
 * Types pour les tags
 */

export interface TagRead {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  created_at: string
}

export interface TagCreate {
  name: string
  slug: string
  icon?: string | null
  description?: string | null
}

export interface TagUpdate {
  name?: string
  slug?: string
  icon?: string | null
  description?: string | null
}

export interface TagMerge {
  source_tag_ids: string[]
  target_tag_id: string
}

export interface TagUsage {
  news_count: number
}
