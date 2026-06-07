/**
 * Types pour les tags
 */

export interface TagRead {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  // Traductions automatiques FR → EN/AR (convention additive)
  name_en?: string | null
  name_ar?: string | null
  description_en?: string | null
  description_ar?: string | null
  created_at: string
}

export interface TagCreate {
  name: string
  slug: string
  icon?: string | null
  description?: string | null
  name_en?: string | null
  name_ar?: string | null
  description_en?: string | null
  description_ar?: string | null
}

export interface TagUpdate {
  name?: string
  slug?: string
  icon?: string | null
  description?: string | null
  name_en?: string | null
  name_ar?: string | null
  description_en?: string | null
  description_ar?: string | null
}

export interface TagMerge {
  source_tag_ids: string[]
  target_tag_id: string
}

export interface TagUsage {
  news_count: number
}

/** Champs source FR d'un tag à traduire (sans persistance). */
export interface TagTranslateRequest {
  name?: string | null
  description?: string | null
}

/** Traductions EN/AR renvoyées par l'endpoint admin de traduction. */
export interface TagTranslateResponse {
  name_en?: string | null
  name_ar?: string | null
  description_en?: string | null
  description_ar?: string | null
}
