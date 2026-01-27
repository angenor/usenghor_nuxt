/**
 * Composable API - Mentions Légales (Editorial)
 * ==============================================
 *
 * Gestion des pages légales via le système éditorial.
 * Les données sont stockées comme contenus HTML dans editorial_contents.
 */

// ============================================================================
// Types - Structures des pages légales
// ============================================================================

export type LegalPageKey = 'legal_notice' | 'privacy_policy' | 'terms_of_use' | 'cookie_policy'

export interface LegalPageValue {
  title: string
  content: string
}

export interface LegalPage {
  id: string
  key: LegalPageKey
  title: string
  content: string
  value_type: 'text' | 'number' | 'json' | 'html' | 'markdown'
  category_id: string | null
  year: number | null
  description: string | null
  admin_editable: boolean
  created_at: string
  updated_at: string
}

export interface LegalPageHistory {
  id: string
  content_id: string
  old_value: string | null
  new_value: string | null
  modified_by_external_id: string | null
  modified_by_name?: string
  modified_at: string
}

export interface LegalPagesStats {
  total_pages: number
  last_updated: string | null
  last_updated_page: LegalPageKey | null
  history_count: number
}

// ============================================================================
// Types Backend (Editorial)
// ============================================================================

interface EditorialContentRead {
  id: string
  key: string
  value: string | null
  value_type: 'text' | 'number' | 'json' | 'html' | 'markdown'
  category_id: string | null
  year: number | null
  description: string | null
  admin_editable: boolean
  created_at: string
  updated_at: string
  category?: {
    id: string
    code: string
    name: string
  } | null
}

interface EditorialHistoryRead {
  id: string
  content_id: string
  old_value: string | null
  new_value: string | null
  modified_by_external_id: string | null
  modified_at: string
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

// ============================================================================
// Constantes et Labels
// ============================================================================

export const legalPageLabels: Record<LegalPageKey, string> = {
  legal_notice: 'Mentions légales',
  privacy_policy: 'Politique de confidentialité',
  terms_of_use: 'Conditions générales d\'utilisation',
  cookie_policy: 'Politique de cookies',
}

export const legalPageDescriptions: Record<LegalPageKey, string> = {
  legal_notice: 'Informations sur l\'éditeur du site, l\'hébergeur et le directeur de publication',
  privacy_policy: 'Politique de protection des données personnelles (RGPD)',
  terms_of_use: 'Conditions d\'utilisation du site et des services',
  cookie_policy: 'Gestion des cookies et traceurs',
}

export const legalPageIcons: Record<LegalPageKey, string[]> = {
  legal_notice: ['fas', 'gavel'],
  privacy_policy: ['fas', 'shield-alt'],
  terms_of_use: ['fas', 'file-contract'],
  cookie_policy: ['fas', 'cookie-bite'],
}

export const legalPageColors: Record<LegalPageKey, string> = {
  legal_notice: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  privacy_policy: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  terms_of_use: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  cookie_policy: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
}

export const legalPageKeys: LegalPageKey[] = ['legal_notice', 'privacy_policy', 'terms_of_use', 'cookie_policy']

// ============================================================================
// Composable
// ============================================================================

export function useLegalApi() {
  const { apiFetch } = useApi()

  // Cache pour les contenus
  const contentsCache = ref<Map<string, EditorialContentRead>>(new Map())

  // Cache pour les utilisateurs (pour enrichir l'historique)
  const usersCache = ref<Map<string, { first_name: string, last_name: string }>>(new Map())

  // =========================================================================
  // Helpers - Chargement des données
  // =========================================================================

  /**
   * Charge tous les contenus légaux depuis l'API.
   */
  async function loadContents(): Promise<Map<string, EditorialContentRead>> {
    try {
      const response = await apiFetch<PaginatedResponse<EditorialContentRead>>(
        '/api/admin/editorial/contents',
        {
          query: { category_code: 'legal', limit: 50 },
        },
      )

      contentsCache.value.clear()
      if (response?.items) {
        for (const content of response.items) {
          contentsCache.value.set(content.key, content)
        }
      }
    }
    catch (error) {
      console.error('Erreur lors du chargement des pages légales:', error)
    }

    return contentsCache.value
  }

  /**
   * Charge les utilisateurs pour enrichir l'historique.
   */
  async function loadUsers(): Promise<void> {
    if (usersCache.value.size > 0) return

    try {
      const response = await apiFetch<PaginatedResponse<{
        id: string
        first_name: string
        last_name: string
      }>>('/api/admin/users', {
        query: { limit: 100 },
      })

      if (response?.items) {
        for (const user of response.items) {
          usersCache.value.set(user.id, {
            first_name: user.first_name,
            last_name: user.last_name,
          })
        }
      }
    }
    catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    }
  }

