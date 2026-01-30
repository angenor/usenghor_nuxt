/**
 * Store Pinia - Editorial Content
 * ================================
 *
 * Cache global pour les contenus éditoriaux.
 * Évite les appels API répétés sur les mêmes pages.
 */

import { defineStore } from 'pinia'
import type { EditorialContentPublic } from '~/composables/usePublicEditorialApi'

// TTL du cache en millisecondes (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

export const useEditorialContentStore = defineStore('editorialContent', () => {
  // Cache des contenus par clé
  const contents = ref<Map<string, EditorialContentPublic>>(new Map())

  // Pages déjà chargées
  const loadedPages = ref<Set<string>>(new Set())

  // Timestamp du dernier chargement
  const lastFetchTime = ref<number | null>(null)

  // État de chargement
  const isLoading = ref(false)

  // Erreur éventuelle
  const error = ref<string | null>(null)

  // ==========================================================================
  // GETTERS
  // ==========================================================================

  /**
   * Vérifie si le cache est encore valide
   */
  function isCacheValid(): boolean {
    if (!lastFetchTime.value) return false
    return Date.now() - lastFetchTime.value < CACHE_TTL
  }

  /**
   * Vérifie si une page est déjà chargée (et cache valide)
   */
  function isPageLoaded(pageId: string): boolean {
    return loadedPages.value.has(pageId) && isCacheValid()
  }

  /**
   * Récupère un contenu par sa clé
   */
  function getContent(key: string): EditorialContentPublic | null {
    return contents.value.get(key) ?? null
  }

  /**
   * Récupère la valeur d'un contenu (raccourci)
   */
  function getValue(key: string): string | null {
    return contents.value.get(key)?.value ?? null
  }

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  /**
   * Stocke des contenus dans le cache
   */
  function setContents(items: EditorialContentPublic[]): void {
    for (const item of items) {
      contents.value.set(item.key, item)
    }
    lastFetchTime.value = Date.now()
  }

  /**
   * Marque une page comme chargée
   */
  function markPageLoaded(pageId: string): void {
    loadedPages.value.add(pageId)
  }

  /**
   * Charge les contenus pour une page via l'API
   */
  async function loadPageContents(pageId: string, keys: string[]): Promise<void> {
    // Éviter les chargements multiples simultanés
    if (isLoading.value) return

    // Vérifier si la page est déjà chargée avec un cache valide
    if (isPageLoaded(pageId)) return

    isLoading.value = true
    error.value = null

    try {
      const { getContentsByKeys } = usePublicEditorialApi()
      const loadedContents = await getContentsByKeys(keys)

      setContents(loadedContents)
      markPageLoaded(pageId)
    }
    catch (err) {
      console.error(`Erreur chargement contenus page ${pageId}:`, err)
      error.value = 'Erreur lors du chargement des contenus'
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Force le rechargement du cache
   */
  function invalidateCache(): void {
    contents.value.clear()
    loadedPages.value.clear()
    lastFetchTime.value = null
  }

  /**
   * Force le rechargement d'une page spécifique
   */
  function invalidatePage(pageId: string): void {
    loadedPages.value.delete(pageId)
  }

  return {
    // State
    contents,
    loadedPages,
    isLoading,
    error,

    // Getters
    isCacheValid,
    isPageLoaded,
    getContent,
    getValue,

    // Actions
    setContents,
    markPageLoaded,
    loadPageContents,
    invalidateCache,
    invalidatePage,
  }
})
