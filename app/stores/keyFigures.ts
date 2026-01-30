/**
 * Store Pinia - Key Figures (Chiffres-clés)
 * ==========================================
 *
 * Cache global pour les chiffres-clés numériques.
 * Ces valeurs sont éditées dans /admin/editorial/chiffres-cles/
 */

import { defineStore } from 'pinia'
import type { EditorialContentPublic } from '~/composables/usePublicEditorialApi'

// Clés prédéfinies pour les chiffres-clés (value_type: number)
export const PREDEFINED_KEY_FIGURES = [
  'stats_countries',
  'stats_donor_countries',
  'stats_graduates',
  'stats_alumni',
  'stats_years',
  'stats_programs',
  'stats_partners',
  'stats_professors',
  'stats_students',
  'stats_nationalities',
  'stats_open_positions',
  'stats_project_countries',
  'stats_project_beneficiaries',
  'stats_alumni_countries',
  'stats_alumni_sectors',
  'stats_promotions',
  'stats_site_surface',
  'stats_site_rooms',
  'stats_site_capacity',
  'stats_site_founded',
] as const

export type KeyFigureKey = typeof PREDEFINED_KEY_FIGURES[number]

// TTL du cache en millisecondes (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

export const useKeyFiguresStore = defineStore('keyFigures', () => {
  // Cache des chiffres-clés par clé
  const figures = ref<Map<string, string>>(new Map())

  // État de chargement
  const isLoaded = ref(false)
  const isLoading = ref(false)

  // Timestamp du dernier chargement
  const lastFetchTime = ref<number | null>(null)

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
   * Récupère un chiffre-clé par sa clé
   */
  function getFigure(key: string): string | undefined {
    return figures.value.get(key)
  }

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  /**
   * Charge tous les chiffres-clés depuis l'API
   */
  async function fetchFigures(): Promise<void> {
    // Éviter les chargements multiples simultanés
    if (isLoading.value) return

    // Vérifier si le cache est encore valide
    if (isLoaded.value && isCacheValid()) return

    isLoading.value = true
    error.value = null

    try {
      const { getContentsByKeys } = usePublicEditorialApi()
      const contents = await getContentsByKeys([...PREDEFINED_KEY_FIGURES])

      // Stocker les valeurs dans le cache
      for (const content of contents) {
        if (content.value !== null) {
          figures.value.set(content.key, content.value)
        }
      }

      isLoaded.value = true
      lastFetchTime.value = Date.now()
    }
    catch (err) {
      console.warn('Chiffres-clés non disponibles:', err)
      error.value = 'Erreur lors du chargement des chiffres-clés'
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Force le rechargement du cache
   */
  function invalidateCache(): void {
    figures.value.clear()
    isLoaded.value = false
    lastFetchTime.value = null
  }

  return {
    // State
    figures,
    isLoaded,
    isLoading,
    error,

    // Getters
    isCacheValid,
    getFigure,

    // Actions
    fetchFigures,
    invalidateCache,
  }
})