  /**
   * Récupère un contenu par sa clé.
   */
  async function getContentByKey(key: string): Promise<EditorialContentRead | null> {
    // Vérifier le cache d'abord
    if (contentsCache.value.has(key)) {
      return contentsCache.value.get(key) || null
    }

    try {
      const content = await apiFetch<EditorialContentRead>(
        `/api/admin/editorial/contents/by-key/${key}`,
      )
      contentsCache.value.set(key, content)
      return content
    }
    catch (error) {
      console.error(`Erreur lors du chargement du contenu ${key}:`, error)
      return null
    }
  }

  /**
   * Parse la valeur JSON d'un contenu légal.
   */
  function parseContentValue(content: EditorialContentRead | null): LegalPageValue {
    if (!content?.value) {
      return { title: '', content: '' }
    }
    try {
      return JSON.parse(content.value) as LegalPageValue
    }
    catch {
      // Si ce n'est pas du JSON, c'est peut-être du HTML direct
      return { title: '', content: content.value }
    }
  }

  /**
   * Convertit un contenu éditorial en LegalPage.
   */
  function toLegalPage(content: EditorialContentRead): LegalPage {
    const parsed = parseContentValue(content)
    return {
      id: content.id,
      key: content.key as LegalPageKey,
      title: parsed.title || legalPageLabels[content.key as LegalPageKey] || content.key,
      content: parsed.content,
      value_type: content.value_type,
      category_id: content.category_id,
      year: content.year,
      description: content.description,
      admin_editable: content.admin_editable,
      created_at: content.created_at,
      updated_at: content.updated_at,
    }
  }

  // =========================================================================
  // Récupération des données
  // =========================================================================

  /**
   * Récupère toutes les pages légales.
   */
  async function getAllLegalPages(): Promise<LegalPage[]> {
    await loadContents()

    const pages: LegalPage[] = []

    for (const key of legalPageKeys) {
      const content = contentsCache.value.get(key)
      if (content) {
        pages.push(toLegalPage(content))
      }
    }

    return pages
  }

  /**
   * Récupère une page légale par sa clé.
   */
  async function getLegalPageByKey(key: LegalPageKey): Promise<LegalPage | null> {
    const content = await getContentByKey(key)
    if (!content) return null
    return toLegalPage(content)
  }

  /**
   * Récupère une page légale par son ID.
   */
  async function getLegalPageById(id: string): Promise<LegalPage | null> {
    await loadContents()

    for (const content of contentsCache.value.values()) {
      if (content.id === id) {
        return toLegalPage(content)
      }
    }

    return null
  }

  // =========================================================================
  // Sauvegarde des données
  // =========================================================================

  /**
   * Met à jour une page légale.
   */
  async function updateLegalPage(
    key: LegalPageKey,
    data: { title: string, content: string },
  ): Promise<boolean> {
    const content = contentsCache.value.get(key)
    if (!content) {
      console.error(`Page légale ${key} non trouvée`)
      return false
    }

    try {
      await apiFetch<EditorialContentRead>(
        `/api/admin/editorial/contents/${content.id}`,
        {
          method: 'PUT',
          body: {
            value: JSON.stringify(data),
          },
        },
      )

      // Mettre à jour le cache
      content.value = JSON.stringify(data)
      content.updated_at = new Date().toISOString()
      contentsCache.value.set(key, content)

      return true
    }
    catch (error) {
      console.error(`Erreur lors de la mise à jour de ${key}:`, error)
      throw error
    }
  }

  // =========================================================================
  // Historique
  // =========================================================================

