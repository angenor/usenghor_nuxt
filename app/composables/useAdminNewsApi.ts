/**
 * Composable API - Actualités Admin
 * ==================================
 *
 * Gestion des actualités via l'API backend FastAPI.
 * Gère la transformation du contenu multilingue EditorJS.
 */

import type { IdResponse, MessageResponse, PaginatedResponse } from '~/types/api'
import type {
  EditorJSContent,
  MultilingualContent,
  NewsCreatePayload,
  NewsDisplay,
  NewsFilters,
  NewsHighlightStatus,
  NewsPublishPayload,
  NewsStats,
  NewsStatus,
  NewsTag,
  NewsUpdatePayload,
  NewsWithTags,
  TagCreatePayload,
  TagRead,
} from '~/types/news'

// ============================================================================
// Labels et couleurs UI (exportés pour utilisation directe)
// ============================================================================

export const newsStatusLabels: Record<NewsStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
}

export const newsStatusColors: Record<NewsStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export const highlightStatusLabels: Record<NewsHighlightStatus, string> = {
  standard: 'Standard',
  featured: 'Mise en avant',
  headline: 'À la une',
}

export const highlightStatusColors: Record<NewsHighlightStatus, string> = {
  standard: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  featured: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  headline: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
}

// ============================================================================
// Composable
// ============================================================================

