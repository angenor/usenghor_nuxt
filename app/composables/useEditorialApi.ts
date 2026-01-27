/**
 * Composable pour la gestion des contenus éditoriaux (chiffres clés)
 * Aligné sur le backend: app/routers/admin/editorial.py
 */

import type { MessageResponse, PaginatedResponse } from '~/types/api'

// === TYPES ===

export type EditorialValueType = 'text' | 'number' | 'json' | 'html' | 'markdown'

// Catégorie
export interface CategoryRead {
  id: string
  code: string
  name: string
  description: string | null
  created_at: string
}

export interface CategoryWithContentsCount extends CategoryRead {
  contents_count: number
}

export interface CategoryCreatePayload {
  code: string
  name: string
  description?: string | null
}

export interface CategoryUpdatePayload {
  name?: string
  description?: string | null
}

// Contenu (chiffre clé)
export interface ContentRead {
  id: string
  key: string
  value: string | null
  value_type: EditorialValueType
  category_id: string | null
  year: number | null
  description: string | null
  admin_editable: boolean
  created_at: string
  updated_at: string
}

export interface ContentWithCategory extends ContentRead {
  category: CategoryRead | null
}

export interface ContentCreatePayload {
  key: string
  value?: string | null
  value_type?: EditorialValueType
  category_id?: string | null
  year?: number | null
  description?: string | null
  admin_editable?: boolean
}

export interface ContentUpdatePayload {
  value?: string | null
  value_type?: EditorialValueType
  category_id?: string | null
  year?: number | null
  description?: string | null
  admin_editable?: boolean
}

// Historique
export interface HistoryRead {
  id: string
  content_id: string
  old_value: string | null
  new_value: string | null
  modified_by_external_id: string | null
  modified_at: string
}

export interface ContentWithHistory extends ContentRead {
  history: HistoryRead[]
}

// Bulk update
export interface BulkContentUpdate {
  key: string
  value: string
}

export interface BulkUpdateRequest {
  updates: BulkContentUpdate[]
}

export interface BulkUpdateResult {
  total: number
  updated: number
  errors: number
  not_found: number
}

