/**
 * Composable API - Editorial Public
 * ==================================
 *
 * Accès aux contenus éditoriaux via l'API publique (sans authentification).
 * Utilisé par les pages front-office pour afficher les contenus éditables.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Type de valeur éditoriale
 */
export type EditorialValueType = 'text' | 'number' | 'json' | 'html' | 'markdown'

/**
 * Contenu éditorial tel que retourné par l'API publique
 */
export interface EditorialContentPublic {
  key: string
  value: string | null
  value_type: EditorialValueType
  year: number | null
}

// ============================================================================
// COMPOSABLE
// ============================================================================

export function usePublicEditorialApi() {
  const config = useRuntimeConfig()
  const baseUrl = (config.public.apiBase || config.public.apiBaseUrl || 'http://localhost:8000') as string

  // ==========================================================================
  // API CALLS
  // ==========================================================================

  /**
   * Récupère un contenu par sa clé
   */
  async function getContentByKey(key: string): Promise<EditorialContentPublic | null> {
    try {
      return await $fetch<EditorialContentPublic>(`${baseUrl}/api/public/editorial/content/${encodeURIComponent(key)}`)
    }
    catch (error: unknown) {
      // 404 = contenu non trouvé, on retourne null
      if (error && typeof error === 'object' && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
        return null
      }
      throw error
    }
  }

  /**
   * Récupère plusieurs contenus par leurs clés
   */
  async function getContentsByKeys(keys: string[]): Promise<EditorialContentPublic[]> {
    if (!keys.length) return []

    try {
      return await $fetch<EditorialContentPublic[]>(`${baseUrl}/api/public/editorial/contents`, {
        query: { keys: keys.join(',') },
      })
    }
    catch (error) {
      console.error('Erreur chargement contenus éditoriaux:', error)
      return []
    }
  }

  /**
   * Récupère tous les contenus d'une catégorie
   */
  async function getContentsByCategory(categoryCode: string): Promise<EditorialContentPublic[]> {
    try {
      return await $fetch<EditorialContentPublic[]>(`${baseUrl}/api/public/editorial/category/${encodeURIComponent(categoryCode)}`)
    }
    catch (error) {
      console.error(`Erreur chargement catégorie ${categoryCode}:`, error)
      return []
    }
  }

  /**
   * Récupère tous les contenus d'une année
   */
  async function getContentsByYear(year: number): Promise<EditorialContentPublic[]> {
    try {
      return await $fetch<EditorialContentPublic[]>(`${baseUrl}/api/public/editorial/year/${year}`)
    }
    catch (error) {
      console.error(`Erreur chargement année ${year}:`, error)
      return []
    }
  }

  return {
    getContentByKey,
    getContentsByKeys,
    getContentsByCategory,
    getContentsByYear,
  }
}