export function useAdminNewsApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // Transformations
  // =========================================================================

  /**
   * Parse le contenu JSON multilingue depuis le backend.
   */
  function parseMultilingualContent(content: string | null): MultilingualContent {
    if (!content) {
      return { fr: null, en: null, ar: null }
    }
    try {
      const parsed = JSON.parse(content)
      // Si c'est déjà un objet multilingue
      if (parsed && (parsed.fr || parsed.en || parsed.ar)) {
        return {
          fr: parsed.fr || null,
          en: parsed.en || null,
          ar: parsed.ar || null,
        }
      }
      // Si c'est un contenu EditorJS simple, le considérer comme FR
      if (parsed && parsed.blocks) {
        return { fr: parsed, en: null, ar: null }
      }
      return { fr: null, en: null, ar: null }
    }
    catch {
      return { fr: null, en: null, ar: null }
    }
  }

  /**
   * Stringify le contenu multilingue pour envoi au backend.
   */
  function stringifyMultilingualContent(
    contentFr: EditorJSContent | null,
    contentEn: EditorJSContent | null,
    contentAr: EditorJSContent | null,
  ): string | null {
    // Vérifier si au moins un contenu existe
    const hasFr = contentFr && contentFr.blocks && contentFr.blocks.length > 0
    const hasEn = contentEn && contentEn.blocks && contentEn.blocks.length > 0
    const hasAr = contentAr && contentAr.blocks && contentAr.blocks.length > 0

    if (!hasFr && !hasEn && !hasAr) {
      return null
    }

    return JSON.stringify({
      fr: hasFr ? contentFr : null,
      en: hasEn ? contentEn : null,
      ar: hasAr ? contentAr : null,
    })
  }

  /**
   * Transforme NewsWithTags (backend) vers NewsDisplay (frontend).
   */
  function transformToDisplay(news: NewsWithTags): NewsDisplay {
    const multilingual = parseMultilingualContent(news.content)

    return {
      id: news.id,
      slug: news.slug,
      title: news.title,
      summary: news.summary,
      // Contenu multilingue parsé
      content: multilingual.fr,
      content_en: multilingual.en,
      content_ar: multilingual.ar,
      // Médias
      video_url: news.video_url,
      cover_image: news.cover_image_external_id
        ? `https://picsum.photos/seed/${news.cover_image_external_id}/1200/600`
        : null, // TODO: Résoudre via API Media
      cover_image_alt: news.title,
      cover_image_external_id: news.cover_image_external_id,
      // Auteur (à résoudre si nécessaire)
      author: news.author_external_id
        ? { id: news.author_external_id, name: 'Auteur', role: '' }
        : null,
      author_external_id: news.author_external_id,
      // Tags
      tags: news.tags.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        color: getTagColor(t.slug),
      })),
      // Médias additionnels (à implémenter)
      media: [],
      // Associations
      campus_id: news.campus_external_id,
      campus_name: null, // TODO: Résoudre via API
      department_id: news.department_external_id,
      department_name: null,
      service_id: news.service_external_id,
      service_name: null,
      event_id: news.event_external_id,
      event_name: null,
      project_id: news.project_external_id,
      project_name: null,
      // Statuts
      status: news.status,
      highlight_status: news.highlight_status,
      // Dates
      created_at: news.created_at,
      updated_at: news.updated_at,
      published_at: news.published_at,
      visible_from: news.visible_from,
    }
  }

  /**
   * Détermine la couleur d'un tag basé sur son slug.
   */
  function getTagColor(slug: string): string {
    const colors: Record<string, string> = {
      academique: 'blue',
      partenariat: 'green',
      evenement: 'purple',
      recherche: 'orange',
      international: 'cyan',
      alumni: 'pink',
      formation: 'indigo',
      innovation: 'yellow',
      culture: 'red',
      gouvernance: 'teal',
    }
    return colors[slug] || 'gray'
  }

  // =========================================================================
  // CRUD News
  // =========================================================================

  /**
   * Liste les actualités avec pagination et filtres.
   */
  async function listNews(params: NewsFilters & {
    page?: number
    limit?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  } = {}): Promise<PaginatedResponse<NewsDisplay>> {
    const response = await apiFetch<PaginatedResponse<NewsWithTags>>('/api/admin/news', {
      query: {
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search,
        status: params.status !== 'all' ? params.status : undefined,
        highlight_status: params.highlight_status !== 'all' ? params.highlight_status : undefined,
        tag_id: params.tag_id,
        campus_id: params.campus_id,
        from_date: params.from_date,
        to_date: params.to_date,
        sort_by: params.sort_by,
        sort_order: params.sort_order,
      },
    })

    return {
      ...response,
      items: response.items.map(transformToDisplay),
    }
  }

  /**
   * Récupère une actualité par son ID.
   */
  async function getNewsById(id: string): Promise<NewsDisplay> {
    const news = await apiFetch<NewsWithTags>(`/api/admin/news/${id}`)
    return transformToDisplay(news)
  }

  /**
   * Crée une nouvelle actualité.
   */
  async function createNews(data: {
    title: string
    slug: string
    summary?: string | null
    content?: EditorJSContent | null
    content_en?: EditorJSContent | null
    content_ar?: EditorJSContent | null
    video_url?: string | null
    highlight_status?: NewsHighlightStatus
    cover_image_external_id?: string | null
    campus_external_id?: string | null
    department_external_id?: string | null
    service_external_id?: string | null
    event_external_id?: string | null
    project_external_id?: string | null
    author_external_id?: string | null
    status?: NewsStatus
    published_at?: string | null
    visible_from?: string | null
    tag_ids?: string[]
  }): Promise<IdResponse> {
    const payload: NewsCreatePayload = {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      content: stringifyMultilingualContent(
        data.content || null,
        data.content_en || null,
        data.content_ar || null,
      ),
      video_url: data.video_url,
      highlight_status: data.highlight_status || 'standard',
      cover_image_external_id: data.cover_image_external_id,
      campus_external_id: data.campus_external_id,
      department_external_id: data.department_external_id,
      service_external_id: data.service_external_id,
      event_external_id: data.event_external_id,
      project_external_id: data.project_external_id,
      author_external_id: data.author_external_id,
      status: data.status || 'draft',
      published_at: data.published_at,
      visible_from: data.visible_from,
      tag_ids: data.tag_ids || [],
    }

    return apiFetch<IdResponse>('/api/admin/news', {
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Met à jour une actualité.
   */
  async function updateNews(id: string, data: {
    title?: string
    slug?: string
    summary?: string | null
    content?: EditorJSContent | null
    content_en?: EditorJSContent | null
    content_ar?: EditorJSContent | null
    video_url?: string | null
    highlight_status?: NewsHighlightStatus
    cover_image_external_id?: string | null
    campus_external_id?: string | null
    department_external_id?: string | null
    service_external_id?: string | null
    event_external_id?: string | null
    project_external_id?: string | null
    author_external_id?: string | null
    status?: NewsStatus
    published_at?: string | null
    visible_from?: string | null
    tag_ids?: string[]
  }): Promise<NewsDisplay> {
    // Construire le payload uniquement avec les champs définis
    const payload: NewsUpdatePayload = {}

    if (data.title !== undefined) payload.title = data.title
    if (data.slug !== undefined) payload.slug = data.slug
    if (data.summary !== undefined) payload.summary = data.summary
    if (data.video_url !== undefined) payload.video_url = data.video_url
    if (data.highlight_status !== undefined) payload.highlight_status = data.highlight_status
    if (data.cover_image_external_id !== undefined) payload.cover_image_external_id = data.cover_image_external_id
    if (data.campus_external_id !== undefined) payload.campus_external_id = data.campus_external_id
    if (data.department_external_id !== undefined) payload.department_external_id = data.department_external_id
    if (data.service_external_id !== undefined) payload.service_external_id = data.service_external_id
    if (data.event_external_id !== undefined) payload.event_external_id = data.event_external_id
    if (data.project_external_id !== undefined) payload.project_external_id = data.project_external_id
    if (data.author_external_id !== undefined) payload.author_external_id = data.author_external_id
    if (data.status !== undefined) payload.status = data.status
    if (data.published_at !== undefined) payload.published_at = data.published_at
    if (data.visible_from !== undefined) payload.visible_from = data.visible_from
    if (data.tag_ids !== undefined) payload.tag_ids = data.tag_ids

    // Gérer le contenu multilingue si au moins un champ content est fourni
    if (data.content !== undefined || data.content_en !== undefined || data.content_ar !== undefined) {
      payload.content = stringifyMultilingualContent(
        data.content || null,
        data.content_en || null,
        data.content_ar || null,
      )
    }

    const news = await apiFetch<NewsWithTags>(`/api/admin/news/${id}`, {
      method: 'PUT',
      body: payload,
    })

    return transformToDisplay(news)
  }

  /**
   * Supprime une actualité.
   */
  async function deleteNews(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/news/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Publie une actualité.
   */
  async function publishNews(id: string, publishedAt?: string): Promise<NewsDisplay> {
    const payload: NewsPublishPayload = publishedAt ? { published_at: publishedAt } : {}
    const news = await apiFetch<NewsWithTags>(`/api/admin/news/${id}/publish`, {
      method: 'POST',
      body: payload,
    })
    return transformToDisplay(news)
  }

  /**
   * Dépublie une actualité.
   */
  async function unpublishNews(id: string): Promise<NewsDisplay> {
    const news = await apiFetch<NewsWithTags>(`/api/admin/news/${id}/unpublish`, {
      method: 'POST',
    })
    return transformToDisplay(news)
  }

  /**
   * Duplique une actualité avec un nouveau slug.
   */
  async function duplicateNews(id: string, newSlug: string): Promise<IdResponse> {
    return apiFetch<IdResponse>(`/api/admin/news/${id}/duplicate`, {
      method: 'POST',
      query: { new_slug: newSlug },
    })
  }

  // =========================================================================
  // CRUD Tags
  // =========================================================================

  /**
   * Liste les tags avec pagination.
   */
  async function listTags(params: {
    page?: number
    limit?: number
    search?: string
  } = {}): Promise<PaginatedResponse<TagRead>> {
    return apiFetch<PaginatedResponse<TagRead>>('/api/admin/tags', {
      query: {
        page: params.page || 1,
        limit: params.limit || 100,
        search: params.search,
      },
    })
  }

  /**
   * Récupère tous les tags (sans pagination).
   * Note: Limité à 100 tags max par contrainte backend.
   */
  async function getAllTags(): Promise<TagRead[]> {
    const response = await listTags({ limit: 100 })
    return response.items
  }

  /**
   * Crée un nouveau tag.
   */
  async function createTag(data: TagCreatePayload): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/tags', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Supprime un tag.
   */
  async function deleteTag(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/tags/${id}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Statistics
  // =========================================================================

  /**
   * Calcule les statistiques des actualités.
   * Note: Le backend n'a pas d'endpoint dédié, on calcule côté client.
   */
  async function getNewsStats(): Promise<NewsStats> {
    // Récupérer toutes les actualités pour calculer les stats
    const [allNews, publishedNews, draftNews, archivedNews] = await Promise.all([
      listNews({ limit: 1 }),
      listNews({ status: 'published', limit: 1 }),
      listNews({ status: 'draft', limit: 1 }),
      listNews({ status: 'archived', limit: 1 }),
    ])

    // Pour headline et featured, on filtre parmi les publiées
    const featuredNews = await listNews({ status: 'published', highlight_status: 'featured', limit: 1 })
    const headlineNews = await listNews({ status: 'published', highlight_status: 'headline', limit: 1 })

    return {
      total: allNews.total,
      published: publishedNews.total,
      draft: draftNews.total,
      archived: archivedNews.total,
      headline: headlineNews.total,
      featured: featuredNews.total,
    }
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Génère un slug à partir du titre.
   */
  function slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  /**
   * Formate une date ISO en format datetime-local pour les inputs.
   */
  function toDatetimeLocal(isoDate: string | null | undefined): string {
    if (!isoDate) return ''
    return isoDate.slice(0, 16)
  }

  /**
   * Formate une date ISO en format date (YYYY-MM-DD) pour les inputs.
   */
  function toDateInput(isoDate: string | null | undefined): string {
    if (!isoDate) return ''
    return isoDate.slice(0, 10)
  }

  /**
   * Formate une date pour l'affichage.
   */
  function formatNewsDate(isoDate: string | null | undefined): string {
    if (!isoDate) return '-'
    return new Date(isoDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  /**
   * Formate une date avec heure pour l'affichage.
   */
  function formatNewsDateTime(isoDate: string | null | undefined): string {
    if (!isoDate) return '-'
    return new Date(isoDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Convertit les tags frontend en format backend (tableau d'IDs).
   */
  function tagsToIds(tags: NewsTag[]): string[] {
    return tags.map(t => t.id)
  }

  return {
    // CRUD News
    listNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    publishNews,
    unpublishNews,
    duplicateNews,

    // CRUD Tags
    listTags,
    getAllTags,
    createTag,
    deleteTag,

    // Statistics
    getNewsStats,

    // Transformations
    transformToDisplay,
    parseMultilingualContent,
    stringifyMultilingualContent,

    // Helpers
    slugify,
    toDatetimeLocal,
    toDateInput,
    formatNewsDate,
    formatNewsDateTime,
    tagsToIds,
    getTagColor,

    // Labels & Colors
    newsStatusLabels,
    newsStatusColors,
    highlightStatusLabels,
    highlightStatusColors,
  }
}
