/**
 * Composable API - Actualités Publiques
 * ======================================
 *
 * Récupère les actualités publiées depuis l'API backend FastAPI.
 * Version publique (sans authentification).
 */

import type { PaginatedResponse } from '~/types/api'
import type {
  EditorJSContent,
  MultilingualContent,
  NewsDisplay,
  NewsHighlightStatus,
  NewsTag,
  NewsWithTags,
} from '~/types/news'

// ============================================================================
// Composable
// ============================================================================

export function usePublicNewsApi() {
  const config = useRuntimeConfig()
  const baseURL = (config.public.apiBase || config.public.apiBaseUrl || 'http://localhost:8000') as string

  // =========================================================================
  // Transformations (réutilisées depuis useAdminNewsApi)
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
  // API Publique
  // =========================================================================

  /**
   * Liste les actualités publiées avec pagination et filtres.
   */
  async function listPublishedNews(params: {
    page?: number
    limit?: number
    tag_id?: string
    campus_id?: string
    highlight_status?: NewsHighlightStatus
  } = {}): Promise<PaginatedResponse<NewsDisplay>> {
    const query: Record<string, string> = {
      page: String(params.page || 1),
      limit: String(params.limit || 20),
    }

    if (params.tag_id) query.tag_id = params.tag_id
    if (params.campus_id) query.campus_id = params.campus_id
    // Note: L'API publique ne supporte pas le filtre highlight_status directement
    // On filtrera côté client si nécessaire

    const response = await $fetch<PaginatedResponse<NewsWithTags>>(`${baseURL}/api/public/news`, {
      query,
    })

    let items = response.items.map(transformToDisplay)

    // Filtrer par highlight_status côté client si nécessaire
    if (params.highlight_status) {
      items = items.filter(item => item.highlight_status === params.highlight_status)
    }

    return {
      ...response,
      items,
      total: items.length, // Ajusté après filtre
    }
  }

  /**
   * Récupère une actualité publiée par son slug.
   */
  async function getNewsBySlug(slug: string): Promise<NewsDisplay | null> {
    try {
      const news = await $fetch<NewsWithTags>(`${baseURL}/api/public/news/${slug}`)
      return transformToDisplay(news)
    }
    catch (error) {
      console.error('Erreur lors de la récupération de l\'actualité:', error)
      return null
    }
  }

  /**
   * Récupère les actualités à la une (headline).
   */
  async function getHeadlineNews(limit: number = 1): Promise<NewsDisplay[]> {
    const response = await listPublishedNews({ limit: 10 }) // Récupérer un peu plus pour filtrer
    return response.items.filter(item => item.highlight_status === 'headline').slice(0, limit)
  }

  /**
   * Récupère les actualités en vedette (featured).
   */
  async function getFeaturedNews(limit: number = 3): Promise<NewsDisplay[]> {
    const response = await listPublishedNews({ limit: 10 })
    return response.items.filter(item => item.highlight_status === 'featured').slice(0, limit)
  }

  /**
   * Récupère toutes les actualités publiées (sans pagination).
   * Note: Limité à un maximum raisonnable pour éviter les problèmes de performance.
   */
  async function getAllPublishedNews(maxLimit: number = 100): Promise<NewsDisplay[]> {
    const response = await listPublishedNews({ limit: maxLimit })
    return response.items
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Formate une date pour l'affichage.
   */
  function formatNewsDate(isoDate: string | null | undefined, locale: string = 'fr-FR'): string {
    if (!isoDate) return '-'
    return new Date(isoDate).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  /**
   * Formate une date courte pour l'affichage.
   */
  function formatShortDate(isoDate: string | null | undefined, locale: string = 'fr-FR'): string {
    if (!isoDate) return '-'
    return new Date(isoDate).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
    })
  }

  return {
    // API Publique
    listPublishedNews,
    getNewsBySlug,
    getHeadlineNews,
    getFeaturedNews,
    getAllPublishedNews,

    // Transformations
    transformToDisplay,
    parseMultilingualContent,

    // Helpers
    formatNewsDate,
    formatShortDate,
    getTagColor,
  }
}