// Filtres
export interface ContentFilters {
  search?: string | null
  category_id?: string | null
  category_code?: string | null
  value_type?: EditorialValueType | null
  year?: number | null
  admin_editable?: boolean | null
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// === CONSTANTS ===

export const valueTypeLabels: Record<EditorialValueType, string> = {
  text: 'Texte',
  number: 'Nombre',
  json: 'JSON',
  html: 'HTML',
  markdown: 'Markdown',
}

export const valueTypeColors: Record<EditorialValueType, string> = {
  text: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  number: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  json: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  html: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  markdown: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

// === COMPOSABLE ===

export function useEditorialApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // CATEGORIES
  // =========================================================================

  /**
   * Liste les catégories avec pagination
   */
  async function listCategories(params: {
    page?: number
    limit?: number
    search?: string | null
  } = {}): Promise<PaginatedResponse<CategoryRead>> {
    return apiFetch<PaginatedResponse<CategoryRead>>('/api/admin/editorial/categories', {
      query: {
        page: params.page ?? 1,
        limit: params.limit ?? 100,
        search: params.search,
      },
    })
  }

  /**
   * Liste les catégories avec le nombre de contenus
   */
  async function listCategoriesWithCount(): Promise<CategoryWithContentsCount[]> {
    return apiFetch<CategoryWithContentsCount[]>('/api/admin/editorial/categories/with-count')
  }

  /**
   * Récupère une catégorie par son ID
   */
  async function getCategoryById(id: string): Promise<CategoryRead> {
    return apiFetch<CategoryRead>(`/api/admin/editorial/categories/${id}`)
  }

  /**
   * Crée une nouvelle catégorie
   */
  async function createCategory(data: CategoryCreatePayload): Promise<{ id: string }> {
    return apiFetch<{ id: string }>('/api/admin/editorial/categories', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour une catégorie
   */
  async function updateCategory(id: string, data: CategoryUpdatePayload): Promise<CategoryRead> {
    return apiFetch<CategoryRead>(`/api/admin/editorial/categories/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime une catégorie
   */
  async function deleteCategory(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/editorial/categories/${id}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // CONTENTS (CHIFFRES CLÉS)
  // =========================================================================

  /**
   * Liste les contenus avec pagination et filtres
   */
  async function listContents(params: ContentFilters = {}): Promise<PaginatedResponse<ContentRead>> {
    return apiFetch<PaginatedResponse<ContentRead>>('/api/admin/editorial/contents', {
      query: {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        search: params.search,
        category_id: params.category_id,
        category_code: params.category_code,
        value_type: params.value_type,
        year: params.year,
        admin_editable: params.admin_editable,
        sort_by: params.sort_by ?? 'updated_at',
        sort_order: params.sort_order ?? 'desc',
      },
    })
  }

  /**
   * Récupère un contenu par son ID
   */
  async function getContentById(id: string): Promise<ContentWithCategory> {
    return apiFetch<ContentWithCategory>(`/api/admin/editorial/contents/${id}`)
  }

  /**
   * Récupère un contenu par sa clé
   */
  async function getContentByKey(key: string): Promise<ContentWithCategory> {
    return apiFetch<ContentWithCategory>(`/api/admin/editorial/contents/by-key/${key}`)
  }

  /**
   * Crée un nouveau contenu
   */
  async function createContent(data: ContentCreatePayload): Promise<{ id: string }> {
    return apiFetch<{ id: string }>('/api/admin/editorial/contents', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un contenu
   */
  async function updateContent(id: string, data: ContentUpdatePayload): Promise<ContentRead> {
    return apiFetch<ContentRead>(`/api/admin/editorial/contents/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un contenu
   */
  async function deleteContent(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/editorial/contents/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Met à jour plusieurs contenus par leurs clés
   */
  async function bulkUpdateContents(updates: BulkContentUpdate[]): Promise<BulkUpdateResult> {
    return apiFetch<BulkUpdateResult>('/api/admin/editorial/contents/bulk-update', {
      method: 'POST',
      body: { updates },
    })
  }

  // =========================================================================
  // HISTORY
  // =========================================================================

  /**
   * Récupère l'historique des modifications d'un contenu
   */
  async function getContentHistory(contentId: string, limit: number = 50): Promise<HistoryRead[]> {
    return apiFetch<HistoryRead[]>(`/api/admin/editorial/contents/${contentId}/history`, {
      query: { limit },
    })
  }

  /**
   * Récupère les modifications récentes de tous les contenus
   */
  async function getRecentHistory(limit: number = 50): Promise<HistoryRead[]> {
    return apiFetch<HistoryRead[]>('/api/admin/editorial/history/recent', {
      query: { limit },
    })
  }

  /**
   * Récupère un contenu avec son historique complet
   */
  async function getContentWithHistory(contentId: string): Promise<ContentWithHistory> {
    return apiFetch<ContentWithHistory>(`/api/admin/editorial/contents/${contentId}/with-history`)
  }

  // =========================================================================
  // UTILITAIRES
  // =========================================================================

  /**
   * Formate une valeur selon son type
   */
  function formatValue(value: string | null, valueType: EditorialValueType, maxLength: number = 100): string {
    if (value === null) return '-'

    switch (valueType) {
      case 'number': {
        const num = parseFloat(value)
        if (!isNaN(num)) {
          return num.toLocaleString('fr-FR')
        }
        return value
      }
      case 'json': {
        // Pour les JSON, essayer d'extraire un titre ou résumer
        try {
          const parsed = JSON.parse(value)

          // Si c'est un objet avec title (core value, etc.)
          if ('title' in parsed && typeof parsed.title === 'string') {
            const title = parsed.title.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
            if (title) return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title
          }

          // Si c'est un objet avec name
          if ('name' in parsed && typeof parsed.name === 'string') {
            const name = parsed.name.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
            if (name) return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name
          }

          // Si c'est un format EditorJS (avec blocks)
          if (parsed.blocks && Array.isArray(parsed.blocks)) {
            const textContent = parsed.blocks
              .map((b: { data?: { text?: string } }) => b.data?.text || '')
              .filter((t: string) => t)
              .join(' ')
              .replace(/<[^>]*>/g, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .trim()
            if (textContent) {
              return textContent.length > maxLength ? `${textContent.substring(0, maxLength)}...` : textContent
            }
            return '[Contenu riche]'
          }

          // Pour les objets simples, afficher un résumé des clés/valeurs
          if (typeof parsed === 'object' && !Array.isArray(parsed)) {
            const keys = Object.keys(parsed)
            if (keys.length === 0) return '[Objet vide]'

            // Essayer d'afficher la première valeur string non vide
            for (const key of keys) {
              const val = parsed[key]
              if (typeof val === 'string' && val.trim()) {
                const cleanVal = val.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
                if (cleanVal) {
                  return cleanVal.length > maxLength ? `${cleanVal.substring(0, maxLength)}...` : cleanVal
                }
              }
            }

            // Sinon afficher les clés
            const keysStr = keys.slice(0, 3).join(', ')
            return keys.length > 3 ? `{${keysStr}, ...}` : `{${keysStr}}`
          }

          // Pour les arrays
          if (Array.isArray(parsed)) {
            return `[${parsed.length} élément${parsed.length > 1 ? 's' : ''}]`
          }

          return String(parsed)
        }
        catch {
          // Nettoyer les balises si c'est du texte brut avec HTML
          const cleaned = value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
          return cleaned.length > maxLength ? `${cleaned.substring(0, maxLength)}...` : cleaned
        }
      }
      case 'html': {
        // Supprimer les balises HTML et tronquer
        const textOnly = value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
        if (textOnly.length > maxLength) {
          return `${textOnly.substring(0, maxLength)}...`
        }
        return textOnly || '[Contenu HTML]'
      }
      case 'markdown': {
        // Supprimer la syntaxe Markdown basique, les balises HTML et tronquer
        const cleanMarkdown = value
          .replace(/#{1,6}\s/g, '') // Titres
          .replace(/\*\*([^*]+)\*\*/g, '$1') // Gras
          .replace(/\*([^*]+)\*/g, '$1') // Italique
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Liens
          .replace(/`([^`]+)`/g, '$1') // Code inline
          .replace(/<[^>]*>/g, '') // Balises HTML
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .trim()
        if (cleanMarkdown.length > maxLength) {
          return `${cleanMarkdown.substring(0, maxLength)}...`
        }
        return cleanMarkdown || '[Contenu Markdown]'
      }
      default: {
        // Pour text et autres types, nettoyer les balises HTML potentielles
        const cleanText = value
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .trim()
        if (cleanText.length > maxLength) {
          return `${cleanText.substring(0, maxLength)}...`
        }
        return cleanText || value
      }
    }
  }

  /**
   * Vérifie si un contenu peut être modifié
   */
  function canEditContent(content: ContentRead): boolean {
    return content.admin_editable
  }

  /**
   * Vérifie si un contenu peut être supprimé
   */
  function canDeleteContent(content: ContentRead): boolean {
    return content.admin_editable
  }

  /**
   * Obtient les années uniques présentes dans une liste de contenus
   */
  function getAvailableYears(contents: ContentRead[]): number[] {
    const years = new Set<number>()
    contents.forEach((c) => {
      if (c.year) years.add(c.year)
    })
    return Array.from(years).sort((a, b) => b - a)
  }

  /**
   * Calcule les statistiques globales
   */
  function computeGlobalStats(contents: ContentRead[], categories: CategoryRead[]) {
    const total = contents.length
    const editable = contents.filter((c) => c.admin_editable).length

    // Dernière mise à jour
    let lastUpdated: string | null = null
    if (contents.length > 0) {
      lastUpdated = contents.reduce((latest, c) =>
        new Date(c.updated_at) > new Date(latest.updated_at) ? c : latest,
      ).updated_at
    }

    return {
      total_count: total,
      editable_count: editable,
      categories_count: categories.length,
      last_updated: lastUpdated,
    }
  }

  return {
    // Categories
    listCategories,
    listCategoriesWithCount,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,

    // Contents
    listContents,
    getContentById,
    getContentByKey,
    createContent,
    updateContent,
    deleteContent,
    bulkUpdateContents,

    // History
    getContentHistory,
    getRecentHistory,
    getContentWithHistory,

    // Utilities
    formatValue,
    canEditContent,
    canDeleteContent,
    getAvailableYears,
    computeGlobalStats,

    // Constants
    valueTypeLabels,
    valueTypeColors,
  }
}