  /**
   * Récupère l'historique d'une page légale.
   */
  async function getLegalPageHistory(contentId: string): Promise<LegalPageHistory[]> {
    await loadUsers()

    try {
      const history = await apiFetch<EditorialHistoryRead[]>(
        `/api/admin/editorial/contents/${contentId}/history`,
        { query: { limit: 50 } },
      )

      return history.map((h) => {
        const user = h.modified_by_external_id
          ? usersCache.value.get(h.modified_by_external_id)
          : null

        return {
          ...h,
          modified_by_name: user
            ? `${user.first_name} ${user.last_name}`
            : 'Système',
        }
      })
    }
    catch (error) {
      console.error(`Erreur lors du chargement de l'historique:`, error)
      return []
    }
  }

  /**
   * Récupère l'historique global de toutes les pages légales.
   */
  async function getAllLegalPagesHistory(limit = 20): Promise<LegalPageHistory[]> {
    await loadContents()
    await loadUsers()

    const allHistory: LegalPageHistory[] = []

    for (const content of contentsCache.value.values()) {
      const history = await getLegalPageHistory(content.id)
      allHistory.push(...history)
    }

    // Trier par date décroissante et limiter
    return allHistory
      .sort((a, b) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime())
      .slice(0, limit)
  }

  /**
   * Restaure une version précédente d'une page légale.
   */
  async function restoreVersion(historyEntry: LegalPageHistory): Promise<boolean> {
    const content = [...contentsCache.value.values()].find(c => c.id === historyEntry.content_id)
    if (!content || !historyEntry.new_value) {
      return false
    }

    try {
      // Restaurer en utilisant la valeur de l'historique
      let valueToRestore: { title: string, content: string }

      try {
        valueToRestore = JSON.parse(historyEntry.new_value)
      }
      catch {
        // Si ce n'est pas du JSON, utiliser comme contenu HTML
        valueToRestore = {
          title: legalPageLabels[content.key as LegalPageKey] || content.key,
          content: historyEntry.new_value,
        }
      }

      return await updateLegalPage(content.key as LegalPageKey, valueToRestore)
    }
    catch (error) {
      console.error('Erreur lors de la restauration:', error)
      return false
    }
  }

  // =========================================================================
  // Statistiques
  // =========================================================================

  /**
   * Calcule les statistiques des pages légales.
   */
  async function getLegalPagesStats(): Promise<LegalPagesStats> {
    await loadContents()

    let lastUpdated: string | null = null
    let lastUpdatedPage: LegalPageKey | null = null

    for (const content of contentsCache.value.values()) {
      if (!lastUpdated || new Date(content.updated_at) > new Date(lastUpdated)) {
        lastUpdated = content.updated_at
        lastUpdatedPage = content.key as LegalPageKey
      }
    }

    // Compter l'historique total
    let historyCount = 0
    for (const content of contentsCache.value.values()) {
      try {
        const history = await apiFetch<EditorialHistoryRead[]>(
          `/api/admin/editorial/contents/${content.id}/history`,
          { query: { limit: 100 } },
        )
        historyCount += history.length
      }
      catch {
        // Ignorer les erreurs de comptage
      }
    }

    return {
      total_pages: contentsCache.value.size,
      last_updated: lastUpdated,
      last_updated_page: lastUpdatedPage,
      history_count: historyCount,
    }
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Vérifie si une page peut être modifiée.
   */
  function canEditLegalPage(): boolean {
    // Toutes les pages légales sont modifiables par les admins avec la permission editorial.edit
    return true
  }

  /**
   * Formate une date en français.
   */
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Formate une date courte en français.
   */
  function formatDateShort(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  /**
   * Génère un ID unique pour l'historique (utilisé côté client uniquement).
   */
  function generateLegalHistoryId(): string {
    return `legal_hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Invalide le cache pour forcer un rechargement.
   */
  function invalidateCache(): void {
    contentsCache.value.clear()
    usersCache.value.clear()
  }

  // =========================================================================
  // Export
  // =========================================================================

  return {
    // Chargement
    loadContents,
    getAllLegalPages,
    getLegalPageByKey,
    getLegalPageById,

    // Sauvegarde
    updateLegalPage,

    // Historique
    getLegalPageHistory,
    getAllLegalPagesHistory,
    restoreVersion,

    // Statistiques
    getLegalPagesStats,

    // Helpers
    canEditLegalPage,
    formatDate,
    formatDateShort,
    generateLegalHistoryId,
    invalidateCache,

    // Constantes
    legalPageLabels,
    legalPageDescriptions,
    legalPageIcons,
    legalPageColors,
    legalPageKeys,

    // Cache (pour debug)
    contentsCache,
  }
}
